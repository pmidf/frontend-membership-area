import type { ReactNode } from "react";

import { rotulosSituacaoOportunidade } from "@/features/oportunidades/lib/rotulos";
import type { SituacaoOportunidade } from "@/features/oportunidades/tipos/oportunidade";
import { Cartao } from "@/shared/ui";

export type DetalhePublicacao = { termo: string; valor: ReactNode };

type PropsCartaoPublicacaoVaga = {
  situacao: SituacaoOportunidade;
  detalhes?: DetalhePublicacao[];
  nota?: ReactNode;
  children: ReactNode;
};

export function CartaoPublicacaoVaga({
  situacao,
  detalhes = [],
  nota,
  children,
}: PropsCartaoPublicacaoVaga) {
  const linhas = [
    { termo: "Status", valor: rotulosSituacaoOportunidade[situacao].rotulo },
    ...detalhes,
  ];

  return (
    <Cartao className="flex flex-col gap-4 p-6">
      <h2 className="text-h3">Publicação</h2>
      <dl className="flex flex-col gap-2 text-corpo-pequeno">
        {linhas.map(({ termo, valor }) => (
          <div key={termo} className="flex items-start justify-between gap-3">
            <dt className="shrink-0 text-texto-secundario">{termo}</dt>
            <dd className="text-right font-medium break-words">{valor}</dd>
          </div>
        ))}
      </dl>
      {children}
      {nota && <p className="text-legenda text-texto-secundario">{nota}</p>}
    </Cartao>
  );
}
