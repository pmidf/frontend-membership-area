import { cn } from "@/shared/ui";

type PropsBarraProgressoTrilha = {
  titulo: string;
  vistos: number;
  total: number;
  className?: string;
};

export function BarraProgressoTrilha({
  titulo,
  vistos,
  total,
  className,
}: PropsBarraProgressoTrilha) {
  const percentual = total === 0 ? 0 : Math.round((Math.min(vistos, total) * 100) / total);
  return (
    <div
      role="progressbar"
      aria-label={`Progresso na trilha ${titulo}`}
      aria-valuemin={0}
      aria-valuemax={total}
      aria-valuenow={vistos}
      className={cn("h-1.5 overflow-hidden rounded-pill bg-violeta-50", className)}
    >
      <div className="h-full rounded-pill bg-acao-primaria" style={{ width: `${percentual}%` }} />
    </div>
  );
}
