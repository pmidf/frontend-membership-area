"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

import { CampoTexto, type PropsCampoTexto } from "./CampoTexto";

export type PropsCampoSenha = Omit<PropsCampoTexto, "type" | "iconeDireita">;

export function CampoSenha(props: PropsCampoSenha) {
  const [visivel, setVisivel] = useState(false);
  const Icone = visivel ? EyeOff : Eye;

  return (
    <CampoTexto
      {...props}
      type={visivel ? "text" : "password"}
      iconeDireita={
        <button
          type="button"
          aria-label={visivel ? "Ocultar senha" : "Mostrar senha"}
          aria-pressed={visivel}
          onClick={() => setVisivel((atual) => !atual)}
          className="rounded-sm p-2 text-texto-secundario hover:text-texto-primario focus-visible:outline-2 focus-visible:outline-acao-destaque"
        >
          <Icone aria-hidden="true" className="size-5" />
        </button>
      }
    />
  );
}
