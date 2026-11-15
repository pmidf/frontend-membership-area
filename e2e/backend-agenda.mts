import { createServer, type ServerResponse } from "node:http";

import type { Evento } from "../src/features/agenda/types";

const UM_DIA_MS = 24 * 60 * 60 * 1000;
const porta = Number(process.env.PORTA_BACKEND_AGENDA ?? 3399);

function emDias(dias: number, horas: number) {
  return new Date(Date.now() + dias * UM_DIA_MS + horas * 60 * 60 * 1000).toISOString();
}

const eventos: Evento[] = [
  {
    id: "1001",
    titulo: "Encontro de Gestão de Projetos",
    descricao: "Troca de experiências entre membros do capítulo.",
    inicio: emDias(10, 0),
    fim: emDias(10, 2),
    urlSympla: "https://www.sympla.com.br/evento/encontro-de-gestao/1001",
    endereco: {
      nome: "Impact Hub Brasília",
      logradouro: "SGAN 601 Módulo N",
      bairro: "Asa Norte",
      cidade: "Brasília",
      uf: "DF",
    },
    categoria: "Encontro",
    cancelado: false,
  },
  {
    id: "1002",
    titulo: "Webinar de Agilidade",
    descricao: "Práticas ágeis em projetos públicos.",
    inicio: emDias(20, 0),
    fim: emDias(20, 1),
    urlSympla: "https://www.sympla.com.br/evento/webinar-de-agilidade/1002",
    endereco: null,
    categoria: "Webinar",
    cancelado: false,
  },
  {
    id: "1003",
    titulo: "Palestra de Riscos",
    descricao: "Gestão de riscos em grandes obras.",
    inicio: emDias(-15, 0),
    fim: emDias(-15, 2),
    urlSympla: "https://www.sympla.com.br/evento/palestra-de-riscos/1003",
    endereco: null,
    categoria: "Palestra",
    cancelado: false,
  },
];

function responder(resposta: ServerResponse, status: number, corpo?: unknown) {
  resposta.writeHead(status, { "Content-Type": "application/json" });
  resposta.end(corpo === undefined ? undefined : JSON.stringify(corpo));
}

createServer((requisicao, resposta) => {
  const { pathname } = new URL(requisicao.url ?? "/", "http://localhost");

  if (requisicao.method === "GET" && pathname === "/") return responder(resposta, 200, {});
  if (requisicao.method === "GET" && pathname === "/api/agenda/eventos") {
    return responder(resposta, 200, eventos);
  }
  const detalhe = pathname.match(/^\/api\/agenda\/eventos\/([^/]+)$/);
  if (requisicao.method === "GET" && detalhe) {
    const evento = eventos.find((e) => e.id === decodeURIComponent(detalhe[1]));
    return evento ? responder(resposta, 200, evento) : responder(resposta, 404);
  }
  if (requisicao.method === "POST" && pathname === "/api/agenda/participacoes/situacao") {
    requisicao.resume();
    return responder(resposta, 200, []);
  }
  return responder(resposta, 404);
}).listen(porta);
