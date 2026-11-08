"use client";

import { Search, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

import { classesEntrada } from "../campo/classes-entrada";
import { cn } from "../lib/cn";

type PropsCampoBusca = {
  rotulo: string;
  aoBuscar: (termo: string) => void;
  valorInicial?: string;
  placeholder?: string;
  atraso?: number;
  maxLength?: number;
  desabilitado?: boolean;
  className?: string;
};

export function CampoBusca({
  rotulo,
  aoBuscar,
  valorInicial = "",
  placeholder,
  atraso = 300,
  maxLength,
  desabilitado = false,
  className,
}: PropsCampoBusca) {
  const id = useId();
  const [termo, setTermo] = useState(valorInicial);
  const ultimoBuscado = useRef(valorInicial);
  const aoBuscarAtual = useRef(aoBuscar);

  useEffect(() => {
    aoBuscarAtual.current = aoBuscar;
  }, [aoBuscar]);

  useEffect(() => {
    if (termo === ultimoBuscado.current) return;
    const temporizador = setTimeout(() => {
      ultimoBuscado.current = termo;
      aoBuscarAtual.current(termo);
    }, atraso);
    return () => clearTimeout(temporizador);
  }, [termo, atraso]);

  return (
    <div className={cn("relative", className)}>
      <label htmlFor={id} className="sr-only">
        {rotulo}
      </label>
      <Search
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-texto-placeholder"
      />
      <input
        id={id}
        type="search"
        value={termo}
        maxLength={maxLength}
        disabled={desabilitado}
        placeholder={placeholder}
        onChange={(evento) => setTermo(evento.target.value)}
        className={classesEntrada(
          false,
          "h-12 pr-12 pl-11 [&::-webkit-search-cancel-button]:hidden",
        )}
      />
      {termo && (
        <button
          type="button"
          aria-label="Limpar busca"
          onClick={() => setTermo("")}
          className="absolute top-1/2 right-2 -translate-y-1/2 rounded-sm p-2 text-texto-secundario hover:text-texto-primario focus-visible:outline-2 focus-visible:outline-acao-destaque"
        >
          <X aria-hidden="true" className="size-4" />
        </button>
      )}
    </div>
  );
}
