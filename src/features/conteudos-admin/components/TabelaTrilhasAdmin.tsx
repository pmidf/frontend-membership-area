import Link from "next/link";
import type { ReactNode } from "react";

import { formatarData } from "@/shared/lib/datas";
import { rotulosSituacao } from "@/shared/publicacao/situacao";
import { SeloStatus, Tabela, type ColunaTabela } from "@/shared/ui";

import { caminhoTrilha } from "../lib/valores-trilha";
import type { ResumoTrilhaAdmin } from "../tipos/trilha-admin";

type PropsTabela = {
  trilhas: ResumoTrilhaAdmin[];
  carregando: boolean;
  vazio: ReactNode;
  consultaAtual: string;
};

const classesLink =
  "text-corpo-pequeno font-medium whitespace-nowrap text-texto-marca underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-acao-destaque";

const colunas = (consulta: string): ColunaTabela<ResumoTrilhaAdmin>[] => [
  {
    id: "trilha",
    cabecalho: "Trilha",
    celula: ({ titulo, data_publicacao }) => (
      <span className="flex flex-col gap-0.5">
        <span className="font-medium break-words">{titulo}</span>
        <span className="text-legenda text-texto-secundario">
          {data_publicacao ? `Publicada em ${formatarData(data_publicacao)}` : "Nunca publicada"}
        </span>
      </span>
    ),
  },
  { id: "itens", cabecalho: "Itens", celula: ({ quantidade_itens }) => quantidade_itens },
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
    id: "atualizada",
    cabecalho: "Atualizada em",
    celula: ({ data_atualizacao }) => formatarData(data_atualizacao),
  },
  {
    id: "acoes",
    cabecalho: <span className="sr-only">Ações</span>,
    celula: ({ id_trilha, titulo, situacao }) => {
      const rotulo = situacao === "ARQUIVADO" ? "Ver" : "Editar";
      return (
        <Link
          href={caminhoTrilha(id_trilha, consulta)}
          aria-label={`${rotulo} ${titulo}`}
          className={classesLink}
        >
          {rotulo}
        </Link>
      );
    },
  },
];

export function TabelaTrilhasAdmin({ trilhas, carregando, vazio, consultaAtual }: PropsTabela) {
  return (
    <Tabela
      rotulo="Trilhas de conhecimento"
      colunas={colunas(consultaAtual)}
      itens={trilhas}
      chave={(trilha) => trilha.id_trilha}
      carregando={carregando}
      vazio={vazio}
    />
  );
}
