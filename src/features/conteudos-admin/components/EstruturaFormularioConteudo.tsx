import type { FormEventHandler, ReactNode } from "react";

import { CabecalhoPagina, LinkVoltar } from "@/shared/ui";

import { FormularioConteudo } from "./FormularioConteudo";

export const ID_FORMULARIO_CONTEUDO = "formulario-conteudo";

type PropsEstrutura = {
  titulo: string;
  destinoVolta: string;
  acoesCabecalho?: ReactNode;
  aoEnviar: FormEventHandler<HTMLFormElement>;
  bloqueado?: boolean;
  tipoTravado?: boolean;
  lateral: ReactNode;
};

export function EstruturaFormularioConteudo({
  titulo,
  destinoVolta,
  acoesCabecalho,
  aoEnviar,
  bloqueado = false,
  tipoTravado = false,
  lateral,
}: PropsEstrutura) {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <LinkVoltar href={destinoVolta}>Voltar para a biblioteca</LinkVoltar>
      <CabecalhoPagina titulo={titulo} acoes={acoesCabecalho} />
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <form id={ID_FORMULARIO_CONTEUDO} noValidate onSubmit={aoEnviar} className="min-w-0">
          <fieldset disabled={bloqueado} className="flex min-w-0 flex-col gap-6">
            <legend className="sr-only">Dados do conteúdo</legend>
            <FormularioConteudo tipoTravado={tipoTravado} />
          </fieldset>
        </form>
        <div className="flex flex-col gap-6">{lateral}</div>
      </div>
    </div>
  );
}
