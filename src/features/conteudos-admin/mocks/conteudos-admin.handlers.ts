import { http, HttpResponse } from "msw/http";

import {
  categoriasTeste,
  COD_MATERIAIS,
  COD_TECNOLOGIA,
} from "@/features/conteudos/mocks/conteudos.handlers";
import type { CategoriaConteudo } from "@/features/conteudos/tipos/conteudo";
import type { Pagina } from "@/shared/api/tipos";
import { somarDias } from "@/shared/lib/datas";

import type { AcessoConteudo, ConteudoAdmin } from "../tipos/conteudo-admin";

const id = (numero: number) => `60000000-0000-4000-8000-${String(numero).padStart(12, "0")}`;

const tecnologia = { cod_categoria: COD_TECNOLOGIA, desc_categoria: "Tecnologia" };
const materiais = { cod_categoria: COD_MATERIAIS, desc_categoria: "Materiais" };

const base: ConteudoAdmin = {
  id_conteudo: "",
  id_pessoa_publicou: "70000000-0000-4000-8000-000000000001",
  tipo: "VIDEO",
  situacao: "PUBLICADO",
  cod_categoria: COD_TECNOLOGIA,
  titulo: "",
  descricao: "Descrição",
  url: "https://youtu.be/dQw4w9WgXcQ",
  bol_exclusivo: true,
  duracao_segundos: 2530,
  data_publicacao: "2026-10-01T15:00:00.000Z",
  data_criacao: "2026-09-30T15:00:00.000Z",
  data_atualizacao: "2026-10-01T15:00:00.000Z",
  categoria: tecnologia,
};

export const conteudoVideo: ConteudoAdmin = {
  ...base,
  id_conteudo: id(1),
  titulo: "Mesa redonda: IA aplicada a projetos",
};

export const conteudoRascunho: ConteudoAdmin = {
  ...base,
  id_conteudo: id(2),
  titulo: "Como montar seu plano de PDUs",
  situacao: "RASCUNHO",
  bol_exclusivo: false,
  data_publicacao: null,
};

export const conteudoArquivado: ConteudoAdmin = {
  ...base,
  id_conteudo: id(3),
  titulo: "Modelo de canvas de projeto",
  tipo: "MATERIAL",
  situacao: "ARQUIVADO",
  url: "https://exemplo.test/canvas.pdf",
  duracao_segundos: null,
  cod_categoria: COD_MATERIAIS,
  categoria: materiais,
};

export const conteudosAdminTeste: ConteudoAdmin[] = [
  conteudoVideo,
  conteudoRascunho,
  conteudoArquivado,
  ...Array.from({ length: 22 }, (_, indice) => ({
    ...base,
    id_conteudo: id(indice + 4),
    titulo: `Conteúdo ${String(indice + 1).padStart(2, "0")}`,
  })),
];

export function filtrarConteudosAdmin(itens: ConteudoAdmin[], url: URL): Pagina<ConteudoAdmin> {
  const parametros = url.searchParams;
  const termo = (parametros.get("q") ?? "").toLowerCase();
  const pagina = Number(parametros.get("page") ?? 1);
  const coincide = (campo: string, valor: string) =>
    !parametros.get(campo) || parametros.get(campo) === valor;
  const encontrados = itens.filter(
    (item) =>
      `${item.titulo} ${item.descricao}`.toLowerCase().includes(termo) &&
      coincide("situacao", item.situacao) &&
      coincide("tipo", item.tipo) &&
      coincide("categoria", item.cod_categoria),
  );
  return {
    total: encontrados.length,
    pagina,
    total_paginas: Math.ceil(encontrados.length / 20),
    itens: encontrados.slice((pagina - 1) * 20, pagina * 20),
  };
}

export function handlersConteudosAdmin(itens: ConteudoAdmin[] = conteudosAdminTeste) {
  return [
    http.get("*/api/admin/conteudos", ({ request }) =>
      HttpResponse.json(filtrarConteudosAdmin(itens, new URL(request.url))),
    ),
    http.get("*/api/conteudo-categorias", () => HttpResponse.json(categoriasTeste)),
  ];
}

export const previaTeste = {
  video_id: "dQw4w9WgXcQ",
  embed_url: "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ",
};

const ERRO_URL_YOUTUBE = {
  statusCode: 422,
  codigo: "DADOS_INVALIDOS",
  campos: {
    url: ["URL do YouTube inválida: use youtube.com/watch?v=, youtu.be/ ou youtube.com/embed/"],
  },
};

export const handlerPreviaYoutube = http.post(
  "*/api/admin/conteudos/youtube/preview",
  async ({ request }) => {
    const { url } = (await request.json()) as { url: string };
    return url.includes("youtu")
      ? HttpResponse.json(previaTeste)
      : HttpResponse.json(ERRO_URL_YOUTUBE, { status: 422 });
  },
);

