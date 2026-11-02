import { CircleAlert, CircleCheck, Info, TriangleAlert, X, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "../lib/cn";

export type TomAlerta = "informacao" | "marca" | "sucesso" | "alerta" | "erro";

const estilos: Record<TomAlerta, { classe: string; icone: LucideIcon; cor: string }> = {
  informacao: { classe: "border-aqua-600 bg-aqua-50", icone: Info, cor: "text-aqua-600" },
  marca: { classe: "border-violeta-300 bg-violeta-50", icone: Info, cor: "text-texto-marca" },
  sucesso: {
    classe: "border-sucesso-700 bg-sucesso-50",
    icone: CircleCheck,
    cor: "text-sucesso-700",
  },
  alerta: {
    classe: "border-alerta-700 bg-alerta-50",
    icone: TriangleAlert,
    cor: "text-alerta-700",
  },
  erro: { classe: "border-erro-700 bg-erro-50", icone: CircleAlert, cor: "text-erro-700" },
};

type PropsAlerta = {
  tom?: TomAlerta;
  titulo?: ReactNode;
  children?: ReactNode;
  acao?: ReactNode;
  aoFechar?: () => void;
  className?: string;
};

export function Alerta({
  tom = "informacao",
  titulo,
  children,
  acao,
  aoFechar,
  className,
}: PropsAlerta) {
  const { classe, icone: Icone, cor } = estilos[tom];

  return (
    <div
      role={tom === "erro" ? "alert" : "status"}
      className={cn("flex gap-3 rounded-md border p-4", classe, className)}
    >
      <Icone aria-hidden="true" className={cn("mt-0.5 size-5 shrink-0", cor)} />
      <div className="flex flex-1 flex-col gap-1">
        {titulo && <p className={cn("text-corpo-pequeno font-medium", cor)}>{titulo}</p>}
        {children && <div className="text-corpo-pequeno text-texto-secundario">{children}</div>}
        {acao && <div className="mt-1">{acao}</div>}
      </div>
      {aoFechar && (
        <button
          type="button"
          onClick={aoFechar}
          aria-label="Dispensar aviso"
          className="-m-1 flex size-8 shrink-0 items-center justify-center rounded-sm text-texto-secundario hover:bg-branco/60 focus-visible:outline-2 focus-visible:outline-acao-destaque"
        >
          <X aria-hidden="true" className="size-4" />
        </button>
      )}
    </div>
  );
}
