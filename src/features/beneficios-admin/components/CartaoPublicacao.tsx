import type { ReactNode } from "react";

import { Cartao } from "@/shared/ui";

import { rotulosSituacao } from "../lib/rotulos";
import type { SituacaoBeneficio } from "../tipos/beneficio-admin";

type PropsCartaoPublicacao = {
  situacao: SituacaoBeneficio;
  children: ReactNode;
};

export function CartaoPublicacao({ situacao, children }: PropsCartaoPublicacao) {
  return (
    <Cartao className="flex flex-col gap-4 p-6">
      <h2 className="text-h3">Publicação</h2>
      <dl className="flex flex-col gap-2 text-corpo-pequeno">
        <div className="flex items-center justify-between gap-3">
          <dt className="text-texto-secundario">Status</dt>
          <dd className="font-medium">{rotulosSituacao[situacao].rotulo}</dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-texto-secundario">Visível para</dt>
          <dd className="font-medium">Filiados ativos</dd>
        </div>
      </dl>
      {children}
      <p className="text-legenda text-texto-secundario">
        Publicar torna o benefício visível na hora, respeitando a vigência. Toda edição posterior
        fica registrada na auditoria.
      </p>
    </Cartao>
  );
}
