import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderizar } from "@/test/renderizar";
import { servidor } from "@/test/servidor";

import { apiComFalha, apiForaDoAr } from "../mocks/saude.handlers";
import { EstadoApi } from "./EstadoApi";

describe("EstadoApi", () => {
  it("mostra a verificação em andamento e depois a API disponível", async () => {
    renderizar(<EstadoApi />);

    expect(screen.getByRole("status")).toHaveTextContent("Verificando a API…");
    expect(await screen.findByText("API disponível")).toBeInTheDocument();
  });

  it("mostra a API indisponível quando o backend responde com erro", async () => {
    servidor.use(apiComFalha);
    renderizar(<EstadoApi />);

    expect(await screen.findByText("API indisponível")).toBeInTheDocument();
  });

  it("mostra a API indisponível quando o backend está fora do ar", async () => {
    servidor.use(apiForaDoAr);
    renderizar(<EstadoApi />);

    expect(await screen.findByText("API indisponível")).toBeInTheDocument();
  });
});
