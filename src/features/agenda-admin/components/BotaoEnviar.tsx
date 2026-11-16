"use client";

import { Button, type BotaoTipo } from "@/components/ui/Button";

type BotaoEnviarProps = {
  children: React.ReactNode;
  enviando: string;
  pendente: boolean;
  tipo?: BotaoTipo;
  type?: "submit" | "button";
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
};

export function BotaoEnviar({
  children,
  enviando,
  pendente,
  tipo,
  type = "submit",
  onClick,
  disabled,
  className,
}: BotaoEnviarProps) {
  return (
    <Button
      type={type}
      tipo={tipo}
      onClick={onClick}
      disabled={disabled || pendente}
      aria-busy={pendente}
      className={className}
    >
      {pendente ? enviando : children}
    </Button>
  );
}
