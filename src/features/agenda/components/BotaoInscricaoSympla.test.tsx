import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { perfilFiliado } from "@/test/fixtures/pessoas";
import { renderizar } from "@/test/renderizar";

import { BotaoInscricaoSympla } from "./BotaoInscricaoSympla";
import { CardPresencaReconhecida } from "./CardPresencaReconhecida";

const URL_SYMPLA = "https://www.sympla.com.br/evento/teste/1";

describe("BotaoInscricaoSympla", () => {
  it("mostra o e-mail cadastrado da pessoa autenticada antes de ir ao Sympla", async () => {
    const usuario = userEvent.setup({ delay: null });
    renderizar(<BotaoInscricaoSympla urlSympla={URL_SYMPLA} />, { sessao: perfilFiliado });

    await usuario.click(await screen.findByRole("button", { name: "Inscrever-se no Sympla" }));

    const dialogo = screen.getByRole("dialog");
    expect(within(dialogo).getByText("maria.souza@teste.pmidf.org.br")).toBeInTheDocument();
    expect(within(dialogo).getByRole("link", { name: "Continuar para o Sympla" })).toHaveAttribute(
      "href",
      URL_SYMPLA,
    );

    await usuario.click(within(dialogo).getByRole("button", { name: "Cancelar" }));
    expect(dialogo).not.toHaveAttribute("open");
  });

  it("leva o visitante direto ao Sympla", async () => {
    renderizar(<BotaoInscricaoSympla urlSympla={URL_SYMPLA} />);

    expect(await screen.findByRole("link", { name: "Inscrever-se no Sympla" })).toHaveAttribute(
      "href",
      URL_SYMPLA,
    );
  });

  it("vai direto ao Sympla quando o perfil não tem e-mail", async () => {
    renderizar(<BotaoInscricaoSympla urlSympla={URL_SYMPLA} />, {
      sessao: { ...perfilFiliado, email: null },
    });

    expect(await screen.findByRole("link", { name: "Inscrever-se no Sympla" })).toBeInTheDocument();
  });
});

describe("CardPresencaReconhecida", () => {
  it("lista o e-mail cadastrado da pessoa autenticada", async () => {
    renderizar(<CardPresencaReconhecida />, { sessao: perfilFiliado });

    expect(await screen.findByText("maria.souza@teste.pmidf.org.br")).toBeInTheDocument();
  });

  it("não aparece para visitante", async () => {
    renderizar(
      <>
        <BotaoInscricaoSympla urlSympla={URL_SYMPLA} />
        <CardPresencaReconhecida />
      </>,
    );

    await screen.findByRole("link", { name: "Inscrever-se no Sympla" });
    expect(screen.queryByText("Como sua presença é reconhecida")).not.toBeInTheDocument();
  });
});
