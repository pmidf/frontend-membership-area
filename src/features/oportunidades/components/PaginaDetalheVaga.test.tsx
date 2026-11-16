import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw/http";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { perfilFiliado } from "@/test/fixtures/pessoas";
import { definirNavegacao, roteadorFalso } from "@/test/navegacao-falsa";
import { renderizar } from "@/test/renderizar";
import { servidor } from "@/test/servidor";

import {
  EMAIL_RECRUTADOR,
  handlersOportunidades,
  URL_CANDIDATURA,
  vagaEncerrada,
  vagaPorEmail,
  vagaPorLink,
} from "../mocks/oportunidades.handlers";
import { PaginaDetalheVaga } from "./PaginaDetalheVaga";

const ESPERA = 4000;

let usuario: ReturnType<typeof userEvent.setup>;
let candidaturas: string[];

beforeEach(() => {
  usuario = userEvent.setup({ delay: null });
  candidaturas = [];
  servidor.events.on("request:start", ({ request }) => {
    const { pathname } = new URL(request.url);
    if (pathname.endsWith("/candidatura")) candidaturas.push(pathname);
  });
});

afterEach(() => servidor.events.removeAllListeners());

function abrir(id: string, consulta = "") {
  definirNavegacao(`/vagas/${id}`, consulta, { id });
  renderizar(<PaginaDetalheVaga />, { sessao: perfilFiliado });
  servidor.use(...handlersOportunidades());
}

const titulo = (nome: string) =>
  screen.findByRole("heading", { level: 1, name: nome }, { timeout: ESPERA });
const cartaoCandidatura = () =>
  within(screen.getByRole("heading", { name: "Como se candidatar" }).parentElement as HTMLElement);

