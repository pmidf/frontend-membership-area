import type { ReactNode } from "react";

import { Cartao } from "@/shared/ui";

import { rotulosSituacao, type SituacaoPublicacao } from "./situacao";

type Detalhe = { termo: string; valor: ReactNode };

type PropsCartaoPublicacao = {
  situacao: SituacaoPublicacao;
  detalhes?: Detalhe[];
  nota?: ReactNode;
  children: ReactNode;
};

export function CartaoPublicacao({
  situacao,
  detalhes = [],
  nota,
  children,
}: PropsCartaoPublicacao) {
  const linhas = [{ termo: "Status", valor: rotulosSituacao[situacao].rotulo }, ...detalhes];

  return (
    <Cartao className="flex flex-col gap-4 p-6">
      <h2 className="text-h3">Publicação</h2>
      <dl className="flex flex-col gap-2 text-corpo-pequeno">
        {linhas.map(({ termo, valor }) => (
          <div key={termo} className="flex items-center justify-between gap-3">
            <dt className="text-texto-secundario">{termo}</dt>
            <dd className="text-right font-medium">{valor}</dd>
          </div>
        ))}
      </dl>
      {children}
      {nota && <p className="text-legenda text-texto-secundario">{nota}</p>}
    </Cartao>
  );
}
