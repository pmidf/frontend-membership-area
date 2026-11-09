"use client";

import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { rotulosCategoria } from "@/features/beneficios/lib/rotulos-beneficio";
import { SeloStatus, Tabela, type ColunaTabela } from "@/shared/ui";

import { rotulosFormaResgate, rotulosSituacao, textoVigencia } from "../lib/rotulos";
import type { ItemBeneficioAdmin, OrdenacaoBeneficio } from "../tipos/beneficio-admin";

type PropsTabela = {
  beneficios: ItemBeneficioAdmin[];
  carregando: boolean;
  vazio: ReactNode;
  ordenar: OrdenacaoBeneficio | "";
  consultaAtual: string;
  aoOrdenar: (ordenar: OrdenacaoBeneficio) => void;
};

const classesLink =
  "text-corpo-pequeno font-medium whitespace-nowrap text-texto-marca underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-acao-destaque";

const ordenacaoAria = {
  resgates_desc: "descending",
  resgates_asc: "ascending",
  "": "none",
} as const;

const iconesOrdenacao = { resgates_desc: ArrowDown, resgates_asc: ArrowUp, "": ArrowUpDown };

function colunas({
  ordenar,
  consultaAtual,
  aoOrdenar,
}: Pick<
  PropsTabela,
  "ordenar" | "consultaAtual" | "aoOrdenar"
>): ColunaTabela<ItemBeneficioAdmin>[] {
  const sufixo = consultaAtual ? `?${consultaAtual}` : "";
  const IconeOrdenacao = iconesOrdenacao[ordenar];

  return [
    {
      id: "beneficio",
      cabecalho: "Benefício",
      celula: ({ titulo, categoria }) => (
        <span className="flex flex-col gap-0.5">
          <span className="font-medium">{titulo}</span>
          <span className="text-legenda text-texto-secundario">
            Categoria: {rotulosCategoria[categoria].rotulo}
          </span>
        </span>
      ),
    },
    { id: "parceiro", cabecalho: "Parceiro", celula: ({ parceiro }) => parceiro },
    {
      id: "forma",
      cabecalho: "Forma de resgate",
      ocultarNoCartao: true,
      celula: ({ tipo_resgate }) => rotulosFormaResgate[tipo_resgate],
    },
    { id: "vigencia", cabecalho: "Vigência", celula: (item) => textoVigencia(item) },
    {
      id: "resgates",
      cabecalho: (
        <button
          type="button"
          onClick={() => aoOrdenar(ordenar === "resgates_desc" ? "resgates_asc" : "resgates_desc")}
          className="inline-flex items-center gap-1 rounded-sm font-medium hover:text-texto-primario focus-visible:outline-2 focus-visible:outline-acao-destaque"
        >
          Resgates
          <IconeOrdenacao aria-hidden="true" className="size-3.5" />
        </button>
      ),
      cabecalhoCartao: "Resgates",
      ordenacao: ordenacaoAria[ordenar],
      celula: ({ quantidade_resgates }) => quantidade_resgates,
    },
    {
      id: "status",
      cabecalho: "Status",
      celula: ({ situacao }) => (
        <SeloStatus tom={rotulosSituacao[situacao].tom}>
          {rotulosSituacao[situacao].rotulo}
        </SeloStatus>
      ),
    },
    {
      id: "acao",
      cabecalho: <span className="sr-only">Ações</span>,
      celula: ({ id_beneficio, titulo, situacao }) => {
        const rotulo = situacao === "ARQUIVADO" ? "Ver" : "Editar";
        return (
          <Link
            href={`/admin/beneficios/${id_beneficio}${sufixo}`}
            aria-label={`${rotulo} ${titulo}`}
            className={classesLink}
          >
            {rotulo}
          </Link>
        );
      },
    },
  ];
}

export function TabelaBeneficiosAdmin({
  beneficios,
  carregando,
  vazio,
  ordenar,
  consultaAtual,
  aoOrdenar,
}: PropsTabela) {
  return (
    <Tabela
      rotulo="Benefícios cadastrados"
      colunas={colunas({ ordenar, consultaAtual, aoOrdenar })}
      itens={beneficios}
      chave={(beneficio) => beneficio.id_beneficio}
      carregando={carregando}
      vazio={vazio}
    />
  );
}
