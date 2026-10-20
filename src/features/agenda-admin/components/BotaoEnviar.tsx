"use client";

import { useFormStatus } from "react-dom";
import { Button, type BotaoTipo } from "@/components/ui/Button";

type BotaoEnviarProps = {
  children: React.ReactNode;
  enviando: string;
  tipo?: BotaoTipo;
  formAction?: (formData: FormData) => void | Promise<void>;
  disabled?: boolean;
  className?: string;
};

/** Botão de envio de formulário com estado de carregamento (ações do console). */
export function BotaoEnviar({ children, enviando, tipo, formAction, disabled, className }: BotaoEnviarProps) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      tipo={tipo}
      formAction={formAction}
      disabled={disabled || pending}
      aria-busy={pending}
      className={className}
    >
      {pending ? enviando : children}
    </Button>
  );
}
