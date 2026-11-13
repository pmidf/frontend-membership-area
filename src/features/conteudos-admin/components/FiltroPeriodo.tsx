"use client";

import { useState, type FormEvent } from "react";

import { Botao, CampoTexto } from "@/shared/ui";

import { erroDoPeriodo, type PeriodoTela } from "../lib/periodo-estatisticas";

type PropsFiltroPeriodo = {
  periodo: PeriodoTela;
  aoAplicar: (periodo: PeriodoTela) => void;
};

export function FiltroPeriodo({ periodo, aoAplicar }: PropsFiltroPeriodo) {
  const [rascunho, setRascunho] = useState(periodo);
  const [erro, setErro] = useState<string>();

  function aplicar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const invalido = erroDoPeriodo(rascunho);
    setErro(invalido);
    if (!invalido) aoAplicar(rascunho);
  }

  function mudar(campo: keyof PeriodoTela, valor: string) {
    setRascunho((atual) => ({ ...atual, [campo]: valor }));
    setErro(undefined);
  }

  return (
    <form
      noValidate
      onSubmit={aplicar}
      aria-label="Período"
      className="flex flex-col gap-3 sm:flex-row sm:items-start"
    >
      <CampoTexto
        rotulo="De"
        type="date"
        value={rascunho.de}
        erro={erro}
        onChange={(evento) => mudar("de", evento.target.value)}
        className="sm:w-48"
      />
      <CampoTexto
        rotulo="Até"
        type="date"
        value={rascunho.ate}
        aria-invalid={erro ? true : undefined}
        onChange={(evento) => mudar("ate", evento.target.value)}
        className="sm:w-48"
      />
      <Botao type="submit" variante="secundario" className="sm:mt-7">
        Aplicar
      </Botao>
    </form>
  );
}
