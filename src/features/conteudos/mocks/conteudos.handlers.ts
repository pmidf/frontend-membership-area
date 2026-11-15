import { http, HttpResponse } from "msw/http";

import type {
  AcessoMaterial,
  Catalogo,
  CategoriaConteudo,
  ConteudoAcessivel,
  DetalheConteudo,
  GrupoCatalogo,
  ItemCatalogoCompleto,
  ItemCatalogoPrevia,
  PlayerConteudo,
} from "../tipos/conteudo";
import type { DetalheTrilha, ResumoTrilha, TrilhaDoConteudo } from "../tipos/trilha";

const DIA_EM_MS = 86_400_000;
const id = (numero: number) => `40000000-0000-4000-8000-${String(numero).padStart(12, "0")}`;

export const COD_TECNOLOGIA = "50000000-0000-4000-8000-000000000001";
export const COD_MATERIAIS = "50000000-0000-4000-8000-000000000002";

export const categoriasTeste: CategoriaConteudo[] = [
  { cod_categoria: COD_TECNOLOGIA, desc_categoria: "Tecnologia", ordem: 1 },
  { cod_categoria: COD_MATERIAIS, desc_categoria: "Materiais", ordem: 2 },
];

const baseItem: ItemCatalogoCompleto = {
  id_conteudo: "",
  titulo: "",
  descricao: "Descrição",
  tipo: "VIDEO",
  duracao_segundos: null,
  data_publicacao: "2026-08-22T15:00:00.000Z",
  bol_exclusivo: true,
  consumido: false,
  data_consumo: null,
  bloqueado: false,
};

export const videoVisto: ItemCatalogoCompleto = {
  ...baseItem,
  id_conteudo: id(1),
  titulo: "Mesa redonda: IA aplicada a projetos",
  duracao_segundos: 2530,
  consumido: true,
  data_consumo: "2026-10-20T14:30:00.000Z",
};

export const materialNovo: ItemCatalogoCompleto = {
  ...baseItem,
  id_conteudo: id(2),
  titulo: "Modelo de canvas de projeto",
  tipo: "MATERIAL",
  data_publicacao: new Date(Date.now() - 3 * DIA_EM_MS).toISOString(),
};

export const videoPublico: ItemCatalogoCompleto = {
  ...baseItem,
  id_conteudo: id(3),
  titulo: "Como montar seu plano de PDUs",
  duracao_segundos: 1185,
  bol_exclusivo: false,
};

export const itemBloqueado: ItemCatalogoPrevia = {
  id_conteudo: id(5),
  titulo: "Gestão de riscos em contratos públicos",
  tipo: "VIDEO",
  data_publicacao: new Date(Date.now() - DIA_EM_MS).toISOString(),
  bol_exclusivo: true,
  bloqueado: true,
};

export function montarCatalogo(
  categorias: GrupoCatalogo[],
  extras: Partial<Catalogo> = {},
): Catalogo {
  const total = categorias.reduce((soma, grupo) => soma + grupo.itens.length, 0);
  return { total, total_publicados: total, pagina: 1, total_paginas: 1, categorias, ...extras };
}

export const catalogoFiliado = montarCatalogo([
  {
    cod_categoria: COD_TECNOLOGIA,
    desc_categoria: "Tecnologia",
    itens: [videoVisto, { ...videoPublico, consumido: false }],
  },
  { cod_categoria: COD_MATERIAIS, desc_categoria: "Materiais", itens: [materialNovo] },
]);

export const catalogoPrevia = montarCatalogo([
  {
    cod_categoria: COD_TECNOLOGIA,
    desc_categoria: "Tecnologia",
    itens: [itemBloqueado, videoPublico],
  },
]);

export function handlersConteudos(catalogo: Catalogo = catalogoFiliado) {
  return [
    http.get("*/api/trilhas", () => HttpResponse.json([])),
    http.get("*/api/conteudos", () => HttpResponse.json(catalogo)),
    http.get("*/api/conteudo-categorias", () => HttpResponse.json(categoriasTeste)),
  ];
}

const categoriaTecnologia = { cod_categoria: COD_TECNOLOGIA, desc_categoria: "Tecnologia" };

export const detalheVideo: ConteudoAcessivel = {
  ...videoVisto,
  descricao: "Três diretores de PMO discutem IA em projetos.",
  consumido: false,
  data_consumo: null,
  categoria: categoriaTecnologia,
};

export const detalheMaterial: ConteudoAcessivel = {
  ...materialNovo,
  descricao: "Modelo editável de canvas.",
  categoria: { cod_categoria: COD_MATERIAIS, desc_categoria: "Materiais" },
};

export const detalheBloqueado: DetalheConteudo = {
  ...itemBloqueado,
  categoria: categoriaTecnologia,
};

