import { http, HttpResponse } from "msw/http";

import type { PessoaResumo } from "../api/pessoas-admin.api";

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
