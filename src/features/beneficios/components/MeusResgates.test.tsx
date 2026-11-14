import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw/http";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import type { Perfil } from "@/shared/sessao/tipos";
import { perfilFiliado, perfilNaoFiliado } from "@/test/fixtures/pessoas";
import { definirNavegacao } from "@/test/navegacao-falsa";
import { renderizar } from "@/test/renderizar";
import { servidor } from "@/test/servidor";

import type { HistoricoResgates } from "../api/resgates.api";
import {
  detalheTeste,
  handlersResgate,
  handlersResgates,
  historicoTeste,
} from "../mocks/beneficios.handlers";
import { MeusResgates } from "./MeusResgates";
import { PaginaDetalheBeneficio } from "./PaginaDetalheBeneficio";

let usuario: ReturnType<typeof userEvent.setup>;
let consultas: number;

beforeEach(() => {
  usuario = userEvent.setup({ delay: null });
  consultas = 0;
  servidor.events.on("request:start", ({ request }) => {
    if (new URL(request.url).pathname === "/api/me/resgates") consultas += 1;
  });
});

afterEach(() => servidor.events.removeAllListeners());

function abrir(sessao: Perfil | null, historico?: HistoricoResgates) {
  const resultado = renderizar(<MeusResgates />, { sessao });
  servidor.use(...handlersResgates(historico));
  return resultado;
}

const lista = () => screen.findByRole("list", { name: "Meus resgates" });
const semHistorico = { codigos_ocultos: false, itens: [] };

describe("Meus resgates", () => {
  it("lista os resgates na ordem recebida, com parceiro, data e código", async () => {
    abrir(perfilFiliado, historicoTeste);

    const itens = within(await lista()).getAllByRole("listitem");
    expect(itens).toHaveLength(3);
    expect(itens[0]).toHaveTextContent("Trilha de Business Agility");
    expect(itens[0]).toHaveTextContent("BRA LAB · resgatado em 12/06/2026");
    expect(itens[0]).toHaveTextContent("BRALAB-PMIDF-4471");
    expect(itens[2]).toHaveTextContent("Voucher CAPM");
  });

  it("abre as instruções guardadas no histórico", async () => {
    abrir(perfilFiliado, historicoTeste);
    await lista();

    await usuario.click(
      screen.getByRole("button", { name: "Ver instruções de Consultoria de carreira" }),
    );

    const modal = within(screen.getByRole("dialog", { name: "Siga as instruções" }));
    expect(modal.getByText("site").tagName).toBe("STRONG");
    expect(modal.queryByText("Resgate registrado")).toBeNull();
  });

  it("marca o benefício encerrado e mantém o código visível", async () => {
    abrir(perfilFiliado, historicoTeste);

    const item = within(await lista())
      .getAllByRole("listitem")
      .at(-1)!;
    expect(within(item).getByText("Encerrado")).toBeInTheDocument();
    expect(within(item).getByText("PMIG-CAPM-88213")).toBeInTheDocument();
  });

  it("esconde os códigos de quem perdeu a filiação, mantendo o histórico", async () => {
    abrir(perfilNaoFiliado, {
      codigos_ocultos: true,
      itens: historicoTeste.itens.map((item) => ({ ...item, conteudo_entregue: undefined })),
    });

    expect(within(await lista()).getAllByRole("listitem")).toHaveLength(3);
    expect(screen.queryByText("BRALAB-PMIDF-4471")).toBeNull();
    expect(screen.queryByRole("button", { name: /Ver instruções/ })).toBeNull();
    expect(
      screen.getByText("Os códigos ficam disponíveis enquanto sua filiação estiver ativa."),
    ).toBeInTheDocument();
  });

  it("avisa o Filiado que ainda não resgatou", async () => {
    abrir(perfilFiliado, semHistorico);

    expect(
      await screen.findByText("Você ainda não resgatou nenhum benefício."),
    ).toBeInTheDocument();
  });

  it("não aparece para quem não é Filiado e nunca resgatou", async () => {
    abrir(perfilNaoFiliado, semHistorico);

    await waitFor(() => expect(consultas).toBe(1));
    await waitFor(() =>
      expect(screen.queryByRole("heading", { name: "Meus resgates" })).toBeNull(),
    );
  });

  it("não consulta sem sessão", async () => {
    abrir(null);

    await new Promise((resolver) => setTimeout(resolver, 50));
    expect(consultas).toBe(0);
    expect(screen.queryByRole("heading", { name: "Meus resgates" })).toBeNull();
  });

  it("mostra o erro ao Filiado e tenta de novo", async () => {
    let falhar = true;
    renderizar(<MeusResgates />, { sessao: perfilFiliado });
    servidor.use(
      http.get("*/api/me/resgates", () =>
        falhar ? HttpResponse.json({}, { status: 500 }) : HttpResponse.json(historicoTeste),
      ),
    );

    expect(
      await screen.findByText("Não foi possível carregar seus resgates.", {}, { timeout: 4000 }),
    ).toBeInTheDocument();
    falhar = false;
    await usuario.click(screen.getByRole("button", { name: "Tentar novamente" }));

    expect(await lista()).toBeInTheDocument();
  });

  it("omite o erro para quem não é Filiado", async () => {
    renderizar(<MeusResgates />, { sessao: perfilNaoFiliado });
    servidor.use(http.get("*/api/me/resgates", () => HttpResponse.json({}, { status: 500 })));

    await waitFor(() => expect(consultas).toBeGreaterThan(0));
    await new Promise((resolver) => setTimeout(resolver, 50));
    expect(screen.queryByRole("heading", { name: "Meus resgates" })).toBeNull();
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("coloca o novo resgate no topo, sem recarregar a página", async () => {
    let historico = semHistorico as HistoricoResgates;
    const id = detalheTeste.id_beneficio;
    definirNavegacao(`/beneficios/${id}`, "", { id });
    renderizar(
      <>
        <PaginaDetalheBeneficio />
        <MeusResgates />
      </>,
      { sessao: perfilFiliado },
    );
    servidor.use(
      ...handlersResgate(),
      http.get("*/api/me/resgates", () => HttpResponse.json(historico)),
    );
    await screen.findByText("Você ainda não resgatou nenhum benefício.");
    historico = {
      codigos_ocultos: false,
      itens: [
        {
          id_beneficio: id,
          titulo: detalheTeste.titulo,
          parceiro: detalheTeste.parceiro,
          tipo_resgate: "CUPOM",
          data_resgate: "2026-08-31T17:22:00.000Z",
          beneficio_encerrado: false,
          conteudo_entregue: "PMIDF-BRISK-30OFF",
        },
      ],
    };

    await usuario.click(await screen.findByRole("button", { name: "Resgatar vantagem" }));
    await usuario.click(
      within(await screen.findByRole("dialog")).getByRole("button", { name: "Fechar" }),
    );

    expect(within(await lista()).getByText("PMIDF-BRISK-30OFF")).toBeInTheDocument();
  });
});
