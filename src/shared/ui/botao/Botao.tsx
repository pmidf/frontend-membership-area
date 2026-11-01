import { LoaderCircle } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";

import { cn } from "../lib/cn";

type Variante = "primario" | "secundario" | "fantasma" | "perigo" | "link";
type Tamanho = "md" | "sm";

const variantes: Record<Variante, string> = {
  primario: "bg-acao-primaria text-texto-inverso hover:bg-violeta-800",
  secundario:
    "border border-acao-primaria bg-fundo-superficie text-texto-marca hover:bg-violeta-50",
  fantasma: "bg-transparent text-texto-marca hover:bg-violeta-50",
  perigo: "bg-texto-erro text-texto-inverso hover:brightness-90",
  link: "bg-transparent px-0 text-texto-marca underline-offset-4 hover:underline",
};

const tamanhos: Record<Tamanho, string> = {
  md: "min-h-12 px-6 text-botao",
  sm: "min-h-9 px-4 text-corpo-pequeno font-medium",
};

export type PropsBotao = ComponentProps<"button"> & {
  variante?: Variante;
  tamanho?: Tamanho;
  larguraTotal?: boolean;
  carregando?: boolean;
  icone?: ReactNode;
};

export function Botao({
  variante = "primario",
  tamanho = "md",
  larguraTotal = false,
  carregando = false,
  icone,
  className,
  children,
  onClick,
  type = "button",
  ...props
}: PropsBotao) {
  return (
    <button
      type={type}
      aria-busy={carregando || undefined}
      aria-disabled={carregando || undefined}
      onClick={carregando ? undefined : onClick}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-pill transition-colors",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acao-destaque",
        "disabled:cursor-not-allowed disabled:opacity-60",
        variantes[variante],
        tamanhos[tamanho],
        variante === "link" && "min-h-0",
        larguraTotal && "w-full",
        carregando && "cursor-progress",
        className,
      )}
      {...props}
    >
      {carregando ? <LoaderCircle aria-hidden="true" className="size-4 animate-spin" /> : icone}
      {children}
    </button>
  );
}
