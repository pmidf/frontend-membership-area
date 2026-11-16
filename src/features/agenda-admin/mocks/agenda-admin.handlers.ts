import { http, HttpResponse } from "msw/http";

import type { Conciliacao, ParticipantesDoEvento } from "../api/agenda-admin.api";
import type { LinhaNumeros } from "../linhas-numeros";

const linhaBase: LinhaNumeros = {
  id: "",
  titulo: "",
  inicio: "2026-09-10T19:00:00-03:00",
  formato: "online",
  categoria: "Webinar",
  situacao: "inativo",
  cancelado: false,
  encerrado: true,
  inscritos: 0,
  presentes: 0,
  ausentes: 0,
  cancelados: 0,
  taxa: null,
};

export const linhasNumerosTeste: LinhaNumeros[] = [
  {
    ...linhaBase,
    id: "3001",
    titulo: "Webinar de Agilidade",
    inscritos: 40,
    presentes: 30,
    ausentes: 10,
    taxa: 0.75,
  },
  {
    ...linhaBase,
    id: "3002",
    titulo: "Encontro presencial de PMOs",
    inicio: "2026-12-05T09:00:00-03:00",
    formato: "presencial",
    categoria: "Networking",
    situacao: "ativo",
    encerrado: false,
    inscritos: 25,
  },
];

export const participantesTeste: ParticipantesDoEvento = {
  evento: {
    id: "3001",
    titulo: "Webinar de Agilidade",
    descricao: "",
    inicio: "2026-09-10T19:00:00-03:00",
    fim: "2026-09-10T21:00:00-03:00",
    urlSympla: "https://www.sympla.com.br/evento/3001",
    endereco: null,
    categoria: "Webinar",
    cancelado: false,
  },
  encerrado: true,
  participantes: [
    {
      id: "p1",
      nome: "Ana Lima",
      email: "ana@teste.com",
      tipoIngresso: "Filiado",
      checkIn: true,
      checkInEm: "2026-09-10T19:05:00-03:00",
      cancelado: false,
      vinculo: { tipo: "vinculado", pessoaId: "p-ana", pessoaNome: "Ana Lima", origem: "manual" },
    },
    {
      id: "p2",
      nome: "Bruno Costa",
      email: "bruno@teste.com",
      tipoIngresso: "Público geral",
      checkIn: false,
      checkInEm: null,
      cancelado: false,
      vinculo: { tipo: "nao-vinculado" },
    },
  ],
  porTipo: [
    { tipo: "Filiado", inscritos: 1 },
    { tipo: "Público geral", inscritos: 1 },
  ],
};

export const PESSOA_ANA = "10000000-0000-4000-8000-000000000001";
export const PESSOA_CARLA = "10000000-0000-4000-8000-000000000002";

export const conciliacaoTeste: Conciliacao = {
  total: 2,
  fila: [
    {
      participacao: {
        id: "p2",
        eventoId: "3001",
        nome: "Bruno Costa",
        email: "bruno@teste.com",
        checkIn: true,
      },
      evento: { id: "3001", titulo: "Webinar de Agilidade", inicio: "2026-09-10T19:00:00-03:00" },
      sugestoes: [],
    },
    {
      participacao: {
        id: "p3",
        eventoId: "3001",
        nome: "Ana L.",
        email: "ana.pessoal@teste.com",
        checkIn: false,
      },
      evento: { id: "3001", titulo: "Webinar de Agilidade", inicio: "2026-09-10T19:00:00-03:00" },
      sugestoes: [
        {
          pessoa: {
            id: PESSOA_ANA,
            nome: "Ana Lima",
            email: "ana@teste.com",
            pmiId: "123",
            statusFiliacao: "filiado",
            desde: 2021,
          },
          similaridade: 0.82,
        },
      ],
    },
  ],
  resolvidas: [
    {
      participacao: { id: "p9", nome: "Diego", email: "diego@teste.com", eventoId: "3001" },
      evento: { id: "3001", titulo: "Webinar de Agilidade" },
      tipo: "nao-membro",
      pessoa: null,
      por: "Admin Teste",
      em: "2026-09-11T10:00:00-03:00",
    },
  ],
  pessoas: [
    {
      id: PESSOA_ANA,
      nome: "Ana Lima",
      email: "ana@teste.com",
      pmiId: "123",
      statusFiliacao: "filiado",
      desde: 2021,
    },
    {
      id: PESSOA_CARLA,
      nome: "Carla Souza",
      email: null,
      pmiId: null,
      statusFiliacao: "nao-filiado",
      desde: 2024,
    },
  ],
};

export function handlersAgendaAdmin() {
  return [
    http.get("*/api/admin/agenda/eventos", () =>
      HttpResponse.json({ linhas: linhasNumerosTeste, categorias: ["Networking", "Webinar"] }),
    ),
    http.get("*/api/admin/agenda/eventos/numeros.csv", () =>
      HttpResponse.text("id;titulo\n", {
        headers: { "Content-Disposition": 'attachment; filename="eventos-numeros.csv"' },
      }),
    ),
    http.get("*/api/admin/agenda/eventos/:id/participantes", ({ params }) =>
      params.id === participantesTeste.evento.id
        ? HttpResponse.json(participantesTeste)
        : HttpResponse.json({ codigo: "EVENTO_NAO_ENCONTRADO" }, { status: 404 }),
    ),
    http.get("*/api/admin/agenda/eventos/:id/participantes.csv", () =>
      HttpResponse.text("nome;email\n"),
    ),
    http.get("*/api/admin/agenda/conciliacao", () => HttpResponse.json(conciliacaoTeste)),
    http.post("*/api/admin/agenda/atualizar", () => new HttpResponse(null, { status: 204 })),
    http.post(
      "*/api/admin/agenda/conciliacao/vinculos",
      () => new HttpResponse(null, { status: 204 }),
    ),
    http.post(
      "*/api/admin/agenda/conciliacao/nao-membros",
      () => new HttpResponse(null, { status: 204 }),
    ),
    http.delete(
      "*/api/admin/agenda/conciliacao/:eventoId/:participanteId",
      () => new HttpResponse(null, { status: 204 }),
    ),
  ];
}
