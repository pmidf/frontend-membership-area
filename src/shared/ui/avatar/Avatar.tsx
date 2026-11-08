import Image from "next/image";

import { iniciais } from "@/shared/lib/iniciais";

import { cn } from "../lib/cn";

type Tamanho = "sm" | "md" | "lg";

const tamanhos: Record<Tamanho, { classe: string; pixels: number }> = {
  sm: { classe: "size-8 text-legenda", pixels: 32 },
  md: { classe: "size-10 text-corpo-pequeno", pixels: 40 },
  lg: { classe: "size-22 text-h2", pixels: 88 },
};

const cores = ["bg-violeta-500", "bg-aqua-600", "bg-violeta-800", "bg-erro-700", "bg-sucesso-700"];

function corDoNome(nome: string): string {
  const soma = Array.from(nome).reduce((total, caractere) => total + caractere.charCodeAt(0), 0);
  return cores[soma % cores.length];
}

type PropsAvatar = {
  nome: string;
  imagem?: string | null;
  tamanho?: Tamanho;
  className?: string;
};

export function Avatar({ nome, imagem, tamanho = "md", className }: PropsAvatar) {
  const { classe, pixels } = tamanhos[tamanho];

  if (imagem) {
    return (
      <Image
        src={imagem}
        alt={nome}
        width={pixels}
        height={pixels}
        unoptimized
        className={cn("shrink-0 rounded-pill object-cover", classe, className)}
      />
    );
  }

  return (
    <span
      role="img"
      aria-label={nome}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-pill font-medium text-texto-inverso",
        corDoNome(nome),
        classe,
        className,
      )}
    >
      <span aria-hidden="true">{iniciais(nome)}</span>
    </span>
  );
}
