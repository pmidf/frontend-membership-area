import { cn } from "../lib/cn";

const limites = {
  1: "line-clamp-1",
  2: "line-clamp-2",
  3: "line-clamp-3",
} as const;

type PropsTextoTruncado = {
  texto: string;
  linhas?: keyof typeof limites;
  className?: string;
};

export function TextoTruncado({ texto, linhas = 2, className }: PropsTextoTruncado) {
  return (
    <p title={texto} className={cn(limites[linhas], className)}>
      {texto}
    </p>
  );
}
