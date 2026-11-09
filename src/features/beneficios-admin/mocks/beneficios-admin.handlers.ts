import { http, HttpResponse } from "msw/http";

import type { Pagina } from "@/shared/api/tipos";

import type { BeneficioAdmin } from "../api/beneficios-admin.api";
import type { ItemBeneficioAdmin } from "../tipos/beneficio-admin";

const id = (numero: number) => `40000000-0000-4000-8000-${String(numero).padStart(12, "0")}`;

const base: ItemBeneficioAdmin = {
  id_beneficio: "",
  titulo: "",
  parceiro: "Parceiro Geral",
  categoria: "CARREIRA",
  tipo_resgate: "CUPOM",
  vigencia_inicio: "2026-01-01",
  vigencia_fim: "2026-12-31",
  situacao: "PUBLICADO",
  quantidade_resgates: 0,
};

export const beneficiosAdminTeste: ItemBeneficioAdmin[] = [
  {
    ...base,
    id_beneficio: id(1),
    titulo: "Voucher do exame PMP",
    parceiro: "PMI Global",
    categoria: "CERTIFICACAO",
    quantidade_resgates: 18,
  },
  {
    ...base,
    id_beneficio: id(2),
    titulo: "Consultoria de carreira",
    parceiro: "Impact Hub",
    tipo_resgate: "INSTRUCAO",
    vigencia_fim: null,
    situacao: "RASCUNHO",
  },
  {
    ...base,
    id_beneficio: id(3),
    titulo: "Curso de liderança",
    parceiro: "Impact Hub",
    categoria: "EDUCACAO",
    situacao: "ARQUIVADO",
    quantidade_resgates: 37,
  },
  ...Array.from({ length: 22 }, (_, indice) => ({
    ...base,
    id_beneficio: id(indice + 4),
    titulo: `Benefício ${String(indice + 1).padStart(2, "0")}`,
    quantidade_resgates: 1,
  })),
];

export function filtrarBeneficiosAdmin(
  itens: ItemBeneficioAdmin[],
  url: URL,
): Pagina<ItemBeneficioAdmin> {
  const parametros = url.searchParams;
  const termo = (parametros.get("q") ?? "").toLowerCase();
  const pagina = Number(parametros.get("page") ?? 1);
  const ordenar = parametros.get("ordenar");
  const coincide = (campo: "situacao" | "tipo_resgate" | "categoria", valor: string) =>
    !parametros.get(campo) || parametros.get(campo) === valor;
  const encontrados = itens
    .filter(
      (item) =>
        `${item.titulo} ${item.parceiro}`.toLowerCase().includes(termo) &&
        coincide("situacao", item.situacao) &&
        coincide("tipo_resgate", item.tipo_resgate) &&
        coincide("categoria", item.categoria),
    )
    .sort((a, b) => {
      if (!ordenar) return 0;
      const diferenca = a.quantidade_resgates - b.quantidade_resgates;
      return ordenar === "resgates_desc" ? -diferenca : diferenca;
    });
  return {
    total: encontrados.length,
    pagina,
    total_paginas: Math.ceil(encontrados.length / 20),
    itens: encontrados.slice((pagina - 1) * 20, pagina * 20),
  };
}

export function handlersBeneficiosAdmin(itens: ItemBeneficioAdmin[] = beneficiosAdminTeste) {
  return [
    http.get("*/api/admin/beneficios", ({ request }) =>
      HttpResponse.json(filtrarBeneficiosAdmin(itens, new URL(request.url))),
    ),
    http.get("*/api/admin/beneficios/export.csv", () =>
      HttpResponse.text("título,parceiro\nA,B", {
        headers: { "Content-Disposition": 'attachment; filename="beneficios-2026-11-09.csv"' },
      }),
    ),
  ];
}

export const beneficioAdminTeste: BeneficioAdmin = {
  id_beneficio: id(1),
  titulo: "Voucher do exame PMP",
  legenda: "Desconto no exame",
  descricao: "Primeira linha.\nSegunda linha.",
  imagem: "https://exemplo.test/beneficio.png",
  cod_parceiro: "50000000-0000-4000-8000-000000000001",
  parceiro: "PMI Global",
  categoria: "CERTIFICACAO",
  tipo_resgate: "CUPOM",
  cod_cupom: "PMI-2026",
  desc_instrucao: null,
  situacao: "RASCUNHO",
  vigencia_inicio: "2026-01-01",
  vigencia_fim: "2026-12-31",
  data_publicacao: null,
  quantidade_resgates: 0,
};

export function handlersBeneficioAdmin(inicial: BeneficioAdmin = beneficioAdminTeste) {
  let beneficio = inicial;
  const situacao = (nova: BeneficioAdmin["situacao"]) => () => {
    beneficio = { ...beneficio, situacao: nova };
    return HttpResponse.json(beneficio);
  };
  return [
    http.get("*/api/admin/beneficios/:id", ({ params }) =>
      params.id === beneficio.id_beneficio
        ? HttpResponse.json(beneficio)
        : HttpResponse.json({ codigo: "BENEFICIO_NAO_ENCONTRADO" }, { status: 404 }),
    ),
    http.patch("*/api/admin/beneficios/:id", async ({ request }) => {
      beneficio = { ...beneficio, ...((await request.json()) as Partial<BeneficioAdmin>) };
      return HttpResponse.json(beneficio);
    }),
    http.post("*/api/admin/beneficios/:id/publicar", situacao("PUBLICADO")),
    http.post("*/api/admin/beneficios/:id/despublicar", situacao("RASCUNHO")),
    http.post("*/api/admin/beneficios/:id/arquivar", situacao("ARQUIVADO")),
    http.post("*/api/admin/beneficios/:id/duplicar", () =>
      HttpResponse.json(
        { ...beneficio, id_beneficio: id(99), situacao: "RASCUNHO" },
        { status: 201 },
      ),
    ),
  ];
}
