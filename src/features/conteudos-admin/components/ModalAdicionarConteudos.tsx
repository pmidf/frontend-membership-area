"use client";

import { Check } from "lucide-react";
import { useState } from "react";

import { MiniaturaConteudo } from "@/features/conteudos/components/MiniaturaConteudo";
import type { TipoConteudo } from "@/features/conteudos/tipos/conteudo";
import {
  Botao,
  CampoBusca,
  EstadoErro,
  EstadoVazio,
  Esqueleto,
  FiltrosChip,
  Modal,
  Paginacao,
} from "@/shared/ui";

import { useConteudosAdmin } from "../api/conteudos-admin.queries";
import { itemDoConteudo, legendaItemTrilha } from "../lib/valores-trilha";
import type { ItemTrilhaAdmin } from "../tipos/trilha-admin";

const opcoesTipo = [
  { valor: "", rotulo: "Tudo" },
  { valor: "VIDEO", rotulo: "Vídeos" },
  { valor: "MATERIAL", rotulo: "Materiais" },
];

type PropsLista = {
  selecionados: string[];
  aoAdicionar: (item: ItemTrilhaAdmin) => void;
};

function ListaBiblioteca({ selecionados, aoAdicionar }: PropsLista) {
  const [termo, setTermo] = useState("");
  const [tipo, setTipo] = useState("");
  const [pagina, setPagina] = useState(1);
  const consulta = useConteudosAdmin({
    ...(termo && { q: termo }),
    ...(tipo && { tipo: tipo as TipoConteudo }),
    page: pagina,
  });
  const conteudos = consulta.data?.itens.filter(({ situacao }) => situacao !== "ARQUIVADO") ?? [];

  function corpo() {
    if (consulta.isPending) {
      return <Esqueleto variante="linha" quantidade={4} rotulo="Carregando a biblioteca…" />;
    }
    if (consulta.isError) {
      return (
        <EstadoErro
          compacto
          mensagem="Não foi possível carregar a biblioteca."
          aoTentarNovamente={() => void consulta.refetch()}
        />
      );
    }
    if (conteudos.length === 0) {
      return (
        <EstadoVazio
          titulo="Nenhum conteúdo encontrado"
          descricao="Tente outro termo ou outro tipo."
        />
      );
    }
    return (
      <ul aria-label="Conteúdos da biblioteca" className="flex flex-col gap-2">
        {conteudos.map((conteudo) => {
          const item = itemDoConteudo(conteudo);
          const naTrilha = selecionados.includes(conteudo.id_conteudo);
          return (
            <li
              key={conteudo.id_conteudo}
              className={
                naTrilha
                  ? "flex items-center gap-3 rounded-md bg-violeta-50 px-3 py-2.5"
                  : "flex items-center gap-3 rounded-md border border-borda-padrao px-3 py-2.5"
              }
            >
              <MiniaturaConteudo tipo={conteudo.tipo} className="max-sm:hidden" />
              <div className="min-w-0 flex-1">
                <p className="text-corpo-pequeno font-medium break-words">{conteudo.titulo}</p>
                <p className="text-legenda text-texto-secundario">{legendaItemTrilha(item)}</p>
              </div>
              {naTrilha ? (
                <span className="inline-flex shrink-0 items-center gap-1 text-corpo-pequeno text-texto-secundario">
                  <Check aria-hidden="true" className="size-4" />
                  Na trilha
                </span>
              ) : (
                <Botao
                  variante="secundario"
                  tamanho="sm"
                  aria-label={`Adicionar ${conteudo.titulo}`}
                  onClick={() => aoAdicionar(item)}
                >
                  Adicionar
                </Botao>
              )}
            </li>
          );
        })}
      </ul>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <CampoBusca
          rotulo="Buscar na biblioteca"
          placeholder="Buscar por título ou descrição"
          aoBuscar={(novoTermo) => {
            setTermo(novoTermo);
            setPagina(1);
          }}
          className="sm:flex-1"
        />
        <FiltrosChip
          rotulo="Tipo de conteúdo"
          opcoes={opcoesTipo}
          selecionados={[tipo]}
          aoMudar={([valor = ""]) => {
            setTipo(valor);
            setPagina(1);
          }}
        />
      </div>
      {corpo()}
      {consulta.data && (
        <Paginacao pagina={pagina} totalPaginas={consulta.data.total_paginas} aoMudar={setPagina} />
      )}
    </div>
  );
}

type PropsModalAdicionarConteudos = PropsLista & {
  aberto: boolean;
  aoFechar: () => void;
};

export function ModalAdicionarConteudos({
  aberto,
  aoFechar,
  selecionados,
  aoAdicionar,
}: PropsModalAdicionarConteudos) {
  const quantidade = selecionados.length;
  return (
    <Modal
      aberto={aberto}
      aoFechar={aoFechar}
      largura="lg"
      titulo="Adicionar conteúdos"
      descricao="Escolha vídeos e materiais da biblioteca. Eles entram no fim da trilha. Conteúdos arquivados não aparecem."
      rodape={
        <div className="flex w-full items-center justify-between gap-4">
          <p aria-live="polite" className="text-corpo-pequeno text-texto-secundario">
            {quantidade === 1 ? "1 conteúdo na trilha" : `${quantidade} conteúdos na trilha`}
          </p>
          <Botao onClick={aoFechar}>Concluir</Botao>
        </div>
      }
    >
      {aberto && <ListaBiblioteca selecionados={selecionados} aoAdicionar={aoAdicionar} />}
    </Modal>
  );
}
