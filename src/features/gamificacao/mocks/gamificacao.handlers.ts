import { http, HttpResponse } from "msw/http";

import type { DetalheConcluido, PainelGamificacao } from "../tipos/gamificacao";

const recorte = (indice: number) => `https://exemplo.test/pecas/${indice}.png`;

const id = (numero: number) => `30000000-0000-4000-8000-${String(numero).padStart(12, "0")}`;

export const painelTeste: PainelGamificacao = {
  creditos: 2,
  em_andamento: {
    pecas_obtidas: 5,
    total_pecas: 8,
    pecas: [0, 1, 2, 3, 4].map((indice) => ({ indice, recorte: recorte(indice) })),
  },
  concluidos: [
    {
      progresso_id: id(1),
      nome: "Diretoria 2023–2024",
      legenda: "A diretoria eleita no seu primeiro evento",
      imagem_original: "https://exemplo.test/diretoria.png",
      concluido_em: "2025-11-20T15:00:00.000Z",
    },
    {
      progresso_id: id(2),
      nome: "Summit 2025",
      legenda: "O maior encontro do capítulo",
      imagem_original: "https://exemplo.test/summit.png",
      concluido_em: "2026-06-30T15:00:00.000Z",
    },
    {
      progresso_id: id(3),
      nome: "Fundação do PMI-DF",
      legenda: "Onde tudo começou",
      imagem_original: "https://exemplo.test/fundacao.png",
      concluido_em: "2025-03-02T15:00:00.000Z",
    },
  ],
};

export const painelSemAndamento: PainelGamificacao = {
  creditos: 0,
  em_andamento: null,
  concluidos: [],
};

export const detalheTeste: DetalheConcluido = {
  nome: "Diretoria 2023–2024",
  legenda: "A diretoria eleita no seu primeiro evento",
  historia:
    "Registro da diretoria eleita para o biênio, retratada em seu primeiro evento de posse.",
  imagem_original: "https://exemplo.test/diretoria.png",
  concluido_em: "2025-11-20T15:00:00.000Z",
};

export function handlersGamificacao(painel: PainelGamificacao = painelTeste) {
  return [
    http.get("*/api/gamificacao", () => HttpResponse.json(painel)),
    http.get("*/api/gamificacao/concluidos/:id", ({ params }) =>
      painel.concluidos.some((item) => item.progresso_id === params.id)
        ? HttpResponse.json(detalheTeste)
        : HttpResponse.json({ codigo: "QUEBRA_CABECA_NAO_ENCONTRADO" }, { status: 404 }),
    ),
  ];
}
