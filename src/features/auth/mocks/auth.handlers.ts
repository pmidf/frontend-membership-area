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
