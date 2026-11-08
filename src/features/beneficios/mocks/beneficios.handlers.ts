import { http, HttpResponse } from "msw/http";

import type { DetalheBeneficio, PreviaBeneficios, RespostaBeneficios } from "../tipos/beneficio";

export const IMAGEM_TESTE = "https://exemplo.test/beneficio.png";

export const previaTeste: PreviaBeneficios = {
  total: 18,
  itens: Array.from({ length: 6 }, () => ({ imagem: IMAGEM_TESTE, bloqueado: true })),
};

export const detalheTeste: DetalheBeneficio = {
  id_beneficio: "20000000-0000-4000-8000-000000000001",
  titulo: "30% em cursos de preparação PMP",
  legenda: "Desconto nas turmas de preparação",
  imagem: IMAGEM_TESTE,
  parceiro: "Brisk Educação",
  categoria: "EDUCACAO",
  vigencia_fim: "2027-11-30",
  resgatado: false,
  descricao: "Desconto aplicado sobre o valor cheio.\nVálido para turmas online.",
  tipo_resgate: "CUPOM",
  vigencia_inicio: "2026-06-01",
};

export function handlersBeneficios(resposta: RespostaBeneficios = previaTeste) {
  return [
    http.get("*/api/beneficios", () => HttpResponse.json(resposta)),
    http.get("*/api/beneficios/:id", () => HttpResponse.json(detalheTeste)),
  ];
}
