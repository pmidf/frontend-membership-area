import { http, HttpResponse } from "msw/http";

import { hojeNoFuso } from "@/shared/lib/datas";

import type {
  CategoriaBeneficio,
  DetalheBeneficio,
  ItemBeneficio,
  ListaBeneficios,
  PreviaBeneficios,
  RespostaBeneficios,
} from "../tipos/beneficio";

export const IMAGEM_TESTE = "https://exemplo.test/beneficio.png";

export const previaTeste: PreviaBeneficios = {
  total: 18,
  itens: Array.from({ length: 6 }, () => ({ imagem: IMAGEM_TESTE, bloqueado: true })),
};

const DIA_EM_MS = 86_400_000;
const daquiA = (dias: number) => hojeNoFuso(new Date(Date.now() + dias * DIA_EM_MS));

const baseItem: ItemBeneficio = {
  id_beneficio: "",
  titulo: "",
  legenda: "Legenda",
  imagem: IMAGEM_TESTE,
  parceiro: "Parceiro Geral",
  categoria: "CARREIRA",
  vigencia_fim: "2099-12-31",
  resgatado: false,
  bloqueado: false,
};

const id = (numero: number) => `20000000-0000-4000-8000-${String(numero).padStart(12, "0")}`;

export const itensTeste: ItemBeneficio[] = [
  {
    ...baseItem,
    id_beneficio: id(1),
    titulo: "30% em cursos de preparação PMP",
    parceiro: "Brisk Educação",
    categoria: "EDUCACAO",
  },
  {
    ...baseItem,
    id_beneficio: id(2),
    titulo: "Voucher do exame PMP",
    parceiro: "PMI Global",
    categoria: "CERTIFICACAO",
    vigencia_fim: daquiA(5),
  },
  {
    ...baseItem,
    id_beneficio: id(3),
    titulo: "Licença de cronograma",
    parceiro: "Plannix",
    categoria: "FERRAMENTAS",
    vigencia_fim: null,
  },
  {
    ...baseItem,
    id_beneficio: id(4),
    titulo: "Trilha de Business Agility",
    parceiro: "BRA LAB",
    categoria: "EDUCACAO",
    resgatado: true,
  },
  ...Array.from({ length: 21 }, (_, indice) => ({
    ...baseItem,
    id_beneficio: id(indice + 5),
    titulo: `Vantagem ${String(indice + 1).padStart(2, "0")}`,
  })),
];

export const detalheTeste: DetalheBeneficio = {
  id_beneficio: id(1),
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

export function filtrarLista(itens: ItemBeneficio[], url: URL): ListaBeneficios {
  const termo = (url.searchParams.get("q") ?? "").toLowerCase();
  const categoria = url.searchParams.get("categoria");
  const pagina = Number(url.searchParams.get("page") ?? 1);
  const encontrados = itens.filter(
    (item) =>
      (!categoria || item.categoria === categoria) &&
      `${item.titulo} ${item.parceiro}`.toLowerCase().includes(termo),
  );
  return {
    total: encontrados.length,
    pagina,
    total_paginas: Math.ceil(encontrados.length / 20),
    itens: encontrados.slice((pagina - 1) * 20, pagina * 20),
    categorias: [...new Set(itens.map((item) => item.categoria))] as CategoriaBeneficio[],
  };
}

export function handlersBeneficios(resposta: RespostaBeneficios = previaTeste) {
  return [
    http.get("*/api/beneficios", () => HttpResponse.json(resposta)),
    http.get("*/api/beneficios/:id", () => HttpResponse.json(detalheTeste)),
  ];
}

export function handlersCatalogo(itens: ItemBeneficio[] = itensTeste) {
  return [
    http.get("*/api/beneficios", ({ request }) =>
      HttpResponse.json(filtrarLista(itens, new URL(request.url))),
    ),
  ];
}
