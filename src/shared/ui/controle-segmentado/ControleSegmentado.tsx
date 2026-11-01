import { useId, type ReactNode } from "react";

import { cn } from "../lib/cn";

export type OpcaoSegmento<V extends string> = { valor: V; rotulo: ReactNode };

type PropsControleSegmentado<V extends string> = {
  rotulo: ReactNode;
  opcoes: OpcaoSegmento<V>[];
  valor: V | undefined;
  aoMudar: (valor: V) => void;
  nome?: string;
  erro?: string;
  className?: string;
};

export function ControleSegmentado<V extends string>({
  rotulo,
  opcoes,
  valor,
  aoMudar,
  nome,
  erro,
  className,
}: PropsControleSegmentado<V>) {
  const gerado = useId();
  const idRotulo = `${gerado}-rotulo`;
  const idErro = `${gerado}-erro`;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <span id={idRotulo} className="text-rotulo text-texto-primario">
        {rotulo}
      </span>
      <div
        role="radiogroup"
        aria-labelledby={idRotulo}
        aria-describedby={erro ? idErro : undefined}
        aria-invalid={erro ? true : undefined}
        className="grid auto-cols-fr grid-flow-col gap-2"
      >
        {opcoes.map((opcao) => (
          <label key={opcao.valor} className="relative">
            <input
              type="radio"
              name={nome ?? gerado}
              value={opcao.valor}
              checked={valor === opcao.valor}
              onChange={() => aoMudar(opcao.valor)}
              className="peer sr-only"
            />
            <span
              className={cn(
                "flex min-h-12 cursor-pointer items-center justify-center rounded-md border border-borda-padrao bg-fundo-superficie px-4 text-corpo-pequeno text-texto-primario transition-colors",
                "peer-checked:border-acao-primaria peer-checked:bg-violeta-50 peer-checked:font-medium peer-checked:text-texto-marca",
                "peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-acao-destaque",
              )}
            >
              {opcao.rotulo}
            </span>
          </label>
        ))}
      </div>
      {erro && (
        <p id={idErro} className="text-legenda text-texto-erro">
          {erro}
        </p>
      )}
    </div>
  );
}
