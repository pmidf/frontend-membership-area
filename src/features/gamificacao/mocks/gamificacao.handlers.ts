import { http, HttpResponse } from "msw/http";

import type { DetalheConcluido, PainelGamificacao } from "../tipos/gamificacao";

export const recorte = (indice: number) => `https://exemplo.test/pecas/${indice}.png`;

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

export const quebraCabecaQuaseCompleto = {
  nome: "Meetup de Ágeis",
  legenda: "Comunidade ágil do capítulo",
  historia: "O primeiro meetup da comunidade ágil, que virou encontro mensal.",
  imagem_original: "https://exemplo.test/ageis.png",
};

function sortearPeca(painel: PainelGamificacao) {
  const atual = painel.em_andamento;
  if (!atual) {
    return HttpResponse.json({ codigo: "SEM_QUEBRA_CABECA_EM_ANDAMENTO" }, { status: 409 });
  }
  if (painel.creditos <= 0) {
    return HttpResponse.json({ codigo: "SEM_CREDITOS" }, { status: 409 });
  }
  const indice = Array.from({ length: 8 }, (_, posicao) => posicao).find(
    (posicao) => !atual.pecas.some((peca) => peca.indice === posicao),
  ) as number;
  painel.creditos -= 1;
  atual.pecas.push({ indice, recorte: recorte(indice) });
  atual.pecas_obtidas += 1;
  const base = {
    indice,
    recorte: recorte(indice),
    pecas_obtidas: atual.pecas_obtidas,
    creditos: painel.creditos,
  };
  if (atual.pecas_obtidas < 8) return HttpResponse.json({ ...base, concluido: false });
  painel.em_andamento = null;
  painel.concluidos.unshift({
    progresso_id: "30000000-0000-4000-8000-000000000099",
    nome: quebraCabecaQuaseCompleto.nome,
    legenda: quebraCabecaQuaseCompleto.legenda,
    imagem_original: quebraCabecaQuaseCompleto.imagem_original,
    concluido_em: new Date().toISOString(),
  });
  return HttpResponse.json({ ...base, concluido: true, ...quebraCabecaQuaseCompleto });
}

export function handlersGamificacao(painelInicial: PainelGamificacao = painelTeste) {
  const painel = structuredClone(painelInicial);
  return [
    http.get("*/api/gamificacao", () => HttpResponse.json(painel)),
    http.get("*/api/gamificacao/creditos", () => HttpResponse.json({ saldo: painel.creditos })),
    http.post("*/api/gamificacao/sortear-peca", () => sortearPeca(painel)),
    http.post("*/api/gamificacao/sortear-quebra-cabeca", () => {
      if (painel.em_andamento) {
        return HttpResponse.json({ codigo: "QUEBRA_CABECA_EM_ANDAMENTO" }, { status: 409 });
      }
      painel.em_andamento = { pecas_obtidas: 0, total_pecas: 8, pecas: [] };
      return HttpResponse.json(
        { pecas_obtidas: 0, total_pecas: 8, creditos: painel.creditos },
        { status: 201 },
      );
    }),
    http.get("*/api/gamificacao/concluidos/:id", ({ params }) =>
      painel.concluidos.some((item) => item.progresso_id === params.id)
        ? HttpResponse.json(detalheTeste)
        : HttpResponse.json({ codigo: "QUEBRA_CABECA_NAO_ENCONTRADO" }, { status: 404 }),
    ),
  ];
}
