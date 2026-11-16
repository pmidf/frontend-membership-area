import { http, HttpResponse } from "msw/http";

import type { Pagina } from "@/shared/api/tipos";
import { hojeNoFuso } from "@/shared/lib/datas";

import type {
  Candidatura,
  DetalheOportunidade,
  ItemOportunidade,
  RespostaOportunidades,
} from "../tipos/oportunidade";

const DIA_EM_MS = 86_400_000;
const daquiA = (dias: number) => hojeNoFuso(new Date(Date.now() + dias * DIA_EM_MS));
const haDias = (dias: number) => new Date(Date.now() - dias * DIA_EM_MS).toISOString();

const id = (numero: number) => `90000000-0000-4000-8000-${String(numero).padStart(12, "0")}`;

const base: ItemOportunidade = {
  id_oportunidade: "",
  titulo: "",
  empresa: "Construtora Vega",
  logo_empresa: null,
  modalidade: "HIBRIDO",
  localidade: "Brasília/DF",
  data_publicacao: haDias(2),
  data_encerramento: daquiA(58),
  bloqueado: false,
};

export const vagaPorEmail: ItemOportunidade = {
  ...base,
  id_oportunidade: id(1),
  titulo: "Gerente de Projetos Sênior",
};

export const vagaPorLink: ItemOportunidade = {
  ...base,
  id_oportunidade: id(2),
  titulo: "Project Manager (PMP desejável)",
  empresa: "Nexa Tecnologia",
  modalidade: "REMOTO",
  localidade: "Brasil",
  data_publicacao: haDias(9),
  data_encerramento: daquiA(3),
};

export const vagaEncerrada: ItemOportunidade = {
  ...base,
  id_oportunidade: id(3),
  titulo: "Analista de Projetos Júnior",
  empresa: "SmartKanvas",
};

export const itensTeste: ItemOportunidade[] = [
  vagaPorEmail,
  vagaPorLink,
  ...Array.from({ length: 21 }, (_, indice) => ({
    ...base,
    id_oportunidade: id(indice + 10),
    titulo: `Coordenador de PMO ${String(indice + 1).padStart(2, "0")}`,
    empresa: "Instituto Federal de Gestão",
    modalidade: "PRESENCIAL" as const,
  })),
];

export const DESCRICAO_TESTE =
  "<p>Apoiar o PMO no acompanhamento de cronogramas.</p><ul><li>Atualizar cronogramas</li></ul><script>alert(1)</script>";

export function detalheDe(item: ItemOportunidade, meio: "LINK" | "EMAIL"): DetalheOportunidade {
  return {
    id_oportunidade: item.id_oportunidade,
    titulo: item.titulo,
    empresa: item.empresa,
    logo_empresa: item.logo_empresa,
    modalidade: item.modalidade,
    localidade: item.localidade,
    data_publicacao: item.data_publicacao,
    data_encerramento: item.data_encerramento,
    descricao: DESCRICAO_TESTE,
    meio_candidatura: meio,
  };
}

export const URL_CANDIDATURA = "https://nexa.com.br/vagas/pm";
export const EMAIL_RECRUTADOR = "rh@vega.com.br";

const candidaturas: Record<string, Candidatura> = {
  [vagaPorLink.id_oportunidade]: { meio_candidatura: "LINK", url_candidatura: URL_CANDIDATURA },
  [vagaPorEmail.id_oportunidade]: {
    meio_candidatura: "EMAIL",
    email_recrutador: EMAIL_RECRUTADOR,
    assunto: `Candidatura — ${vagaPorEmail.titulo} — via PMI-DF`,
  },
};

function paginar(itens: ItemOportunidade[], url: URL): Pagina<ItemOportunidade> {
  const parametros = url.searchParams;
  const termo = (parametros.get("q") ?? "").toLowerCase();
  const modalidade = parametros.get("modalidade");
  const pagina = Number(parametros.get("page") ?? 1);
  const encontradas = itens.filter(
    (item) =>
      `${item.titulo} ${item.empresa}`.toLowerCase().includes(termo) &&
      (!modalidade || item.modalidade === modalidade),
  );
  if (parametros.get("ordenar") === "alfabetica") {
    encontradas.sort((primeira, segunda) =>
      primeira.titulo.localeCompare(segunda.titulo, "pt-BR", { sensitivity: "base" }),
    );
  }
  return {
    total: encontradas.length,
    pagina,
    total_paginas: Math.ceil(encontradas.length / 20),
    itens: encontradas.slice((pagina - 1) * 20, pagina * 20),
  };
}

const erro = (status: number, codigo: string) => HttpResponse.json({ codigo }, { status });

export function handlersOportunidades(resposta?: RespostaOportunidades) {
  return [
    http.get("*/api/oportunidades", ({ request }) =>
      HttpResponse.json(resposta ?? paginar(itensTeste, new URL(request.url))),
    ),
    http.get("*/api/oportunidades/:id", ({ params }) => {
      if (params.id === vagaEncerrada.id_oportunidade) return erro(410, "OPORTUNIDADE_ENCERRADA");
      if (params.id === vagaPorLink.id_oportunidade) {
        return HttpResponse.json(detalheDe(vagaPorLink, "LINK"));
      }
      if (params.id === vagaPorEmail.id_oportunidade) {
        return HttpResponse.json(detalheDe(vagaPorEmail, "EMAIL"));
      }
      return erro(404, "OPORTUNIDADE_NAO_ENCONTRADA");
    }),
    http.post("*/api/oportunidades/:id/candidatura", ({ params }) => {
      const candidatura = candidaturas[String(params.id)];
      return candidatura ? HttpResponse.json(candidatura) : erro(410, "OPORTUNIDADE_ENCERRADA");
    }),
  ];
}
