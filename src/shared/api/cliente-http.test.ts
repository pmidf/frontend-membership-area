import { http, HttpResponse } from "msw/http";
import { describe, expect, it, vi } from "vitest";

import { servidor } from "@/test/servidor";

import { api, montarUrl, requisicao, requisicaoComStatus } from "./cliente-http";
import { ErroApi } from "./erro-api";
import { configurarOuvintesSessao, iniciarSessao, obterToken } from "./token-sessao";

describe("montarUrl", () => {
  it("monta a consulta ignorando vazios e repetindo listas", () => {
    const url = new URL(
      montarUrl("/admin/agenda/eventos/numeros.csv", {
        q: "summit",
        page: 2,
        vazio: "",
        ausente: undefined,
        nulo: null,
        ids: ["a", "b"],
      }),
    );

    expect(url.pathname).toBe("/api/admin/agenda/eventos/numeros.csv");
    expect(url.searchParams.toString()).toBe("q=summit&page=2&ids=a&ids=b");
  });
});

describe("requisicao", () => {
  it("envia o token e o corpo em JSON, e lê a resposta JSON", async () => {
    iniciarSessao({ access_token: "abc", expira_em_segundos: 900 });
    servidor.use(
      http.post("*/api/eco", async ({ request }) =>
        HttpResponse.json({
          autorizacao: request.headers.get("Authorization"),
          tipo: request.headers.get("Content-Type"),
          corpo: await request.json(),
        }),
      ),
    );

    await expect(api.enviar("/eco", { nome: "Maria" })).resolves.toEqual({
      autorizacao: "Bearer abc",
      tipo: "application/json",
      corpo: { nome: "Maria" },
    });
  });

  it("aceita corpo no DELETE, devolve undefined no 204 e informa o status", async () => {
    servidor.use(
      http.delete("*/api/me", async ({ request }) => {
        expect(await request.json()).toEqual({ senha: "segredo" });
        return new HttpResponse(null, { status: 204 });
      }),
      http.post("*/api/beneficios/:id/resgate", () =>
        HttpResponse.json({ conteudo_entregue: "PMIDF20" }, { status: 201 }),
      ),
    );

    await expect(api.remover("/me", { senha: "segredo" })).resolves.toBeUndefined();
    await expect(requisicaoComStatus("/beneficios/1/resgate", { metodo: "POST" })).resolves.toEqual(
      { status: 201, dados: { conteudo_entregue: "PMIDF20" } },
    );
  });

  it("lê texto quando a resposta não é JSON e não define Content-Type para FormData", async () => {
    servidor.use(
      http.get("*/api", () => HttpResponse.text("Hello World!")),
      http.put("*/api/me/foto", ({ request }) =>
        HttpResponse.json({ tipo: request.headers.get("Content-Type") }),
      ),
    );

    await expect(api.obter("")).resolves.toBe("Hello World!");
    const resposta = await api.substituir<{ tipo: string }>("/me/foto", new FormData());
    expect(resposta.tipo).toMatch(/multipart\/form-data/);
  });

  it("converte erros de validação, de regra e de limite em ErroApi", async () => {
    servidor.use(
      http.post("*/api/auth/cadastro", () =>
        HttpResponse.json(
          { codigo: "DADOS_INVALIDOS", campos: { telefone: ["telefone inválido"] } },
          { status: 422 },
        ),
      ),
      http.post("*/api/auth/confirmar-email/reenviar", () =>
        HttpResponse.json(
          { codigo: "AGUARDE_PARA_REENVIAR", segundos_restantes: 42 },
          { status: 429 },
        ),
      ),
      http.post("*/api/beneficios/1/resgate", () => new HttpResponse(null, { status: 429 })),
    );

    const validacao = await api.enviar("/auth/cadastro", {}).catch((erro: unknown) => erro);
    expect(validacao).toBeInstanceOf(ErroApi);
    expect(validacao).toMatchObject({
      status: 422,
      codigo: "DADOS_INVALIDOS",
      campos: { telefone: ["telefone inválido"] },
    });

    await expect(api.enviar("/auth/confirmar-email/reenviar", {})).rejects.toMatchObject({
      codigo: "AGUARDE_PARA_REENVIAR",
      dados: { segundos_restantes: 42 },
    });
    await expect(api.enviar("/beneficios/1/resgate")).rejects.toMatchObject({
      codigo: "MUITAS_REQUISICOES",
    });
  });

  it("transforma falha de rede em SEM_CONEXAO", async () => {
    servidor.use(http.get("*/api/me", () => HttpResponse.error()));

    await expect(api.obter("/me")).rejects.toMatchObject({ status: 0, codigo: "SEM_CONEXAO" });
  });

  it("faz um único refresh para 401 simultâneos e repete cada requisição uma vez", async () => {
    iniciarSessao({ access_token: "vencido", expira_em_segundos: 900 });
    const renovacoes = vi.fn();
    const chamadas = vi.fn();
    servidor.use(
      http.post("*/api/auth/refresh", () => {
        renovacoes();
        return HttpResponse.json({ access_token: "novo", expira_em_segundos: 900 });
      }),
      http.get("*/api/recurso/:id", ({ request, params }) => {
        chamadas(params.id);
        return request.headers.get("Authorization") === "Bearer novo"
          ? HttpResponse.json({ id: params.id })
          : new HttpResponse(null, { status: 401 });
      }),
    );

    const resultados = await Promise.all(["1", "2", "3"].map((id) => api.obter(`/recurso/${id}`)));

    expect(resultados).toEqual([{ id: "1" }, { id: "2" }, { id: "3" }]);
    expect(renovacoes).toHaveBeenCalledOnce();
    expect(chamadas).toHaveBeenCalledTimes(6);
    expect(obterToken()).toBe("novo");
  });

  it("não renova de novo quando o 401 chega depois de a sessão já ter sido renovada", async () => {
    iniciarSessao({ access_token: "vencido", expira_em_segundos: 900 });
    const renovacoes = vi.fn();
    servidor.use(
      http.post("*/api/auth/refresh", () => {
        renovacoes();
        return HttpResponse.json({ access_token: "novo", expira_em_segundos: 900 });
      }),
      http.get("*/api/recurso/:id", async ({ request, params }) => {
        if (request.headers.get("Authorization") === "Bearer novo") {
          return HttpResponse.json({ id: params.id });
        }
        await new Promise((resolver) => setTimeout(resolver, Number(params.id) * 30));
        return new HttpResponse(null, { status: 401 });
      }),
    );

    const resultados = await Promise.all(["1", "2", "3"].map((id) => api.obter(`/recurso/${id}`)));

    expect(resultados).toEqual([{ id: "1" }, { id: "2" }, { id: "3" }]);
    expect(renovacoes).toHaveBeenCalledOnce();
  });

  it("encerra a sessão local e avisa quando o refresh falha", async () => {
    iniciarSessao({ access_token: "vencido", expira_em_segundos: 900 });
    const aoExpirar = vi.fn();
    configurarOuvintesSessao({ aoExpirar });
    servidor.use(http.get("*/api/me", () => new HttpResponse(null, { status: 401 })));

    await expect(api.obter("/me")).rejects.toMatchObject({ status: 401 });
    expect(aoExpirar).toHaveBeenCalledOnce();
    expect(obterToken()).toBeNull();
  });

  it("não tenta refresh nas rotas de autenticação", async () => {
    const renovacoes = vi.fn();
    servidor.use(
      http.post("*/api/auth/refresh", () => {
        renovacoes();
        return new HttpResponse(null, { status: 401 });
      }),
      http.post("*/api/auth/login", () =>
        HttpResponse.json({ codigo: "CREDENCIAIS_INVALIDAS" }, { status: 401 }),
      ),
    );

    await expect(requisicao("/auth/login", { metodo: "POST", corpo: {} })).rejects.toMatchObject({
      codigo: "CREDENCIAIS_INVALIDAS",
    });
    expect(renovacoes).not.toHaveBeenCalled();
  });
});
