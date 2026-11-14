import { http, HttpResponse } from "msw/http";

import { perfilNaoFiliado } from "@/test/fixtures/pessoas";

import type { PessoaDetalheAdmin, PessoaResumo } from "../api/pessoas-admin.api";

const base: PessoaResumo = {
  id_pessoa: "00000000-0000-4000-8000-000000000000",
  nome_completo: "",
  email: null,
  situacao_conta: "ATIVA",
  bol_admin: false,
  data_cadastro: "2026-03-10T15:00:00.000Z",
  data_ultimo_acesso: null,
  filiacao: null,
};

const destaques: PessoaResumo[] = [
  {
    ...base,
    id_pessoa: "00000000-0000-4000-8000-000000000001",
    nome_completo: "Bruno Tavares",
    email: "bruno.tavares@teste.pmidf.org.br",
    situacao_conta: "SUSPENSA",
  },
  {
    ...base,
    id_pessoa: "00000000-0000-4000-8000-000000000002",
    nome_completo: "Camila Lopes",
    email: "camila.lopes@teste.pmidf.org.br",
    filiacao: { situacao: "APROVADO", pmi_id: "4471182" },
    data_ultimo_acesso: new Date().toISOString(),
  },
  {
    ...base,
    id_pessoa: "00000000-0000-4000-8000-000000000003",
    nome_completo: "Rafael Lima",
    email: "admin@pmidf.org.br",
    bol_admin: true,
    filiacao: { situacao: "PENDENTE", pmi_id: "9999999" },
  },
];

const demais = Array.from({ length: 22 }, (_, indice): PessoaResumo => {
  const numero = String(indice + 1).padStart(2, "0");
  return {
    ...base,
    id_pessoa: `10000000-0000-4000-8000-0000000000${numero}`,
    nome_completo: `Pessoa ${numero}`,
    email: `pessoa.${numero}@teste.pmidf.org.br`,
  };
});

export const pessoasTeste: PessoaResumo[] = [...destaques, ...demais];

export function filtrarPessoas(pessoas: PessoaResumo[], url: URL) {
  const busca = (url.searchParams.get("busca") ?? "").toLowerCase();
  const pagina = Number(url.searchParams.get("pagina") ?? 1);
  const tamanho = Number(url.searchParams.get("tamanho") ?? 20);
  const filtradas = pessoas.filter(
    ({ nome_completo, email, filiacao }) =>
      nome_completo.toLowerCase().includes(busca) ||
      email?.includes(busca) ||
      filiacao?.pmi_id === busca,
  );
  return {
    itens: filtradas.slice((pagina - 1) * tamanho, pagina * tamanho),
    total: filtradas.length,
    pagina,
    tamanho,
  };
}

export function handlersPessoasAdmin(pessoas: PessoaResumo[] = pessoasTeste) {
  return [
    http.get("*/api/admin/pessoas", ({ request }) =>
      HttpResponse.json(filtrarPessoas(pessoas, new URL(request.url))),
    ),
  ];
}

export const pessoaDetalheTeste: PessoaDetalheAdmin = {
  ...perfilNaoFiliado,
  id_pessoa: "00000000-0000-4000-8000-000000000001",
  nome_completo: "Bruno Tavares",
  email: "bruno.tavares@teste.pmidf.org.br",
  data_cadastro: "2026-08-30T15:00:00.000Z",
  exibida_na_vitrine: false,
  vitrine_oculta: false,
  data_vitrine_oculta: null,
  motivo_vitrine_oculta: null,
  sessoes_ativas: [
    {
      id_sessao: "8d7e6f5a-4b3c-4d2e-8f1a-9b8c7d6e5f4a",
      ip: "189.40.50.60",
      user_agent:
        "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36",
      data_criacao: "2026-10-20T08:00:00.000Z",
      data_ultimo_uso: "2026-10-30T09:00:00.000Z",
    },
  ],
};

export function handlersDetalhePessoa(inicial: PessoaDetalheAdmin = pessoaDetalheTeste) {
  let pessoa = inicial;
  const semConteudo = () => new HttpResponse(null, { status: 204 });
  return [
    http.get("*/api/admin/pessoas/:id", ({ params }) =>
      params.id === pessoa.id_pessoa
        ? HttpResponse.json(pessoa)
        : new HttpResponse(null, { status: 404 }),
    ),
    http.post("*/api/admin/pessoas/:id/suspender", () => {
      pessoa = { ...pessoa, situacao_conta: "SUSPENSA", sessoes_ativas: [] };
      return semConteudo();
    }),
    http.post("*/api/admin/pessoas/:id/reativar", () => {
      pessoa = { ...pessoa, situacao_conta: "ATIVA" };
      return semConteudo();
    }),
  ];
}
