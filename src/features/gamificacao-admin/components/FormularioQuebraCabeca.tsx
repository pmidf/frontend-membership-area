"use client";

import type { ReactNode } from "react";
import { useFormContext, useWatch } from "react-hook-form";

import { CampoAreaTexto, CampoTexto, Cartao } from "@/shared/ui";

import {
  TAMANHO_MAXIMO_LEGENDA,
  TAMANHO_MAXIMO_NOME,
  type DadosQuebraCabeca,
} from "../schemas/quebra-cabeca.schema";
import { CamposRecortes } from "./CamposRecortes";

function Bloco({
  titulo,
  subtitulo,
  children,
}: {
  titulo: string;
  subtitulo?: string;
  children: ReactNode;
}) {
  return (
    <Cartao className="flex flex-col gap-5 p-5 md:p-6">
      <header className="flex flex-col gap-1">
        <h2 className="text-lg font-bold">{titulo}</h2>
        {subtitulo && <p className="text-corpo-pequeno text-texto-secundario">{subtitulo}</p>}
      </header>
      {children}
    </Cartao>
  );
}

export function FormularioQuebraCabeca() {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<DadosQuebraCabeca>();
  const legenda = useWatch({ control, name: "legenda" });

  return (
    <>
      <Bloco titulo="Informações básicas">
        <CampoTexto
          rotulo="Nome do quebra-cabeça"
          placeholder="Fundação do PMI-DF — 10 anos"
          maxLength={TAMANHO_MAXIMO_NOME}
          erro={errors.nome?.message}
          {...register("nome")}
        />
        <CampoTexto
          rotulo="Legenda curta"
          placeholder="Registro da fundação do capítulo em 2015"
          ajuda={`Mostrada aos filiados quando o quebra-cabeça é concluído · ${legenda.length} de ${TAMANHO_MAXIMO_LEGENDA} caracteres`}
          erro={errors.legenda?.message}
          {...register("legenda")}
        />
        <CampoAreaTexto
          rotulo="História por trás da imagem"
          placeholder="Foto da cerimônia de fundação do PMI-DF, com os primeiros voluntários e a diretoria original."
          rows={4}
          erro={errors.historia?.message}
          {...register("historia")}
        />
      </Bloco>
      <Bloco
        titulo="Imagem e peças"
        subtitulo="JPG, PNG ou WebP · proporção 4:2 (deitada) · sempre 8 peças (grade 2×4). A imagem só é revelada aos filiados quando o quebra-cabeça é concluído."
      >
        <CampoTexto
          rotulo="URL da imagem completa"
          type="url"
          inputMode="url"
          placeholder="https://…/imagem-completa.jpg"
          erro={errors.imagem_original?.message}
          {...register("imagem_original")}
        />
        <CamposRecortes />
      </Bloco>
      <Bloco
        titulo="Ordem das peças"
        subtitulo="Regra fixa da plataforma — não é configurável por quebra-cabeça."
      >
        <div className="flex gap-3 rounded-lg border-2 border-acao-primaria bg-violeta-50 p-4">
          <span aria-hidden="true" className="text-xl leading-none">
            🔀
          </span>
          <div className="flex flex-col gap-1">
            <p className="font-medium">Sempre em ordem aleatória</p>
            <p className="text-corpo-pequeno text-texto-secundario">
              Cada crédito gasto sorteia 1 peça entre as que ainda faltam. Nunca em sequência fixa —
              garante a surpresa em todo quebra-cabeça.
            </p>
          </div>
        </div>
      </Bloco>
    </>
  );
}
