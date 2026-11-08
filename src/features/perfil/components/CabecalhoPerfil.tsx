"use client";

import { useState } from "react";

import type { Perfil } from "@/shared/sessao/tipos";
import { Avatar, Botao, Cartao, SeloStatus } from "@/shared/ui";

import { ModalMiniBio } from "./ModalMiniBio";

export function CabecalhoPerfil({ perfil }: { perfil: Perfil }) {
  const [editandoMiniBio, setEditandoMiniBio] = useState(false);
  const { filiado } = perfil.papeis;

  return (
    <Cartao className="flex flex-col gap-4 p-6 sm:flex-row sm:gap-6">
      <Avatar
        nome={perfil.nome_completo}
        imagem={perfil.foto_perfil}
        tamanho="lg"
        className="max-sm:size-16 max-sm:text-h3"
      />
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <div className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <h2 className="text-h3">{perfil.nome_completo}</h2>
            <SeloStatus tom={filiado ? "aqua" : "neutro"}>
              {filiado ? "Filiado PMI-DF" : "Não-Filiado"}
            </SeloStatus>
          </div>
          {perfil.email && (
            <p className="text-corpo-pequeno break-words text-texto-secundario">{perfil.email}</p>
          )}
        </div>
        {perfil.mini_bio ? (
          <p className="text-corpo-pequeno break-words whitespace-pre-line">{perfil.mini_bio}</p>
        ) : (
          <p className="text-corpo-pequeno text-texto-secundario">
            Adicione uma mini bio para ser reconhecido pelos demais membros do capítulo.
          </p>
        )}
        <div>
          <Botao variante="secundario" tamanho="sm" onClick={() => setEditandoMiniBio(true)}>
            Editar mini bio
          </Botao>
        </div>
      </div>
      {editandoMiniBio && (
        <ModalMiniBio miniBio={perfil.mini_bio} aoFechar={() => setEditandoMiniBio(false)} />
      )}
    </Cartao>
  );
}
