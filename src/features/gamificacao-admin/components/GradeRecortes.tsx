"use client";

import Image from "next/image";
import { useState } from "react";

import { cn } from "@/shared/ui";

import { ehImagemValida } from "../schemas/quebra-cabeca.schema";

function Recorte({ numero, url }: { numero: number; url: string }) {
  const [falhou, setFalhou] = useState(false);
  const mostrar = ehImagemValida(url) && !falhou;

  return (
    <li
      data-preenchido={mostrar}
      className="relative flex aspect-square items-center justify-center overflow-hidden rounded-sm bg-neutro-200 text-h3 text-texto-secundario"
    >
      {mostrar ? (
        <Image
          src={url}
          alt={`Peça ${numero}`}
          fill
          unoptimized
          sizes="96px"
          className="object-cover"
          onError={() => setFalhou(true)}
        />
      ) : (
        <span aria-label={`Peça ${numero} sem imagem`}>{numero}</span>
      )}
    </li>
  );
}

type PropsGradeRecortes = {
  recortes: string[];
  className?: string;
};

export function GradeRecortes({ recortes, className }: PropsGradeRecortes) {
  return (
    <ol
      aria-label="Pré-visualização da grade 2×4"
      className={cn("grid grid-cols-4 gap-2", className)}
    >
      {recortes.map((url, indice) => (
        <Recorte key={indice} numero={indice + 1} url={url.trim()} />
      ))}
    </ol>
  );
}
