import { camposDiferentes } from "@/shared/lib/campos-diferentes";

import type { DadosOportunidade } from "../schemas/oportunidade.schema";
import type {
  AtualizarOportunidade,
  CriarOportunidade,
  OportunidadeAdmin,
} from "../tipos/oportunidade-admin";
import { htmlParaTexto, textoParaHtml } from "./texto-para-html";

export const VALORES_NOVA_OPORTUNIDADE: DadosOportunidade = {
  titulo: "",
  empresa: "",
  descricao: "",
  meio_candidatura: "LINK",
  url_candidatura: "",
  email_recrutador: "",
  modalidade: "",
  localidade: "",
  logo_empresa: "",
  data_encerramento: "",
};

export function valoresDaOportunidade(oportunidade: OportunidadeAdmin): DadosOportunidade {
  return {
    titulo: oportunidade.titulo,
    empresa: oportunidade.empresa,
    descricao: htmlParaTexto(oportunidade.descricao),
    meio_candidatura: oportunidade.meio_candidatura,
    url_candidatura: oportunidade.url_candidatura ?? "",
    email_recrutador: oportunidade.email_recrutador ?? "",
    modalidade: oportunidade.modalidade ?? "",
    localidade: oportunidade.localidade ?? "",
    logo_empresa: oportunidade.logo_empresa ?? "",
    data_encerramento: oportunidade.data_encerramento ?? "",
  };
}

function textoOuNulo(valor: string): string | null {
  const aparado = valor.trim();
  return aparado === "" ? null : aparado;
}

export function dadosParaEnviar(dados: DadosOportunidade): CriarOportunidade {
  const porLink = dados.meio_candidatura === "LINK";
  return {
    titulo: dados.titulo.trim(),
    empresa: dados.empresa.trim(),
    descricao: textoParaHtml(dados.descricao),
    url_candidatura: porLink ? textoOuNulo(dados.url_candidatura) : null,
    email_recrutador: porLink ? null : textoOuNulo(dados.email_recrutador),
    modalidade: dados.modalidade === "" ? null : dados.modalidade,
    localidade: textoOuNulo(dados.localidade),
    logo_empresa: textoOuNulo(dados.logo_empresa),
    data_encerramento: dados.data_encerramento === "" ? null : dados.data_encerramento,
  };
}

export function camposAlteradosDaOportunidade(
  iniciais: DadosOportunidade,
  atuais: DadosOportunidade,
): AtualizarOportunidade {
  const atualizados = dadosParaEnviar(atuais);
  const alterados = camposDiferentes(dadosParaEnviar(iniciais), atualizados);
  if (!("url_candidatura" in alterados) && !("email_recrutador" in alterados)) return alterados;
  return {
    ...alterados,
    url_candidatura: atualizados.url_candidatura,
    email_recrutador: atualizados.email_recrutador,
  };
}
