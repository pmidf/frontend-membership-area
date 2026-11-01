import { cn } from "../lib/cn";

export function classesEntrada(comErro: boolean, extra?: string): string {
  return cn(
    "w-full rounded-md border bg-fundo-campo px-4 text-corpo text-texto-primario transition-colors",
    "placeholder:text-texto-placeholder",
    "focus:border-acao-primaria focus:ring-2 focus:ring-acao-destaque focus:outline-none",
    "read-only:bg-neutro-100 disabled:cursor-not-allowed disabled:bg-neutro-100",
    comErro ? "border-texto-erro" : "border-borda-padrao",
    extra,
  );
}
