import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { CampoSelecao } from "./CampoSelecao";

const opcoes = [
  { valor: "FEMININO", rotulo: "Feminino" },
  { valor: "PREFIRO_NAO_INFORMAR", rotulo: "Prefiro não informar" },
];

describe("CampoSelecao", () => {
  it("lista a opção vazia e as opções informadas", async () => {
    render(<CampoSelecao rotulo="Gênero" opcoes={opcoes} textoVazio="Selecione" defaultValue="" />);

    const campo = screen.getByLabelText("Gênero");
    expect(screen.getAllByRole("option")).toHaveLength(3);

    await userEvent.selectOptions(campo, "PREFIRO_NAO_INFORMAR");
    expect(campo).toHaveValue("PREFIRO_NAO_INFORMAR");
  });

  it("anuncia o erro", () => {
    render(<CampoSelecao rotulo="UF" opcoes={opcoes} erro="Escolha a UF" />);

    expect(screen.getByLabelText("UF")).toHaveAccessibleDescription("Escolha a UF");
  });
});
