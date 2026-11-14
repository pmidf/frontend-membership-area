import { describe, expect, it } from "vitest";

import type { ResultadoVinculacao } from "../api/auth.api";
import { apresentacoesResultado, saudacao } from "./mensagens-resultado-filiacao";

describe("apresentacoesResultado", () => {
  it.each<[ResultadoVinculacao, string, boolean]>([
    ["APROVADO", "Filiação confirmada", true],
    ["NAO_LOCALIZADO", "Conta criada", false],
    ["PMI_INDISPONIVEL", "Conta criada", false],
    ["OUTRO_CAPITULO", "Conta criada", false],
    ["FILIACAO_INATIVA", "Conta criada", false],
    ["DADOS_NAO_CONFEREM", "Conta criada", false],
  ])("apresenta %s como %s", (resultado, titulo, filiado) => {
    expect(apresentacoesResultado[resultado]).toMatchObject({ titulo, filiado });
  });

  it("nunca afirma que a pessoa não é filiada quando ela não foi localizada", () => {
    const { alerta, detalhe } = apresentacoesResultado.NAO_LOCALIZADO;
    expect(`${alerta} ${detalhe}`).not.toMatch(/não é filiad/i);
  });

  it("usa o tom de erro só quando os dados não conferem", () => {
    const tons = Object.entries(apresentacoesResultado).filter(([, { tom }]) => tom === "erro");
    expect(tons.map(([resultado]) => resultado)).toEqual(["DADOS_NAO_CONFEREM"]);
  });
});

describe("saudacao", () => {
  it("cumprimenta pelo primeiro nome conforme o gênero informado", () => {
    expect(saudacao("Maria Souza", "FEMININO")).toBe("Bem-vinda, Maria!");
    expect(saudacao("Rafael Lima", "MASCULINO")).toBe("Bem-vindo, Rafael!");
    expect(saudacao("Alex Prado", "NAO_BINARIO")).toBe("Boas-vindas, Alex!");
    expect(saudacao(undefined, undefined)).toBe("Boas-vindas!");
  });
});
