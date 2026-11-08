import type { ReactNode } from "react";

import { URL_RENOVACAO_PMI } from "@/shared/lib/links-externos";
import type { FiliacaoPerfil } from "@/shared/sessao/tipos";
import { Cartao, SeloStatus } from "@/shared/ui";
import { classesBotao } from "@/shared/ui/botao/Botao";

import { apresentarFiliacao, apresentarFiliacaoParaAdmin } from "../lib/apresentacao-filiacao";

type PropsCartaoSituacaoFiliacao = {
  filiacao: FiliacaoPerfil | null;
  filiado: boolean;
  visao?: "propria" | "admin";
  acoes?: ReactNode;
};

export function CartaoSituacaoFiliacao({
  filiacao,
  filiado,
  visao = "propria",
  acoes,
}: PropsCartaoSituacaoFiliacao) {
  const apresentar = visao === "admin" ? apresentarFiliacaoParaAdmin : apresentarFiliacao;
  const { rotuloSelo, tom, mensagem, pmiId, dados, mostrarRenovacao } = apresentar(
    filiacao,
    filiado,
  );

  return (
    <Cartao className="flex flex-col gap-4 p-6">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <SeloStatus tom={tom} className="whitespace-normal">
          {rotuloSelo}
        </SeloStatus>
        {pmiId && <p className="text-corpo-pequeno text-texto-secundario">PMI ID: {pmiId}</p>}
      </div>
      {dados.length > 0 && (
        <dl className="grid grid-cols-2 gap-4">
          {dados.map(({ rotulo, valor }) => (
            <div key={rotulo} className="flex flex-col gap-0.5">
              <dt className="text-legenda text-texto-secundario">{rotulo}</dt>
              <dd className="text-corpo font-medium">{valor}</dd>
            </div>
          ))}
        </dl>
      )}
      {mensagem && <p className="text-corpo-pequeno">{mensagem}</p>}
      {(mostrarRenovacao || acoes) && (
        <div className="flex flex-wrap items-center gap-3">
          {mostrarRenovacao && (
            <a
              href={URL_RENOVACAO_PMI}
              target="_blank"
              rel="noopener noreferrer"
              className={classesBotao({ variante: "secundario", tamanho: "sm" })}
            >
              Renovar no PMI
              <span className="sr-only"> (abre em nova aba)</span>
            </a>
          )}
          {acoes}
        </div>
      )}
    </Cartao>
  );
}
