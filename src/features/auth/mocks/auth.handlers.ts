import { http, HttpResponse } from "msw/http";

import { TOKEN_TESTE } from "@/test/handlers-sessao";

export const SENHA_TESTE = "SenhaForte2026!";

const respostasPorEmail: Record<string, () => Response> = {
  "pendente@teste.pmidf.org.br": () =>
    HttpResponse.json({ codigo: "EMAIL_NAO_CONFIRMADO" }, { status: 403 }),
  "suspensa@teste.pmidf.org.br": () =>
    HttpResponse.json({ codigo: "CONTA_SUSPENSA" }, { status: 403 }),
};

export const handlersAuth = [
  http.post("*/api/auth/login", async ({ request }) => {
    const { email, senha } = (await request.json()) as { email: string; senha: string };
    if (senha !== SENHA_TESTE) {
      return HttpResponse.json({ codigo: "CREDENCIAIS_INVALIDAS" }, { status: 401 });
    }
    const resposta = respostasPorEmail[email];
    if (resposta) return resposta();
    return HttpResponse.json({ access_token: TOKEN_TESTE, expira_em_segundos: 900 });
  }),
];

export const PMI_ID_FILIADO = "1000001";
export const NOME_PMI_FILIADO = "Maria Souza Lima";

export const handlersCadastro = [
  http.post("*/api/auth/pre-cadastro", async ({ request }) => {
    const { pmi_id } = (await request.json()) as { email: string; pmi_id?: string };
    return HttpResponse.json(
      pmi_id === PMI_ID_FILIADO
        ? { filiado: true, dados: { nome_completo: NOME_PMI_FILIADO } }
        : { filiado: false },
    );
  }),
  http.post("*/api/auth/cadastro", () =>
    HttpResponse.json(
      { mensagem: "Enviamos um código de confirmação para o seu e-mail." },
      { status: 201 },
    ),
  ),
  http.get("https://viacep.com.br/ws/:cep/json/", ({ params }) =>
    params.cep === "70040010"
      ? HttpResponse.json({
          cep: "70040-010",
          logradouro: "SBS Quadra 2",
          bairro: "Asa Sul",
          localidade: "Brasília",
          uf: "DF",
        })
      : HttpResponse.json({ erro: "true" }),
  ),
];

export const CODIGO_TESTE = "123456";

export const handlersConfirmacao = [
  http.post("*/api/auth/confirmar-email", async ({ request }) => {
    const { codigo } = (await request.json()) as { email: string; codigo: string };
    if (codigo !== CODIGO_TESTE) {
      return HttpResponse.json({ codigo: "CODIGO_INVALIDO" }, { status: 422 });
    }
    return HttpResponse.json({
      access_token: TOKEN_TESTE,
      expira_em_segundos: 900,
      filiacao: { situacao: "SEM_VINCULO", resultado: null },
    });
  }),
  http.post("*/api/auth/confirmar-email/reenviar", () => new HttpResponse(null, { status: 202 })),
];

export const TOKEN_SENHA_VALIDO = "token-valido";

export const handlersSenha = [
  http.post("*/api/auth/senha/esqueci", () => new HttpResponse(null, { status: 202 })),
  http.get("*/api/auth/senha/redefinir/validar", ({ request }) =>
    HttpResponse.json({
      valido: new URL(request.url).searchParams.get("token") === TOKEN_SENHA_VALIDO,
    }),
  ),
  http.post("*/api/auth/senha/redefinir", async ({ request }) => {
    const { token } = (await request.json()) as { token: string; nova_senha: string };
    return token === TOKEN_SENHA_VALIDO
      ? new HttpResponse(null, { status: 204 })
      : HttpResponse.json({ codigo: "TOKEN_INVALIDO" }, { status: 422 });
  }),
];
