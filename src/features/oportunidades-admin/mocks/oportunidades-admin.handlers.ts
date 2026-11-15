import { http, HttpResponse } from "msw/http";

import type { DetalheOportunidade } from "@/features/oportunidades/tipos/oportunidade";

import type { OportunidadeAdmin } from "../tipos/oportunidade-admin";

const id = (numero: number) => `80000000-0000-4000-8000-${String(numero).padStart(12, "0")}`;

export const ID_CRIADA = id(90);

const base: OportunidadeAdmin = {
  id_oportunidade: "",
  id_pessoa: "70000000-0000-4000-8000-000000000001",
  situacao: "RASCUNHO",
  titulo: "",
  empresa: "SmartKanvas",
  descricao: "<p>Apoiar o PMO no acompanhamento de cronogramas.</p>",
  meio_candidatura: "LINK",
  url_candidatura: "https://smartkanvas.com.br/vagas/analista",
  email_recrutador: null,
  modalidade: "HIBRIDO",
  localidade: "Brasília/DF",
  logo_empresa: null,
  data_publicacao: null,
  data_encerramento: null,
  data_encerrada: null,
  motivo_encerramento: null,
  id_oportunidade_origem: null,
  data_criacao: "2026-11-10T15:00:00.000Z",
  data_atualizacao: "2026-11-10T15:00:00.000Z",
};

export const oportunidadeRascunho: OportunidadeAdmin = {
  ...base,
  id_oportunidade: id(1),
  titulo: "Analista de Projetos Júnior",
};

export const oportunidadePorEmail: OportunidadeAdmin = {
  ...base,
  id_oportunidade: id(2),
  titulo: "Gerente de Projetos Sênior",
  meio_candidatura: "EMAIL",
  url_candidatura: null,
  email_recrutador: "recrutamento@smartkanvas.com.br",
};

export const oportunidadePublicada: OportunidadeAdmin = {
  ...base,
  id_oportunidade: id(3),
  titulo: "Coordenador de PMO",
  situacao: "PUBLICADA",
  data_publicacao: "2026-11-11T12:00:00.000Z",
  data_encerramento: "2027-01-10",
};

export function paraDetalhe(oportunidade: OportunidadeAdmin): DetalheOportunidade {
  return {
    id_oportunidade: oportunidade.id_oportunidade,
    titulo: oportunidade.titulo,
    empresa: oportunidade.empresa,
    logo_empresa: oportunidade.logo_empresa,
    modalidade: oportunidade.modalidade,
    localidade: oportunidade.localidade,
    data_publicacao: oportunidade.data_publicacao,
    data_encerramento: oportunidade.data_encerramento,
    descricao: oportunidade.descricao,
    meio_candidatura: oportunidade.meio_candidatura,
  };
}

const naoEncontrada = () =>
  HttpResponse.json({ codigo: "OPORTUNIDADE_NAO_ENCONTRADA" }, { status: 404 });

export function handlersOportunidadeAdmin(inicial: OportunidadeAdmin = oportunidadeRascunho) {
  let oportunidade = inicial;
  const existe = (idPedido: unknown) => idPedido === oportunidade.id_oportunidade;
  return [
    http.post("*/api/admin/oportunidades", async ({ request }) => {
      const corpo = (await request.json()) as Partial<OportunidadeAdmin>;
      oportunidade = {
        ...base,
        ...corpo,
        id_oportunidade: ID_CRIADA,
        meio_candidatura: corpo.url_candidatura ? "LINK" : "EMAIL",
      };
      return HttpResponse.json(oportunidade, { status: 201 });
    }),
    http.get("*/api/admin/oportunidades/:id", ({ params }) =>
      existe(params.id) ? HttpResponse.json(oportunidade) : naoEncontrada(),
    ),
    http.get("*/api/admin/oportunidades/:id/preview", ({ params }) =>
      existe(params.id) ? HttpResponse.json(paraDetalhe(oportunidade)) : naoEncontrada(),
    ),
    http.patch("*/api/admin/oportunidades/:id", async ({ request }) => {
      const corpo = (await request.json()) as Partial<OportunidadeAdmin>;
      const trocaMeio = "url_candidatura" in corpo || "email_recrutador" in corpo;
      oportunidade = {
        ...oportunidade,
        ...corpo,
        ...(trocaMeio && { meio_candidatura: corpo.url_candidatura ? "LINK" : "EMAIL" }),
      };
      return HttpResponse.json(oportunidade);
    }),
    http.post("*/api/admin/oportunidades/:id/publicar", () => {
      if (oportunidade.situacao !== "RASCUNHO") {
        return HttpResponse.json({ codigo: "OPORTUNIDADE_NAO_E_RASCUNHO" }, { status: 409 });
      }
      oportunidade = {
        ...oportunidade,
        situacao: "PUBLICADA",
        data_publicacao: "2026-11-15T12:00:00.000Z",
        data_encerramento: oportunidade.data_encerramento ?? "2027-01-14",
      };
      return HttpResponse.json(oportunidade);
    }),
  ];
}
