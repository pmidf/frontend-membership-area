import { http, HttpResponse } from "msw/http";

import type { Evento, SituacaoNoEvento } from "../types";

const DIA_EM_MS = 86_400_000;
const DUAS_HORAS_MS = 7_200_000;

const enderecoBrasilia = {
  nome: "Impact Hub Brasília",
  logradouro: "SGAN 601 Módulo N",
  bairro: "Asa Norte",
  cidade: "Brasília",
  uf: "DF",
};

function evento(numero: number, dias: number, extras: Partial<Evento> = {}): Evento {
  const inicio = Date.now() + dias * DIA_EM_MS;
  return {
    id: `900${numero}`,
    titulo: `Evento ${numero}`,
    descricao: "Encontro do capítulo.",
    inicio: new Date(inicio).toISOString(),
    fim: new Date(inicio + DUAS_HORAS_MS).toISOString(),
    urlSympla: `https://www.sympla.com.br/evento/teste/900${numero}`,
    endereco: null,
    categoria: "Encontro",
    cancelado: false,
    ...extras,
  };
}

export const eventosTeste: Evento[] = [
  evento(1, 30, { titulo: "Encontro de Gestão de Projetos", endereco: enderecoBrasilia }),
  evento(2, 5, { titulo: "Webinar de Agilidade" }),
  evento(3, 12, { titulo: "Palestra cancelada", cancelado: true }),
  evento(4, 60, { titulo: "Summit do capítulo", endereco: enderecoBrasilia }),
  evento(5, 90, { titulo: "Workshop de riscos" }),
  evento(6, -10, { titulo: "Meetup de outubro" }),
  evento(7, -40, { titulo: "Palestra de setembro" }),
];

export const situacoesTeste: SituacaoNoEvento[] = [
  { eventoId: "9006", status: "presente" },
  { eventoId: "9007", status: "ausente" },
];

export function handlersAgenda(
  eventos: Evento[] = eventosTeste,
  situacoes: SituacaoNoEvento[] = situacoesTeste,
) {
  return [
    http.get("*/api/agenda/eventos", () => HttpResponse.json(eventos)),
    http.post("*/api/agenda/participacoes/situacao", async ({ request }) => {
      const { eventoIds } = (await request.json()) as { eventoIds: string[] };
      return HttpResponse.json(situacoes.filter(({ eventoId }) => eventoIds.includes(eventoId)));
    }),
  ];
}
