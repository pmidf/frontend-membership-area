import type { FormEventHandler, ReactNode } from "react";

import { Alerta, CabecalhoPagina, LinkVoltar } from "@/shared/ui";

import { FormularioOportunidade } from "./FormularioOportunidade";
import { SecaoMeioCandidatura } from "./SecaoMeioCandidatura";

export const ID_FORMULARIO_OPORTUNIDADE = "formulario-oportunidade";
export const CAMINHO_VAGAS_ADMIN = "/admin/vagas";
export const PARAMETRO_PREVIA = "previa";

type PropsEstrutura = {
  titulo: string;
  acoesCabecalho?: ReactNode;
  aoEnviar: FormEventHandler<HTMLFormElement>;
  bloqueado?: boolean;
  lateral: ReactNode;
};

export function EstruturaFormularioOportunidade({
  titulo,
  acoesCabecalho,
  aoEnviar,
  bloqueado = false,
  lateral,
}: PropsEstrutura) {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <LinkVoltar href={CAMINHO_VAGAS_ADMIN}>Voltar para vagas</LinkVoltar>
      <CabecalhoPagina titulo={titulo} acoes={acoesCabecalho} />
      <form
        id={ID_FORMULARIO_OPORTUNIDADE}
        noValidate
        onSubmit={aoEnviar}
        className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]"
      >
        <fieldset disabled={bloqueado} className="flex min-w-0 flex-col gap-6">
          <legend className="sr-only">Dados da vaga</legend>
          <FormularioOportunidade />
        </fieldset>
        <div className="flex flex-col gap-6">
          <SecaoMeioCandidatura bloqueado={bloqueado} />
          <Alerta tom="informacao" titulo="Cadastro mínimo">
            Título, empresa, descrição e um meio de candidatura. Tudo o mais é opcional.
          </Alerta>
          {lateral}
        </div>
      </form>
    </div>
  );
}
