import { describe, expect, it } from "vitest";

import type { FiliacaoPerfil } from "@/shared/sessao/tipos";

import { apresentarFiliacao } from "./apresentacao-filiacao";

const agora = new Date("2026-11-08T15:00:00.000Z");

const aprovada: FiliacaoPerfil = {
  situacao: "APROVADO",
  pmi_id: "1000001",
  nome_pmi: "Maria Souza",
  capitulo: "C219",
  data_expiracao: "2027-03-31T00:00:00.000Z",
  motivo_pendencia: null,
  data_ultima_verificacao: "2026-11-08T11:14:00.000Z",
};

describe("apresentarFiliacao", () => {
  it("mostra PMI ID, validade civil e verificação de hoje para o Filiado", () => {
    expect(apresentarFiliacao(aprovada, true, agora)).toEqual({
      rotuloSelo: "Filiado PMI-DF",
      tom: "aqua",
      mensagem: null,
      pmiId: "1000001",
      dados: [
        { rotulo: "Filiação válida até", valor: "31/03/2027" },
        { rotulo: "Última verificação", valor: "Hoje às 08:14" },
      ],
      mostrarRenovacao: false,
    });
  });

  it("mostra data e hora quando a verificação não foi hoje e traço sem validade", () => {
    const { dados } = apresentarFiliacao(
      {
        ...aprovada,
        data_expiracao: null,
        data_ultima_verificacao: "2026-11-02T02:30:00.000Z",
      },
      true,
      agora,
    );

    expect(dados).toEqual([
      { rotulo: "Filiação válida até", valor: "—" },
      { rotulo: "Última verificação", valor: "01/11/2026 às 23:30" },
    ]);
  });

  it("não afirma que a pessoa não é filiada quando ela não foi localizada", () => {
    const resultado = apresentarFiliacao(
      { ...aprovada, situacao: "PENDENTE", motivo_pendencia: "NAO_LOCALIZADO" },
      false,
      agora,
    );

    expect(resultado).toMatchObject({
      rotuloSelo: "Aguardando localização na base do PMI",
      tom: "alerta",
      pmiId: "1000001",
      dados: [{ rotulo: "Última verificação", valor: "Hoje às 08:14" }],
    });
    expect(resultado.mensagem).toMatch(/Ainda não localizamos/);
    expect(resultado.mensagem).not.toMatch(/não é filiad/i);
  });

  it("explica a indisponibilidade do PMI", () => {
    expect(
      apresentarFiliacao(
        { ...aprovada, situacao: "PENDENTE", motivo_pendencia: "PMI_INDISPONIVEL" },
        false,
        agora,
      ),
    ).toMatchObject({
      rotuloSelo: "Aguardando verificação",
      tom: "alerta",
      mensagem: expect.stringContaining("Não conseguimos consultar o PMI"),
      dados: [],
    });
  });

  it("não atribui falha ao PMI em pendência sem motivo", () => {
    const { mensagem } = apresentarFiliacao(
      { ...aprovada, situacao: "PENDENTE", motivo_pendencia: null },
      false,
      agora,
    );

    expect(mensagem).toBe("Sua filiação será verificada novamente no seu próximo acesso.");
  });

  it("descreve a confirmação pendente", () => {
    expect(
      apresentarFiliacao({ ...aprovada, situacao: "AGUARDANDO_CODIGO" }, false, agora),
    ).toMatchObject({
      rotuloSelo: "Aguardando confirmação",
      tom: "neutro",
      mensagem: "Sua filiação aguarda uma confirmação adicional.",
    });
  });

  it.each(["EXPIRADO", "APROVADO"] as const)("mostra %s sem acesso como vencida", (situacao) => {
    expect(apresentarFiliacao({ ...aprovada, situacao }, false, agora)).toMatchObject({
      rotuloSelo: "Filiação vencida em 31/03/2027",
      tom: "erro",
      mensagem: expect.stringContaining("Seu acesso exclusivo foi suspenso"),
      mostrarRenovacao: true,
    });
  });

  it("omite a data quando a vencida não tem expiração", () => {
    expect(
      apresentarFiliacao({ ...aprovada, situacao: "EXPIRADO", data_expiracao: null }, false, agora)
        .rotuloSelo,
    ).toBe("Filiação vencida");
  });

  it.each([
    ["sem filiação", null],
    ["SEM_VINCULO", { ...aprovada, situacao: "SEM_VINCULO" } as FiliacaoPerfil],
  ])("mostra %s como não vinculado", (_, filiacao) => {
    expect(apresentarFiliacao(filiacao, false, agora)).toMatchObject({
      rotuloSelo: "Não vinculado",
      tom: "neutro",
      mensagem: "Você ainda não tem uma filiação reconhecida pelo PMI-DF.",
      pmiId: null,
    });
  });
});
