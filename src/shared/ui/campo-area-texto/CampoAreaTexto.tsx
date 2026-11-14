"use client";

import { useState, type ChangeEvent, type ComponentProps, type ReactNode } from "react";

import { classesEntrada } from "../campo/classes-entrada";
import { EstruturaCampo } from "../campo/EstruturaCampo";
import { useIdsCampo } from "../campo/useIdsCampo";

export type PropsCampoAreaTexto = ComponentProps<"textarea"> & {
  rotulo: ReactNode;
  ajuda?: ReactNode;
  erro?: string;
};

function tamanhoInicial(valor: ComponentProps<"textarea">["value"]): number {
  return typeof valor === "string" ? valor.length : 0;
}

export function CampoAreaTexto({
  rotulo,
  ajuda,
  erro,
  id,
  className,
  maxLength,
  onChange,
  rows = 4,
  ...props
}: PropsCampoAreaTexto) {
  const ids = useIdsCampo(id, Boolean(ajuda), Boolean(erro));
  const [tamanho, setTamanho] = useState(() => tamanhoInicial(props.value ?? props.defaultValue));
  const idContador = `${ids.idCampo}-contador`;

  function aoMudar(evento: ChangeEvent<HTMLTextAreaElement>) {
    setTamanho(evento.target.value.length);
    onChange?.(evento);
  }

  return (
    <EstruturaCampo
      {...ids}
      rotulo={rotulo}
      ajuda={ajuda}
      erro={erro}
      className={className}
      rodape={
        maxLength !== undefined && (
          <p id={idContador} className="ml-auto shrink-0 text-legenda text-texto-secundario">
            {tamanho}/{maxLength}
          </p>
        )
      }
    >
      <textarea
        id={ids.idCampo}
        rows={rows}
        maxLength={maxLength}
        aria-invalid={erro ? true : undefined}
        aria-describedby={
          [ids.descricao, maxLength !== undefined ? idContador : undefined]
            .filter(Boolean)
            .join(" ") || undefined
        }
        onChange={aoMudar}
        className={classesEntrada(Boolean(erro), "resize-y py-3")}
        {...props}
      />
    </EstruturaCampo>
  );
}
