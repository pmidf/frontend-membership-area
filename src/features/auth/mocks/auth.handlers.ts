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
