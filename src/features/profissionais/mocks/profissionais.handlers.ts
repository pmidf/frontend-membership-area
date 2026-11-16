import { http, HttpResponse } from "msw/http";

import type { Pagina } from "@/shared/api/tipos";

import type { ItemProfissional, PerfilProfissional } from "../tipos/profissional";

const id = (numero: number) => `70000000-0000-4000-8000-${String(numero).padStart(12, "0")}`;

export const camila: PerfilProfissional = {
  id_pessoa: id(1),
  nome_completo: "Camila Lopes",
  foto_perfil: null,
  cargo: "Gerente de Projetos Sênior",
  empresa: "Construtora Vega",
  cidade: "Brasília",
  uf: "DF",
  mini_bio: "Gerencio obras de infraestrutura urbana.\nApaixonada por mentoria.",
  linkedin_url: "https://linkedin.com/in/camilalopes",
};

export const diego: PerfilProfissional = {
  id_pessoa: id(2),
  nome_completo: "Diego Ramos",
  foto_perfil: "https://cdn.exemplo.com/diego.png",
  cargo: "Analista de Projetos Pleno",
  empresa: "Nexa Tecnologia",
  cidade: "Goiânia",
  uf: "GO",
  mini_bio: null,
  linkedin_url: null,
};

const perfis = [camila, diego];

export const itensTeste: ItemProfissional[] = [
  ...perfis.map((perfil) => ({
    id_pessoa: perfil.id_pessoa,
    nome_completo: perfil.nome_completo,
    foto_perfil: perfil.foto_perfil,
    cargo: perfil.cargo,
    empresa: perfil.empresa,
    cidade: perfil.cidade,
    uf: perfil.uf,
  })),
  ...Array.from({ length: 21 }, (_, indice) => ({
    id_pessoa: id(indice + 10),
    nome_completo: `Profissional ${String(indice + 1).padStart(2, "0")}`,
    foto_perfil: null,
    cargo: "Coordenador de PMO",
    empresa: "Instituto Federal de Gestão",
    cidade: "Brasília",
    uf: "DF",
  })),
];

function paginar(itens: ItemProfissional[], url: URL): Pagina<ItemProfissional> {
  const parametros = url.searchParams;
  const termo = (parametros.get("q") ?? "").toLowerCase();
  const uf = parametros.get("uf");
  const cidade = parametros.get("cidade")?.toLowerCase();
  const pagina = Number(parametros.get("page") ?? 1);
  const encontrados = itens.filter(
    (item) =>
      `${item.nome_completo} ${item.cargo} ${item.empresa}`.toLowerCase().includes(termo) &&
      (!uf || item.uf === uf) &&
      (!cidade || item.cidade.toLowerCase() === cidade),
  );
  return {
    total: encontrados.length,
    pagina,
    total_paginas: Math.ceil(encontrados.length / 20),
    itens: encontrados.slice((pagina - 1) * 20, pagina * 20),
  };
}

export function handlersProfissionais(resposta?: Pagina<ItemProfissional>) {
  return [
    http.get("*/api/profissionais", ({ request }) =>
      HttpResponse.json(resposta ?? paginar(itensTeste, new URL(request.url))),
    ),
    http.get("*/api/profissionais/:id", ({ params }) => {
      const perfil = perfis.find((item) => item.id_pessoa === params.id);
      return perfil
        ? HttpResponse.json(perfil)
        : HttpResponse.json({ codigo: "PROFISSIONAL_NAO_ENCONTRADO" }, { status: 404 });
    }),
  ];
}
