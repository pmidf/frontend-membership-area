"use client";

import { CircleAlert, CircleCheck, Info, X, type LucideIcon } from "lucide-react";
import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from "react";

import { cn } from "../lib/cn";

export type TomAviso = "sucesso" | "erro" | "informacao";

type Aviso = { id: string; tom: TomAviso; mensagem: string };

export type ApiAvisos = Record<TomAviso, (mensagem: string) => void>;

export const ContextoAvisos = createContext<ApiAvisos | null>(null);

const DURACAO_AVISO = 5000;

const estilos: Record<TomAviso, { classe: string; icone: LucideIcon }> = {
  sucesso: { classe: "border-sucesso-700", icone: CircleCheck },
  erro: { classe: "border-erro-700", icone: CircleAlert },
  informacao: { classe: "border-aqua-600", icone: Info },
};

function ItemAviso({ aviso, aoFechar }: { aviso: Aviso; aoFechar: (id: string) => void }) {
  const { classe, icone: Icone } = estilos[aviso.tom];

  useEffect(() => {
    const temporizador = setTimeout(() => aoFechar(aviso.id), DURACAO_AVISO);
    return () => clearTimeout(temporizador);
  }, [aviso.id, aoFechar]);

  return (
    <li
      className={cn(
        "flex items-start gap-3 rounded-md border-l-4 bg-fundo-superficie p-4 shadow-lg",
        classe,
      )}
    >
      <Icone aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-texto-primario" />
      <p className="flex-1 text-corpo-pequeno text-texto-primario">{aviso.mensagem}</p>
      <button
        type="button"
        aria-label="Fechar aviso"
        onClick={() => aoFechar(aviso.id)}
        className="rounded-sm p-1 text-texto-secundario hover:text-texto-primario focus-visible:outline-2 focus-visible:outline-acao-destaque"
      >
        <X aria-hidden="true" className="size-4" />
      </button>
    </li>
  );
}

export function ProvedorAvisos({ children }: { children: ReactNode }) {
  const [avisos, setAvisos] = useState<Aviso[]>([]);

  const fechar = useCallback((id: string) => {
    setAvisos((atuais) => atuais.filter((aviso) => aviso.id !== id));
  }, []);

  const api = useMemo<ApiAvisos>(() => {
    const adicionar = (tom: TomAviso) => (mensagem: string) => {
      const id = crypto.randomUUID();
      setAvisos((atuais) => [...atuais, { id, tom, mensagem }]);
    };
    return {
      sucesso: adicionar("sucesso"),
      erro: adicionar("erro"),
      informacao: adicionar("informacao"),
    };
  }, []);

  return (
    <ContextoAvisos.Provider value={api}>
      {children}
      <div
        aria-live="polite"
        aria-label="Avisos"
        role="region"
        className="pointer-events-none fixed inset-x-4 top-4 z-50 flex justify-end md:inset-x-auto md:top-auto md:right-6 md:bottom-6"
      >
        <ol className="pointer-events-auto flex w-full max-w-sm flex-col gap-2">
          {avisos.map((aviso) => (
            <ItemAviso key={aviso.id} aviso={aviso} aoFechar={fechar} />
          ))}
        </ol>
      </div>
    </ContextoAvisos.Provider>
  );
}