export function handlersConteudoAdmin(inicial: ConteudoAdmin = conteudoRascunho) {
  let conteudo = inicial;
  return [
    handlerPreviaYoutube,
    http.get("*/api/conteudo-categorias", () => HttpResponse.json(categoriasTeste)),
    http.post("*/api/admin/conteudos", async ({ request }) => {
      const corpo = (await request.json()) as Partial<ConteudoAdmin>;
      conteudo = {
        ...base,
        ...corpo,
        id_conteudo: id(90),
        situacao: "RASCUNHO",
        data_publicacao: null,
        duracao_segundos: corpo.duracao_segundos ?? null,
      };
      return HttpResponse.json(conteudo, { status: 201 });
    }),
    http.get("*/api/admin/conteudos/:id", ({ params }) =>
      params.id === conteudo.id_conteudo
        ? HttpResponse.json(conteudo)
        : HttpResponse.json(
            { statusCode: 404, message: "Conteúdo não encontrado" },
            { status: 404 },
          ),
    ),
    http.patch("*/api/admin/conteudos/:id", async ({ request }) => {
      conteudo = { ...conteudo, ...((await request.json()) as Partial<ConteudoAdmin>) };
      return HttpResponse.json(conteudo);
    }),
    http.post("*/api/admin/conteudos/:id/publicar", () => {
      conteudo = {
        ...conteudo,
        situacao: "PUBLICADO",
        data_publicacao: "2026-11-12T12:00:00.000Z",
      };
      return HttpResponse.json(conteudo);
    }),
    http.delete("*/api/admin/conteudos/:id", () => {
      conteudo = { ...conteudo, situacao: "ARQUIVADO" };
      return new HttpResponse(null, { status: 204 });
    }),
  ];
}

export function handlersCategoriasAdmin(iniciais: CategoriaConteudo[] = categoriasTeste) {
  let categorias = [...iniciais];
  const ordenadas = () =>
    [...categorias].sort(
      (a, b) => a.ordem - b.ordem || a.desc_categoria.localeCompare(b.desc_categoria, "pt-BR"),
    );
  return [
    http.get("*/api/conteudo-categorias", () => HttpResponse.json(ordenadas())),
    http.post("*/api/admin/conteudo-categorias", async ({ request }) => {
      const { desc_categoria } = (await request.json()) as { desc_categoria: string };
      if (categorias.some((categoria) => categoria.desc_categoria === desc_categoria)) {
        return HttpResponse.json(
          { message: "Já existe uma categoria com esse nome" },
          { status: 409 },
        );
      }
      const nova = {
        cod_categoria: `50000000-0000-4000-8000-${String(categorias.length + 1).padStart(12, "0")}`,
        desc_categoria,
        ordem: Math.max(0, ...categorias.map(({ ordem }) => ordem)) + 1,
      };
      categorias = [...categorias, nova];
      return HttpResponse.json(nova, { status: 201 });
    }),
    http.patch("*/api/admin/conteudo-categorias/:id", async ({ params, request }) => {
      const dados = (await request.json()) as Partial<CategoriaConteudo>;
      const duplicada = categorias.some(
        ({ cod_categoria, desc_categoria }) =>
          cod_categoria !== params.id && desc_categoria === dados.desc_categoria,
      );
      if (duplicada) {
        return HttpResponse.json(
          { message: "Já existe uma categoria com esse nome" },
          { status: 409 },
        );
      }
      categorias = categorias.map((categoria) =>
        categoria.cod_categoria === params.id ? { ...categoria, ...dados } : categoria,
      );
      return HttpResponse.json(categorias.find(({ cod_categoria }) => cod_categoria === params.id));
    }),
  ];
}

const HOJE_TESTE = "2026-11-12";

function serieDoPeriodo(url: URL) {
  const ate = url.searchParams.get("ate") ?? HOJE_TESTE;
  const de = url.searchParams.get("de") ?? somarDias(ate, -29);
  const serie = [];
  for (let dia = de, indice = 0; dia <= ate; dia = somarDias(dia, 1), indice += 1) {
    serie.push({ dia, visualizacoes: indice % 3 });
  }
  return serie;
}

export const acessosTeste: AcessoConteudo[] = Array.from({ length: 25 }, (_, indice) => ({
  nome: indice === 0 ? "Carla Menezes" : `Pessoa ${indice + 1}`,
  cargo: "Gerente de projetos",
  empresa: indice === 0 ? "PMI-DF" : "",
  data_acesso: `2026-11-${String(12 - (indice % 10)).padStart(2, "0")}T17:32:00.000Z`,
}));

export function handlersEstatisticas({
  conteudo = conteudoVideo,
  acessos = acessosTeste,
}: { conteudo?: ConteudoAdmin; acessos?: AcessoConteudo[] } = {}) {
  const caminho = `*/api/admin/conteudos/${conteudo.id_conteudo}`;
  return [
    http.get(`${caminho}/estatisticas`, ({ request }) => {
      const serie = serieDoPeriodo(new URL(request.url));
      const vazio = acessos.length === 0;
      return HttpResponse.json({
        titulo: conteudo.titulo,
        tipo: conteudo.tipo,
        situacao: conteudo.situacao,
        data_publicacao: conteudo.data_publicacao,
        visualizacoes_totais: acessos.length,
        espectadores_unicos: vazio ? 0 : 21,
        visualizacoes_recentes: vazio ? 0 : 6,
        serie: vazio ? serie.map(({ dia }) => ({ dia, visualizacoes: 0 })) : serie,
      });
    }),
    http.get(`${caminho}/acessos`, ({ request }) => {
      const pagina = Number(new URL(request.url).searchParams.get("page") ?? 1);
      return HttpResponse.json({
        total_acessos: acessos.length,
        total_espectadores: acessos.length === 0 ? 0 : 21,
        pagina,
        total_paginas: Math.ceil(acessos.length / 20),
        acessos: acessos.slice((pagina - 1) * 20, pagina * 20),
      });
    }),
    http.get(`${caminho}/acessos/export.csv`, () =>
      HttpResponse.text("nome;email\nCarla;c@x", {
        headers: {
          "Content-Disposition": `attachment; filename="acessos-${conteudo.id_conteudo}.csv"`,
        },
      }),
    ),
  ];
}
