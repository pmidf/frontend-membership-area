import { act, renderHook } from "@testing-library/react";
import { http, HttpResponse } from "msw/http";
import { useForm } from "react-hook-form";
import { afterEach, describe, expect, it, vi } from "vitest";

import { servidor } from "@/test/servidor";

import { aplicarErrosDeCampo } from "./aplicar-erros-de-campo";
import { baixarArquivo } from "./baixar-arquivo";
import { ErroApi, erroSemConexao } from "./erro-api";
import { MENSAGEM_GENERICA, mensagemDeErro } from "./mensagens-erro";

describe("mensagemDeErro", () => {
  it("usa a mensagem do código e a genérica para o desconhecido", () => {
    expect(mensagemDeErro(new ErroApi({ status: 401, codigo: "CREDENCIAIS_INVALIDAS" }))).toBe(
      "E-mail ou senha inválidos.",
    );
    expect(mensagemDeErro(erroSemConexao())).toMatch(/conectar ao servidor/);
    expect(mensagemDeErro(new ErroApi({ status: 500, codigo: "HTTP_500" }))).toBe(
      MENSAGEM_GENERICA,
    );
    expect(mensagemDeErro(new Error("qualquer"))).toBe(MENSAGEM_GENERICA);
  });
});

describe("aplicarErrosDeCampo", () => {
  it("leva a primeira mensagem de cada campo ao formulário", () => {
    const { result } = renderHook(() => {
      const formulario = useForm<{ telefone: string; cep: string }>({
        defaultValues: { telefone: "", cep: "" },
      });
      return { ...formulario, erros: formulario.formState.errors };
    });
    const erro = new ErroApi({
      status: 422,
      codigo: "DADOS_INVALIDOS",
      campos: { telefone: ["telefone deve ter DDD", "outra"], cep: ["cep deve ter 8 dígitos"] },
    });

    let campos: string[] = [];
    act(() => {
      campos = aplicarErrosDeCampo(erro, result.current.setError);
    });

    expect(campos).toEqual(["telefone", "cep"]);
    expect(result.current.erros.telefone?.message).toBe("telefone deve ter DDD");
    expect(result.current.erros.cep?.message).toBe("cep deve ter 8 dígitos");
  });

  it("ignora erros sem campos", () => {
    const definirErro = vi.fn();
    expect(aplicarErrosDeCampo(new Error("x"), definirErro)).toEqual([]);
    expect(definirErro).not.toHaveBeenCalled();
  });
});

describe("baixarArquivo", () => {
  afterEach(() => vi.restoreAllMocks());

  it("baixa o arquivo autenticado com o nome do Content-Disposition", async () => {
    servidor.use(
      http.get("*/api/admin/beneficios/export.csv", () =>
        HttpResponse.text("titulo\nVoucher", {
          headers: {
            "Content-Type": "text/csv",
            "Content-Disposition": 'attachment; filename="beneficios-2026-11-01.csv"',
          },
        }),
      ),
    );
    URL.createObjectURL = vi.fn(() => "blob:teste");
    URL.revokeObjectURL = vi.fn();
    const clique = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => undefined);

    await expect(baixarArquivo("/admin/beneficios/export.csv", "beneficios.csv")).resolves.toBe(
      "beneficios-2026-11-01.csv",
    );
    expect(clique).toHaveBeenCalledOnce();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:teste");
  });

  it("usa o nome padrão sem Content-Disposition", async () => {
    servidor.use(http.get("*/api/relatorio.csv", () => HttpResponse.text("a,b")));
    URL.createObjectURL = vi.fn(() => "blob:teste");
    URL.revokeObjectURL = vi.fn();
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => undefined);

    await expect(baixarArquivo("/relatorio.csv", "relatorio.csv")).resolves.toBe("relatorio.csv");
  });
});
