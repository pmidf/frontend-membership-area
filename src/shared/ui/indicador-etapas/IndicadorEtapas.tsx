import { cn } from "../lib/cn";

type PropsIndicadorEtapas = {
  atual: number;
  total: number;
  titulo: string;
  className?: string;
};

function situacaoDaEtapa(etapa: number, atual: number): string {
  if (etapa < atual) return "concluído";
  if (etapa === atual) return "atual";
  return "pendente";
}

export function IndicadorEtapas({ atual, total, titulo, className }: PropsIndicadorEtapas) {
  const etapas = Array.from({ length: total }, (_, indice) => indice + 1);

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <p className="text-legenda font-medium text-texto-marca">
        Passo {atual} de {total} · {titulo}
      </p>
      <ol aria-label="Progresso do cadastro" className="grid auto-cols-fr grid-flow-col gap-1.5">
        {etapas.map((etapa) => (
          <li
            key={etapa}
            aria-current={etapa === atual ? "step" : undefined}
            className={cn(
              "h-1 rounded-pill",
              etapa <= atual ? "bg-acao-primaria" : "bg-borda-padrao",
            )}
          >
            <span className="sr-only">
              Passo {etapa}: {situacaoDaEtapa(etapa, atual)}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
