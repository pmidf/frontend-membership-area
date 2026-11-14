import { CircleAlert } from "lucide-react";
import type { ReactNode } from "react";

import { Botao } from "../botao/Botao";
import { cn } from "../lib/cn";

type PropsEstadoErro = {
  titulo?: ReactNode;
  mensagem?: ReactNode;
  aoTentarNovamente?: () => void;
  compacto?: boolean;
  className?: string;
};

export function EstadoErro({
  titulo = "Não foi possível carregar",
  mensagem = "Verifique sua conexão e tente novamente.",
  aoTentarNovamente,
  compacto = false,
  className,
}: PropsEstadoErro) {
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center gap-3 text-center",
        compacto ? "px-4 py-6" : "px-4 py-12",
        className,
      )}
    >
      <CircleAlert aria-hidden="true" className="size-8 text-texto-erro" />
      <p className={compacto ? "text-corpo font-medium" : "text-h3"}>{titulo}</p>
      <p className="max-w-md text-corpo-pequeno text-texto-secundario">{mensagem}</p>
      {aoTentarNovamente && (
        <Botao variante="secundario" tamanho="sm" onClick={aoTentarNovamente}>
          Tentar novamente
        </Botao>
      )}
    </div>
  );
}
