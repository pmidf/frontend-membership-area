import { http, HttpResponse } from "msw/http";

import type { DetalheOportunidade } from "@/features/oportunidades/tipos/oportunidade";
import type { Pagina } from "@/shared/api/tipos";

import type { ItemOportunidadeAdmin, OportunidadeAdmin } from "../tipos/oportunidade-admin";

const id = (numero: number) => `80000000-0000-4000-8000-${String(numero).padStart(12, "0")}`;

export const ID_CRIADA = id(90);
export const ID_DUPLICADA = id(91);

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
  empresa: "Instituto Federal de Gestão",
  situacao: "PUBLICADA",
  modalidade: "PRESENCIAL",
  data_publicacao: "2026-11-11T12:00:00.000Z",
  data_encerramento: "2027-01-10",
};

export const oportunidadeEncerrada: OportunidadeAdmin = {
  ...base,
  id_oportunidade: id(4),
  titulo: "Especialista em Portfólio",
  empresa: "Banco Regional",
  situacao: "ENCERRADA",
  modalidade: null,
  data_publicacao: "2026-09-01T12:00:00.000Z",
  data_encerramento: "2026-10-31",
  data_encerrada: "2026-10-20T13:00:00.000Z",
  motivo_encerramento: "Vaga preenchida",
};

export const oportunidadesAdminTeste: OportunidadeAdmin[] = [
  oportunidadeRascunho,
  oportunidadePublicada,
  oportunidadeEncerrada,
  ...Array.from({ length: 22 }, (_, indice) => ({
    ...oportunidadePublicada,
    id_oportunidade: id(indice + 10),
    titulo: `Vaga ${String(indice + 1).padStart(2, "0")}`,
  })),
];

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

function paraItem(oportunidade: OportunidadeAdmin): ItemOportunidadeAdmin {
  return {
    id_oportunidade: oportunidade.id_oportunidade,
    titulo: oportunidade.titulo,
    empresa: oportunidade.empresa,
    modalidade: oportunidade.modalidade,
    data_publicacao: oportunidade.data_publicacao,
    data_encerramento: oportunidade.data_encerramento,
    situacao: oportunidade.situacao,
  };
}

function paginar(itens: OportunidadeAdmin[], url: URL): Pagina<ItemOportunidadeAdmin> {
  const parametros = url.searchParams;
  const termo = (parametros.get("q") ?? "").toLowerCase();
  const situacao = parametros.get("situacao");
  const pagina = Number(parametros.get("page") ?? 1);
  const encontradas = itens.filter(
    (item) =>
      `${item.titulo} ${item.empresa}`.toLowerCase().includes(termo) &&
      (!situacao || item.situacao === situacao),
  );
  return {
    total: encontradas.length,
    pagina,
    total_paginas: Math.ceil(encontradas.length / 20),
    itens: encontradas.slice((pagina - 1) * 20, pagina * 20).map(paraItem),
  };
}

const erro = (status: number, codigo: string) => HttpResponse.json({ codigo }, { status });

export function handlersOportunidadesAdmin(iniciais: OportunidadeAdmin[] = [oportunidadeRascunho]) {
  let oportunidades = [...iniciais];
  const buscar = (idPedido: unknown) =>
    oportunidades.find(({ id_oportunidade }) => id_oportunidade === idPedido);
  const substituir = (atualizada: OportunidadeAdmin) => {
    oportunidades = oportunidades.map((oportunidade) =>
      oportunidade.id_oportunidade === atualizada.id_oportunidade ? atualizada : oportunidade,
    );
    return HttpResponse.json(atualizada);
  };
  const naoEncontrada = () => erro(404, "OPORTUNIDADE_NAO_ENCONTRADA");

  return [
    http.get("*/api/admin/oportunidades", ({ request }) =>
      HttpResponse.json(paginar(oportunidades, new URL(request.url))),
    ),
    http.post("*/api/admin/oportunidades", async ({ request }) => {
      const corpo = (await request.json()) as Partial<OportunidadeAdmin>;
      const criada: OportunidadeAdmin = {
        ...base,
        ...corpo,
        id_oportunidade: ID_CRIADA,
        meio_candidatura: corpo.url_candidatura ? "LINK" : "EMAIL",
      };
      oportunidades = [criada, ...oportunidades];
      return HttpResponse.json(criada, { status: 201 });
    }),
    http.get("*/api/admin/oportunidades/:id", ({ params }) => {
      const oportunidade = buscar(params.id);
      return oportunidade ? HttpResponse.json(oportunidade) : naoEncontrada();
    }),
    http.get("*/api/admin/oportunidades/:id/preview", ({ params }) => {
      const oportunidade = buscar(params.id);
      return oportunidade ? HttpResponse.json(paraDetalhe(oportunidade)) : naoEncontrada();
    }),
    http.patch("*/api/admin/oportunidades/:id", async ({ params, request }) => {
      const oportunidade = buscar(params.id);
      if (!oportunidade) return naoEncontrada();
      if (oportunidade.situacao === "ENCERRADA") return erro(409, "OPORTUNIDADE_ENCERRADA");
      const corpo = (await request.json()) as Partial<OportunidadeAdmin>;
      const trocaMeio = "url_candidatura" in corpo || "email_recrutador" in corpo;
      return substituir({
        ...oportunidade,
        ...corpo,
        ...(trocaMeio && { meio_candidatura: corpo.url_candidatura ? "LINK" : "EMAIL" }),
      });
    }),
    http.post("*/api/admin/oportunidades/:id/publicar", ({ params }) => {
      const oportunidade = buscar(params.id);
      if (!oportunidade) return naoEncontrada();
      if (oportunidade.situacao !== "RASCUNHO") return erro(409, "OPORTUNIDADE_NAO_E_RASCUNHO");
      return substituir({
        ...oportunidade,
        situacao: "PUBLICADA",
        data_publicacao: "2026-11-15T12:00:00.000Z",
        data_encerramento: oportunidade.data_encerramento ?? "2027-01-14",
      });
    }),
    http.post("*/api/admin/oportunidades/:id/encerrar", async ({ params, request }) => {
      const oportunidade = buscar(params.id);
      if (!oportunidade) return naoEncontrada();
      if (oportunidade.situacao === "ENCERRADA") return erro(409, "OPORTUNIDADE_ENCERRADA");
      if (oportunidade.situacao !== "PUBLICADA") return erro(409, "OPORTUNIDADE_NAO_PUBLICADA");
      const corpo = (await request.json()) as { motivo_encerramento?: string };
      return substituir({
        ...oportunidade,
        situacao: "ENCERRADA",
        data_encerrada: "2026-11-15T13:00:00.000Z",
        motivo_encerramento: corpo.motivo_encerramento ?? null,
      });
    }),
    http.post("*/api/admin/oportunidades/:id/duplicar", ({ params }) => {
      const oportunidade = buscar(params.id);
      if (!oportunidade) return naoEncontrada();
      const duplicada: OportunidadeAdmin = {
        ...oportunidade,
        id_oportunidade: ID_DUPLICADA,
        situacao: "RASCUNHO",
        data_publicacao: null,
        data_encerramento: null,
        data_encerrada: null,
        motivo_encerramento: null,
        id_oportunidade_origem: oportunidade.id_oportunidade,
      };
      oportunidades = [duplicada, ...oportunidades];
      return HttpResponse.json(duplicada, { status: 201 });
    }),
  ];
}