export const playerTeste: PlayerConteudo = {
  video_id: "dQw4w9WgXcQ",
  embed_url: "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ",
};

export const acessoMaterialTeste: AcessoMaterial = { url: "https://exemplo.test/material.pdf" };

const trilhaBase: TrilhaDoConteudo = {
  id_trilha: "80000000-0000-4000-8000-000000000001",
  titulo: "IA e dados em projetos",
  descricao: "Da mesa redonda ao plano de PDUs.",
  data_publicacao: "2026-10-01T15:00:00.000Z",
  total_itens: 3,
  itens_vistos: 1,
  posicao: 1,
  proximo: videoPublico,
};

export const trilhaComProximo: TrilhaDoConteudo = trilhaBase;

export const trilhaComProximoBloqueado: TrilhaDoConteudo = {
  ...trilhaBase,
  id_trilha: "80000000-0000-4000-8000-000000000002",
  titulo: "Riscos no setor público",
  total_itens: 2,
  itens_vistos: 0,
  proximo: itemBloqueado,
};

export const trilhaNoFim: TrilhaDoConteudo = {
  ...trilhaBase,
  id_trilha: "80000000-0000-4000-8000-000000000003",
  titulo: "Carreira em projetos",
  total_itens: 2,
  itens_vistos: 2,
  posicao: 2,
  proximo: null,
};

export function handlersDetalhe(
  detalhe: DetalheConteudo = detalheVideo,
  trilhas: TrilhaDoConteudo[] = [],
) {
  let consumido = !detalhe.bloqueado && detalhe.consumido;
  const marcar = (valor: boolean) => {
    consumido = valor;
    return new HttpResponse(null, { status: 204 });
  };
  return [
    http.get("*/api/conteudos/:id", () =>
      HttpResponse.json(detalhe.bloqueado ? detalhe : { ...detalhe, consumido }),
    ),
    http.get("*/api/conteudos/:id/player", () => HttpResponse.json(playerTeste)),
    http.get("*/api/conteudos/publicos/:id/player", () => HttpResponse.json(playerTeste)),
    http.put("*/api/conteudos/:id/consumido", () => marcar(true)),
    http.delete("*/api/conteudos/:id/consumido", () => marcar(false)),
    http.post("*/api/conteudos/:id/acessos", () =>
      HttpResponse.json(acessoMaterialTeste, { status: 201 }),
    ),
    http.get("*/api/conteudos/:id/trilhas", () => HttpResponse.json(trilhas)),
  ];
}

const idTrilha = (numero: number) => `80000000-0000-4000-8000-${String(numero).padStart(12, "0")}`;

const resumoBase: ResumoTrilha = {
  id_trilha: "",
  titulo: "",
  descricao: "Sequência de estudo.",
  data_publicacao: "2026-10-01T15:00:00.000Z",
  total_itens: 3,
  itens_vistos: 0,
};

export const trilhaEmAndamento: DetalheTrilha = {
  ...resumoBase,
  id_trilha: idTrilha(11),
  titulo: "Projetos no setor público",
  descricao: "Do PMBOK 7 ao canvas de projeto do PMI-DF.",
  itens_vistos: 1,
  itens: [videoVisto, { ...videoPublico, consumido: false }, materialNovo],
};

export const trilhaPrevia: DetalheTrilha = {
  ...trilhaEmAndamento,
  itens_vistos: 0,
  itens: [{ ...videoPublico, consumido: false }, itemBloqueado],
  total_itens: 2,
};

export const trilhaConcluida: DetalheTrilha = {
  ...trilhaEmAndamento,
  itens_vistos: 1,
  total_itens: 1,
  itens: [videoVisto],
};

export const resumosTrilhas: ResumoTrilha[] = [
  { ...resumoBase, id_trilha: idTrilha(11), titulo: "Projetos no setor público", itens_vistos: 1 },
  { ...resumoBase, id_trilha: idTrilha(12), titulo: "Agilidade na prática", total_itens: 5 },
  { ...resumoBase, id_trilha: idTrilha(13), titulo: "Carreira em projetos", itens_vistos: 3 },
  { ...resumoBase, id_trilha: idTrilha(14), titulo: "Riscos no setor público", total_itens: 1 },
];

export function handlersTrilhas(
  trilhas: ResumoTrilha[] = resumosTrilhas,
  detalhe: DetalheTrilha = trilhaEmAndamento,
) {
  return [
    http.get("*/api/trilhas", () => HttpResponse.json(trilhas)),
    http.get("*/api/trilhas/:id", ({ params }) =>
      params.id === detalhe.id_trilha
        ? HttpResponse.json(detalhe)
        : HttpResponse.json({ statusCode: 404, message: "Trilha não encontrada" }, { status: 404 }),
    ),
  ];
}
