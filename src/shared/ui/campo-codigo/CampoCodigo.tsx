"use client";

import { useId, useRef, type ClipboardEvent, type KeyboardEvent, type ReactNode } from "react";

import { cn } from "../lib/cn";

type PropsCampoCodigo = {
  rotulo: ReactNode;
  valor: string;
  aoMudar: (valor: string) => void;
  aoCompletar?: (valor: string) => void;
  quantidade?: number;
  erro?: string;
  ajuda?: ReactNode;
  desabilitado?: boolean;
  focarAoMontar?: boolean;
};

function somenteDigitos(texto: string): string {
  return texto.replace(/\D/g, "");
}

export function CampoCodigo({
  rotulo,
  valor,
  aoMudar,
  aoCompletar,
  quantidade = 6,
  erro,
  ajuda,
  desabilitado = false,
  focarAoMontar = false,
}: PropsCampoCodigo) {
  const gerado = useId();
  const idRotulo = `${gerado}-rotulo`;
  const idDescricao = `${gerado}-descricao`;
  const caixas = useRef<(HTMLInputElement | null)[]>([]);
  const digitos = Array.from({ length: quantidade }, (_, indice) => valor[indice] ?? "");

  function focar(indice: number) {
    caixas.current[Math.max(0, Math.min(indice, quantidade - 1))]?.focus();
  }

  function preencherAPartirDe(indice: number, entrada: string) {
    const novos = [...digitos];
    somenteDigitos(entrada)
      .slice(0, quantidade - indice)
      .split("")
      .forEach((digito, deslocamento) => {
        novos[indice + deslocamento] = digito;
      });
    const codigo = novos.join("");
    aoMudar(codigo);
    focar(indice + somenteDigitos(entrada).length);
    if (codigo.length === quantidade && !novos.includes("")) aoCompletar?.(codigo);
  }

  function aoDigitar(indice: number, entrada: string) {
    const limpa = somenteDigitos(entrada);
    if (!limpa) return;
    const substituiuDigito = Boolean(digitos[indice]) && limpa.length === 2;
    preencherAPartirDe(indice, substituiuDigito ? limpa.replace(digitos[indice], "") : limpa);
  }

  function aoPressionar(indice: number, evento: KeyboardEvent<HTMLInputElement>) {
    if (evento.key === "Backspace" && !digitos[indice] && indice > 0) {
      evento.preventDefault();
      const novos = [...digitos];
      novos[indice - 1] = "";
      aoMudar(novos.join(""));
      focar(indice - 1);
    }
    if (evento.key === "Backspace" && digitos[indice]) {
      evento.preventDefault();
      const novos = [...digitos];
      novos[indice] = "";
      aoMudar(novos.join(""));
    }
    if (evento.key === "ArrowLeft") focar(indice - 1);
    if (evento.key === "ArrowRight") focar(indice + 1);
  }

  function aoColar(indice: number, evento: ClipboardEvent<HTMLInputElement>) {
    evento.preventDefault();
    preencherAPartirDe(indice, evento.clipboardData.getData("text"));
  }

  return (
    <div className="flex flex-col gap-1.5">
      <span id={idRotulo} className="text-rotulo text-texto-primario">
        {rotulo}
      </span>
      <div
        role="group"
        aria-labelledby={idRotulo}
        aria-describedby={erro || ajuda ? idDescricao : undefined}
        className="flex gap-2"
      >
        {digitos.map((digito, indice) => (
          <input
            key={indice}
            ref={(elemento) => {
              caixas.current[indice] = elemento;
            }}
            value={digito}
            onChange={(evento) => aoDigitar(indice, evento.target.value)}
            onKeyDown={(evento) => aoPressionar(indice, evento)}
            onPaste={(evento) => aoColar(indice, evento)}
            onFocus={(evento) => evento.target.select()}
            inputMode="numeric"
            autoComplete={indice === 0 ? "one-time-code" : "off"}
            autoFocus={focarAoMontar && indice === 0}
            disabled={desabilitado}
            aria-label={`Dígito ${indice + 1} de ${quantidade}`}
            aria-invalid={erro ? true : undefined}
            className={cn(
              "size-12 rounded-md border bg-fundo-campo text-center text-h3 text-texto-primario",
              "focus:border-acao-primaria focus:ring-2 focus:ring-acao-destaque focus:outline-none",
              "disabled:bg-neutro-100",
              erro ? "border-texto-erro" : "border-borda-padrao",
            )}
          />
        ))}
      </div>
      {(erro || ajuda) && (
        <p
          id={idDescricao}
          className={cn("text-legenda", erro ? "text-texto-erro" : "text-texto-secundario")}
        >
          {erro ?? ajuda}
        </p>
      )}
    </div>
  );
}