describe("Detalhe da vaga", { timeout: 15_000 }, () => {
  it("mostra cabeçalho, descrição sanitizada e detalhes, sem revelar a candidatura", async () => {
    abrir(vagaPorEmail.id_oportunidade);
    await titulo(vagaPorEmail.titulo);

    expect(screen.getByText("Publicada há 2 dias")).toBeInTheDocument();
    expect(screen.getByText("Apoiar o PMO no acompanhamento de cronogramas.")).toBeVisible();
    expect(screen.getByRole("listitem")).toHaveTextContent("Atualizar cronogramas");
    expect(document.querySelector("script")).toBeNull();
    expect(screen.getByText("Expira em")).toBeInTheDocument();
    expect(cartaoCandidatura().getByText(/exibido só para filiados/)).toBeInTheDocument();
    expect(screen.queryByText(EMAIL_RECRUTADOR)).toBeNull();
    expect(candidaturas).toHaveLength(0);
  });

  it("revela o link de candidatura, que abre em nova aba", async () => {
    abrir(vagaPorLink.id_oportunidade);
    await titulo(vagaPorLink.titulo);

    await usuario.click(screen.getByRole("button", { name: "Ver como me candidatar" }));

    const link = await screen.findByRole("link", { name: /Candidatar-se no site da empresa/ });
    expect(link).toHaveAttribute("href", URL_CANDIDATURA);
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
    expect(link).toHaveTextContent("(abre em nova aba)");
    expect(candidaturas).toEqual([`/api/oportunidades/${vagaPorLink.id_oportunidade}/candidatura`]);
  });

  it("revela o e-mail com mailto e assunto, e copia o endereço", async () => {
    abrir(vagaPorEmail.id_oportunidade);
    await titulo(vagaPorEmail.titulo);

    await usuario.click(screen.getByRole("button", { name: "Ver como me candidatar" }));

    expect(await screen.findByText(EMAIL_RECRUTADOR)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Abrir e-mail para candidatura" })).toHaveAttribute(
      "href",
      `mailto:${EMAIL_RECRUTADOR}?subject=${encodeURIComponent(
        `Candidatura — ${vagaPorEmail.titulo} — via PMI-DF`,
      )}`,
    );

    await usuario.click(screen.getByRole("button", { name: "Copiar endereço" }));

    expect(await screen.findByRole("button", { name: "Endereço copiado" })).toBeInTheDocument();
    expect(await navigator.clipboard.readText()).toBe(EMAIL_RECRUTADOR);
  });

  it("mostra que a vaga foi encerrada quando a candidatura responde 410", async () => {
    abrir(vagaPorLink.id_oportunidade);
    await titulo(vagaPorLink.titulo);
    servidor.use(
      http.post("*/api/oportunidades/:id/candidatura", () =>
        HttpResponse.json({ codigo: "OPORTUNIDADE_ENCERRADA" }, { status: 410 }),
      ),
    );

    await usuario.click(screen.getByRole("button", { name: "Ver como me candidatar" }));

    expect(await screen.findByText("Esta vaga foi encerrada")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Ver como me candidatar" })).toBeNull();
  });

  it("avisa quando há consultas demais e permite tentar de novo", async () => {
    abrir(vagaPorLink.id_oportunidade);
    await titulo(vagaPorLink.titulo);
    servidor.use(
      http.post("*/api/oportunidades/:id/candidatura", () =>
        HttpResponse.json({ statusCode: 429 }, { status: 429 }),
      ),
    );

    await usuario.click(screen.getByRole("button", { name: "Ver como me candidatar" }));

    expect(
      await screen.findByText("Muitas consultas em pouco tempo. Tente de novo em um minuto."),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Ver como me candidatar" })).toBeEnabled();
  });

  it("volta para a lista quando a candidatura responde 403", async () => {
    abrir(vagaPorLink.id_oportunidade);
    await titulo(vagaPorLink.titulo);
    servidor.use(
      http.post("*/api/oportunidades/:id/candidatura", () =>
        HttpResponse.json({ codigo: "FILIACAO_NECESSARIA" }, { status: 403 }),
      ),
    );

    await usuario.click(screen.getByRole("button", { name: "Ver como me candidatar" }));

    await waitFor(() => expect(roteadorFalso.replace).toHaveBeenCalledWith("/vagas"));
  });

  it("mostra a vaga encerrada quando o detalhe responde 410", async () => {
    abrir(vagaEncerrada.id_oportunidade);

    expect(
      await screen.findByText("Esta vaga foi encerrada", {}, { timeout: ESPERA }),
    ).toBeVisible();
    expect(screen.getByRole("link", { name: "Ver as vagas abertas" })).toHaveAttribute(
      "href",
      "/vagas",
    );
  });

  it("mostra vaga não encontrada no 404", async () => {
    abrir("90000000-0000-4000-8000-000000009999");

    expect(await screen.findByText("Vaga não encontrada", {}, { timeout: ESPERA })).toBeVisible();
  });

  it("volta para a lista quando o detalhe responde 403", async () => {
    definirNavegacao(`/vagas/${vagaPorLink.id_oportunidade}`, "", {
      id: vagaPorLink.id_oportunidade,
    });
    renderizar(<PaginaDetalheVaga />, { sessao: perfilFiliado });
    servidor.use(
      http.get("*/api/oportunidades/:id", () =>
        HttpResponse.json({ codigo: "FILIACAO_NECESSARIA" }, { status: 403 }),
      ),
    );

    await waitFor(() => expect(roteadorFalso.replace).toHaveBeenCalledWith("/vagas"), {
      timeout: ESPERA,
    });
    expect(screen.queryByRole("heading", { level: 1 })).toBeNull();
  });

  it("mostra erro com tentar de novo", async () => {
    definirNavegacao(`/vagas/${vagaPorLink.id_oportunidade}`, "", {
      id: vagaPorLink.id_oportunidade,
    });
    renderizar(<PaginaDetalheVaga />, { sessao: perfilFiliado });
    servidor.use(http.get("*/api/oportunidades/:id", () => HttpResponse.json({}, { status: 500 })));

    expect(
      await screen.findByText("Não foi possível carregar a vaga.", {}, { timeout: ESPERA }),
    ).toBeVisible();
  });

  it("o link de voltar preserva os filtros da lista", async () => {
    abrir(vagaPorLink.id_oportunidade, "modalidade=REMOTO");
    await titulo(vagaPorLink.titulo);

    expect(screen.getByRole("link", { name: "Voltar para as vagas" })).toHaveAttribute(
      "href",
      "/vagas?modalidade=REMOTO",
    );
  });
});
