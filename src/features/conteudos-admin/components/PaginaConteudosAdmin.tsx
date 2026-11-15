"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

import { AbasNavegacao, Botao, CabecalhoPagina } from "@/shared/ui";
import { classesBotao } from "@/shared/ui/botao/Botao";

import { CAMINHO_LISTA_TRILHAS } from "../lib/valores-trilha";
import { AbaConteudosAdmin } from "./AbaConteudosAdmin";
import { AbaTrilhasAdmin } from "./AbaTrilhasAdmin";
import { ModalCategorias } from "./ModalCategorias";

const CAMINHO_CONTEUDOS = "/admin/conteudos";

const abas = [
  { href: CAMINHO_CONTEUDOS, rotulo: "Conteúdos" },
  { href: CAMINHO_LISTA_TRILHAS, rotulo: "Trilhas" },
];

export function PaginaConteudosAdmin() {
  const emTrilhas = useSearchParams().get("aba") === "trilhas";
  const [gerenciandoCategorias, setGerenciandoCategorias] = useState(false);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <CabecalhoPagina
        titulo="Conteúdo"
        subtitulo="Vídeos do capítulo, materiais de apoio e curadoria de links do PMI Global."
        acoes={
          emTrilhas ? (
            <Link href="/admin/conteudos/trilhas/novo" className={classesBotao()}>
              + Nova trilha
            </Link>
          ) : (
            <>
              <Botao variante="secundario" onClick={() => setGerenciandoCategorias(true)}>
                Gerenciar categorias
              </Botao>
              <Link href="/admin/conteudos/novo" className={classesBotao()}>
                + Adicionar conteúdo
              </Link>
            </>
          )
        }
      />
      <AbasNavegacao
        rotulo="Seções do conteúdo"
        links={abas}
        atual={emTrilhas ? CAMINHO_LISTA_TRILHAS : CAMINHO_CONTEUDOS}
      />
      {emTrilhas ? <AbaTrilhasAdmin /> : <AbaConteudosAdmin />}
      <ModalCategorias
        aberto={gerenciandoCategorias}
        aoFechar={() => setGerenciandoCategorias(false)}
      />
    </div>
  );
}
