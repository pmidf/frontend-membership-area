import { LoaderCircle } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";

import { cn } from "../lib/cn";

export type VarianteBotao =
  "primario" | "secundario" | "fantasma" | "perigo" | "perigoContorno" | "link" | "inverso";
export type TamanhoBotao = "md" | "sm";

const variantes: Record<VarianteBotao, string> = {
  primario: "bg-acao-primaria text-texto-inverso hover:bg-violeta-800",
  secundario:
    "border border-acao-primaria bg-fundo-superficie text-texto-marca hover:bg-violeta-50",
  fantasma: "bg-transparent text-texto-marca hover:bg-violeta-50",
  perigo: "bg-texto-erro text-texto-inverso hover:brightness-90",
  perigoContorno: "border border-texto-erro bg-fundo-superficie text-texto-erro hover:bg-erro-50",
  link: "min-h-0 bg-transparent px-0 text-texto-marca underline-offset-4 hover:underline",
  inverso: "bg-branco text-texto-marca hover:bg-violeta-50",
};

const tamanhos: Record<TamanhoBotao, string> = {
  md: "min-h-12 px-6 text-botao",
  sm: "min-h-9 px-4 text-corpo-pequeno font-medium",
};

type EstiloBotao = {
  variante?: VarianteBotao;
  tamanho?: TamanhoBotao;
  larguraTotal?: boolean;
};

export function classesBotao({
  variante = "primario",
  tamanho = "md",
  larguraTotal = false,
}: EstiloBotao = {}): string {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-pill text-center transition-colors",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acao-destaque",
    "disabled:cursor-not-allowed disabled:opacity-60",
    tamanhos[tamanho],
    variantes[variante],
    larguraTotal && "w-full",
  );
}

export type PropsBotao = ComponentProps<"button"> &
  EstiloBotao & {
    carregando?: boolean;
    icone?: ReactNode;
  };

export function Botao({
  variante,
  tamanho,
  larguraTotal,
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
        classesBotao({ variante, tamanho, larguraTotal }),
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
