import Link from "next/link";
import type { ReactNode } from "react";

import { rotulosTipo } from "@/features/conteudos/lib/tipo-conteudo";
import { rotulosSituacao } from "@/shared/publicacao/situacao";
import { Etiqueta, SeloStatus, Tabela, type ColunaTabela } from "@/shared/ui";

import type { ConteudoAdmin } from "../tipos/conteudo-admin";

type PropsTabela = {
  conteudos: ConteudoAdmin[];
  carregando: boolean;
  vazio: ReactNode;
  consultaAtual: string;
};

const classesLink =
  "text-corpo-pequeno font-medium whitespace-nowrap text-texto-marca underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-acao-destaque";

const colunas = (sufixo: string): ColunaTabela<ConteudoAdmin>[] => [
  {
    id: "conteudo",
    cabecalho: "Conteúdo",
    celula: ({ titulo, categoria }) => (
      <span className="flex flex-col gap-0.5">
        <span className="font-medium break-words">{titulo}</span>
        <span className="text-legenda text-texto-secundario">{categoria.desc_categoria}</span>
      </span>
    ),
  },
  { id: "tipo", cabecalho: "Tipo", celula: ({ tipo }) => rotulosTipo[tipo] },
  {
    id: "acesso",
    cabecalho: "Acesso",
    celula: ({ bol_exclusivo }) => (
      <Etiqueta tom={bol_exclusivo ? "aqua" : "neutro"}>
        {bol_exclusivo ? "Filiado" : "Público"}
      </Etiqueta>
    ),
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
    id: "acoes",
    cabecalho: <span className="sr-only">Ações</span>,
    celula: ({ id_conteudo, titulo, situacao }) => {
      const rotulo = situacao === "ARQUIVADO" ? "Ver" : "Editar";
      return (
        <span className="flex flex-wrap gap-x-4 gap-y-1">
          <Link
            href={`/admin/conteudos/${id_conteudo}${sufixo}`}
            aria-label={`${rotulo} ${titulo}`}
            className={classesLink}
          >
            {rotulo}
          </Link>
          {situacao !== "RASCUNHO" && (
            <Link
              href={`/admin/conteudos/${id_conteudo}/estatisticas`}
              aria-label={`Ver estatísticas de ${titulo}`}
              className={classesLink}
            >
              Ver estatísticas
            </Link>
          )}
        </span>
      );
    },
  },
];

export function TabelaConteudosAdmin({ conteudos, carregando, vazio, consultaAtual }: PropsTabela) {
  return (
    <Tabela
      rotulo="Biblioteca de conteúdos"
      colunas={colunas(consultaAtual ? `?${consultaAtual}` : "")}
      itens={conteudos}
      chave={(conteudo) => conteudo.id_conteudo}
      carregando={carregando}
      vazio={vazio}
    />
  );
}
