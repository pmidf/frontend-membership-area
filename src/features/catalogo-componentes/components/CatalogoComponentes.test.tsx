import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { renderizar } from "@/test/renderizar";

import { CatalogoComponentes } from "./CatalogoComponentes";

describe("CatalogoComponentes", () => {
  it("apresenta cada grupo de componentes", () => {
    renderizar(<CatalogoComponentes />);

    for (const titulo of [
      "Botões",
      "Campos de texto",
      "Seleção",
      "Código, etapas e busca",
      "Formulário com validação",
      "Etiquetas, selos e avatares",
      "Alertas e avisos",
      "Modal e confirmação",
      "Abas, filtros e paginação",
      "Cartões, tabela e estados",
    ]) {
      expect(screen.getByRole("region", { name: titulo })).toBeInTheDocument();
    }
  });

  it("valida o formulário de demonstração", async () => {
    renderizar(<CatalogoComponentes />);

    await userEvent.click(screen.getByRole("button", { name: "Validar formulário" }));
    expect(await screen.findByText("Use pelo menos 10 caracteres")).toBeInTheDocument();

    await userEvent.type(screen.getByRole("textbox", { name: "E-mail" }), "maria@pmidf.org.br");
    await userEvent.type(screen.getAllByLabelText("Senha").at(-1)!, "senha-muito-forte");
    const primeiroDigito = screen.getAllByLabelText("Dígito 1 de 6").at(-1)!;
    await userEvent.click(primeiroDigito);
    await userEvent.keyboard("654321");
    await userEvent.click(screen.getByRole("button", { name: "Validar formulário" }));

    expect(await screen.findByText("Formulário válido.")).toBeInTheDocument();
  });

  it("dispara avisos, abre o modal e a confirmação com motivo", async () => {
    renderizar(<CatalogoComponentes />);

    await userEvent.click(screen.getByRole("button", { name: "Aviso de sucesso" }));
    expect(screen.getByRole("region", { name: "Avisos" })).toHaveTextContent("Vaga publicada");

    await userEvent.click(screen.getByRole("button", { name: "Abrir modal" }));
    expect(screen.getByRole("dialog", { name: "Seu código está pronto" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Copiar código" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Suspender conta" }));
    const confirmar = screen.getByRole("button", { name: "Suspender" });
    expect(confirmar).toBeDisabled();
    await userEvent.type(screen.getByLabelText("Motivo"), "Uso indevido da conta");
    await userEvent.click(confirmar);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
