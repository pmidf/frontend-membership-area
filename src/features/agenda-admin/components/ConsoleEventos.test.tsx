import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw/http";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ExigeAdmin } from "@/shared/sessao/ExigeAdmin";
import { perfilAdmin } from "@/test/fixtures/pessoas";
import { TOKEN_TESTE } from "@/test/handlers-sessao";
import { definirNavegacao, roteadorFalso } from "@/test/navegacao-falsa";
import { renderizar } from "@/test/renderizar";
import { servidor } from "@/test/servidor";

import { PESSOA_ANA, PESSOA_CARLA } from "../mocks/agenda-admin.handlers";
import { PaginaConciliacaoAdmin } from "./PaginaConciliacaoAdmin";
import { PaginaEventosAdmin } from "./PaginaEventosAdmin";
import { PaginaNumerosAdmin } from "./PaginaNumerosAdmin";
import { PaginaParticipantesAdmin } from "./PaginaParticipantesAdmin";

const revalidarAgendaPublica = vi.hoisted(() => vi.fn(async () => undefined));
vi.mock("../revalidar-agenda", () => ({ revalidarAgendaPublica }));

type Chamada = {
  metodo: string;
  caminho: string;
  busca: string;
  token: string | null;
  corpo: unknown;
};

let usuario: ReturnType<typeof userEvent.setup>;
let chamadas: Chamada[];

beforeEach(() => {
  usuario = userEvent.setup({ delay: null });
  chamadas = [];
  revalidarAgendaPublica.mockClear();
  URL.createObjectURL = vi.fn(() => "blob:teste");
  URL.revokeObjectURL = vi.fn();
  servidor.events.on("request:start", async ({ request }) => {
    const url = new URL(request.url);
    if (!url.pathname.includes("/admin/agenda")) return;
    const texto = request.method === "POST" ? await request.clone().text() : "";
    chamadas.push({
      metodo: request.method,
      caminho: url.pathname.replace(/^.*\/api/, ""),
      busca: url.search,
      token: request.headers.get("Authorization"),
      corpo: texto ? JSON.parse(texto) : undefined,
    });
  });
});

afterEach(() => {
  servidor.events.removeAllListeners();
  vi.restoreAllMocks();
});

function abrirComo(pagina: React.ReactElement) {
  return renderizar(<ExigeAdmin>{pagina}</ExigeAdmin>, { sessao: perfilAdmin });
}

const avisos = () => within(screen.getByRole("region", { name: "Avisos" }));
const chamadasPara = (metodo: string, caminho: string) =>
  chamadas.filter((c) => c.metodo === metodo && c.caminho === caminho);

describe("Console de eventos · Eventos", () => {
  it("lista os eventos do Sympla chamando o backend com o token da sessão", async () => {
    abrirComo(<PaginaEventosAdmin />);

    expect(await screen.findByText("Webinar de Agilidade")).toBeInTheDocument();
    expect(screen.getByText("Encontro presencial de PMOs")).toBeInTheDocument();
    expect(screen.getByText("40 · 30 presentes")).toBeInTheDocument();
    expect(screen.getByText("Eventos no Sympla (90 dias e próximos)")).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "Ver participantes" })[0]).toHaveAttribute(
      "href",
      "/admin/eventos/3001/participantes",
    );

    const [listagem] = chamadasPara("GET", "/admin/agenda/eventos");
    expect(listagem.busca).toBe("?periodo=recentes");
    expect(listagem.token).toBe(`Bearer ${TOKEN_TESTE}`);
  });

  it("filtra pela busca e pelo formato da URL e grava novos filtros na URL", async () => {
    definirNavegacao("/admin/eventos", "q=webinar&formato=online&periodo=12m");
    abrirComo(<PaginaEventosAdmin />);

    expect(await screen.findByText("Webinar de Agilidade")).toBeInTheDocument();
    expect(screen.queryByText("Encontro presencial de PMOs")).not.toBeInTheDocument();
    expect(chamadasPara("GET", "/admin/agenda/eventos")[0].busca).toBe("?periodo=12m");
    expect(screen.getByText("Eventos no Sympla (12 meses)")).toBeInTheDocument();

    const busca = screen.getByRole("searchbox", { name: "Buscar evento" });
    await usuario.clear(busca);
    await usuario.type(busca, "pmo");
    await usuario.click(screen.getByRole("button", { name: "Buscar" }));
    expect(roteadorFalso.replace).toHaveBeenLastCalledWith(
      "/admin/eventos?q=pmo&formato=online&periodo=12m",
      { scroll: false },
    );

    await usuario.selectOptions(screen.getByRole("combobox", { name: "Período" }), "recentes");
    expect(roteadorFalso.replace).toHaveBeenLastCalledWith(
      "/admin/eventos?q=webinar&formato=online",
      { scroll: false },
    );
  });

  it("mostra a mensagem de vazio quando nada atende aos filtros", async () => {
    definirNavegacao("/admin/eventos", "q=inexistente");
    abrirComo(<PaginaEventosAdmin />);

    expect(await screen.findByText("Nenhum evento encontrado.")).toBeInTheDocument();
  });

  it("“Atualizar agora” descarta o cache do backend e da agenda pública", async () => {
    abrirComo(<PaginaEventosAdmin />);
    await screen.findByText("Webinar de Agilidade");

    await usuario.click(screen.getByRole("button", { name: "Atualizar agora" }));

    await waitFor(() => expect(revalidarAgendaPublica).toHaveBeenCalledOnce());
    expect(chamadasPara("POST", "/admin/agenda/atualizar")).toHaveLength(1);
    await waitFor(() => expect(chamadasPara("GET", "/admin/agenda/eventos")).toHaveLength(2));
  });

  it("avisa quando não consegue atualizar", async () => {
    servidor.use(
      http.post("*/api/admin/agenda/atualizar", () => new HttpResponse(null, { status: 502 })),
    );
    abrirComo(<PaginaEventosAdmin />);
    await screen.findByText("Webinar de Agilidade");

    await usuario.click(screen.getByRole("button", { name: "Atualizar agora" }));

    expect(
      await avisos().findByText("Não foi possível atualizar agora. Tente novamente."),
    ).toBeInTheDocument();
    expect(revalidarAgendaPublica).not.toHaveBeenCalled();
  });

  it("mostra o erro e permite tentar de novo quando o backend recusa", async () => {
    servidor.use(
      http.get("*/api/admin/agenda/eventos", () => new HttpResponse(null, { status: 403 })),
    );
    abrirComo(<PaginaEventosAdmin />);

    expect(await screen.findByText("Não foi possível carregar o console")).toBeInTheDocument();

    servidor.resetHandlers();
    await usuario.click(screen.getByRole("button", { name: "Tentar novamente" }));
    expect(await screen.findByText("Webinar de Agilidade")).toBeInTheDocument();
  });
});

describe("Console de eventos · Números", () => {
  it("mostra os totais, filtra localmente e exporta com os mesmos filtros", async () => {
    abrirComo(<PaginaNumerosAdmin />);

    const tabela = await screen.findByRole("table");
    expect(within(tabela).getAllByRole("row")).toHaveLength(3);
    expect(screen.getByText("Últimos 90 dias e próximos · 2 eventos listados")).toBeInTheDocument();

    await usuario.selectOptions(screen.getByRole("combobox", { name: "Formato" }), "online");
    expect(within(tabela).getAllByRole("row")).toHaveLength(2);

    await usuario.click(screen.getByRole("checkbox", { name: "Selecionar Webinar de Agilidade" }));
    expect(screen.getByText("1 eventos selecionados")).toBeInTheDocument();

    await usuario.click(screen.getByRole("button", { name: "Exportar CSV" }));

    expect(await avisos().findByText("CSV exportado")).toBeInTheDocument();
    const [exportacao] = chamadasPara("GET", "/admin/agenda/eventos/numeros.csv");
    expect(Object.fromEntries(new URLSearchParams(exportacao.busca))).toEqual({
      periodo: "recentes",
      formato: "online",
      ids: "3001",
    });
    expect(exportacao.token).toBe(`Bearer ${TOKEN_TESTE}`);
  });

  it("ordena pelas colunas e troca o período pela URL", async () => {
    abrirComo(<PaginaNumerosAdmin />);
    const tabela = await screen.findByRole("table");
    const primeiraLinha = () => within(tabela).getAllByRole("row")[1];

    await usuario.click(screen.getByRole("button", { name: "Inscritos" }));
    expect(primeiraLinha()).toHaveTextContent("Webinar de Agilidade");
    await usuario.click(screen.getByRole("button", { name: /Inscritos/ }));
    expect(primeiraLinha()).toHaveTextContent("Encontro presencial de PMOs");

    await usuario.type(screen.getByRole("searchbox", { name: "Buscar evento" }), "zzz");
    expect(screen.getByText("Nenhum evento com os filtros selecionados.")).toBeInTheDocument();

    await usuario.click(screen.getByRole("button", { name: "Incluir últimos 12 meses" }));
    expect(roteadorFalso.replace).toHaveBeenLastCalledWith("/?periodo=12m", { scroll: false });
  });

  it("atualiza e avisa quando a exportação falha", async () => {
    servidor.use(
      http.get(
        "*/api/admin/agenda/eventos/numeros.csv",
        () => new HttpResponse(null, { status: 500 }),
      ),
    );
    definirNavegacao("/admin/eventos/numeros", "periodo=12m");
    abrirComo(<PaginaNumerosAdmin />);
    await screen.findByRole("table");
    expect(screen.getByText("Últimos 12 meses · 2 eventos listados")).toBeInTheDocument();

    await usuario.click(screen.getByRole("button", { name: "Atualizar agora" }));
    await waitFor(() => expect(revalidarAgendaPublica).toHaveBeenCalledOnce());

    await usuario.click(screen.getByRole("button", { name: "Exportar CSV" }));
    expect(
      await avisos().findByText("Não foi possível exportar. Tente novamente."),
    ).toBeInTheDocument();

    await usuario.click(screen.getByRole("button", { name: "Ver só os últimos 90 dias" }));
    expect(roteadorFalso.replace).toHaveBeenLastCalledWith("/admin/eventos/numeros", {
      scroll: false,
    });
  });

  it("avisa quando “Atualizar agora” falha", async () => {
    servidor.use(
      http.post("*/api/admin/agenda/atualizar", () => new HttpResponse(null, { status: 502 })),
    );
    abrirComo(<PaginaNumerosAdmin />);
    await screen.findByRole("table");

    await usuario.click(screen.getByRole("button", { name: "Atualizar agora" }));

    expect(
      await avisos().findByText("Não foi possível atualizar agora. Tente novamente."),
    ).toBeInTheDocument();
  });
});

describe("Console de eventos · Participantes", () => {
  it("lista os participantes do evento e exporta com os filtros", async () => {
    definirNavegacao("/admin/eventos/3001/participantes", "", { id: "3001" });
    abrirComo(<PaginaParticipantesAdmin />);

    expect(
      await screen.findByRole("heading", { name: "Webinar de Agilidade · Participantes" }),
    ).toBeInTheDocument();
    expect(screen.getByText("2 inscritos")).toBeInTheDocument();
    expect(
      screen.getByText("2 tipos de ingresso · 2 inscritos no total", {
        normalizer: (t) => t.replace(/\s+/g, " ").trim(),
      }),
    ).toBeInTheDocument();
    const tiposIngresso = within(screen.getByRole("region", { name: "Por tipo de ingresso" }))
      .getAllByRole("listitem")
      .map((item) => item.textContent);
    expect(tiposIngresso).toEqual(["Filiado1 inscrito", "Público geral1 inscrito"]);
    expect(screen.getByText("vínculo manual")).toBeInTheDocument();

    await usuario.selectOptions(screen.getByRole("combobox", { name: "Vínculo" }), "nao-vinculado");
    expect(screen.getByText("1 de 2 participantes")).toBeInTheDocument();

    await usuario.click(screen.getByRole("button", { name: "Exportar participantes (CSV)" }));

    expect(await avisos().findByText("CSV exportado")).toBeInTheDocument();
    const [exportacao] = chamadasPara("GET", "/admin/agenda/eventos/3001/participantes.csv");
    expect(exportacao.busca).toBe("?vinculo=nao-vinculado");
    expect(exportacao.token).toBe(`Bearer ${TOKEN_TESTE}`);
  });

  it("avisa quando a exportação falha", async () => {
    servidor.use(
      http.get(
        "*/api/admin/agenda/eventos/:id/participantes.csv",
        () => new HttpResponse(null, { status: 500 }),
      ),
    );
    definirNavegacao("/admin/eventos/3001/participantes", "", { id: "3001" });
    abrirComo(<PaginaParticipantesAdmin />);
    await screen.findByText("2 inscritos");

    await usuario.click(screen.getByRole("button", { name: "Exportar participantes (CSV)" }));

    expect(
      await avisos().findByText("Não foi possível exportar. Tente novamente."),
    ).toBeInTheDocument();
  });

  it("mostra “Evento não encontrado” quando o backend responde 404", async () => {
    definirNavegacao("/admin/eventos/999/participantes", "", { id: "999" });
    abrirComo(<PaginaParticipantesAdmin />);

    expect(await screen.findByText("Evento não encontrado")).toBeInTheDocument();
  });
});

describe("Console de eventos · Conciliação", () => {
  async function abrir(parametros = "") {
    definirNavegacao("/admin/eventos/conciliacao", parametros);
    abrirComo(<PaginaConciliacaoAdmin />);
    return screen.findByRole("heading", { name: "Participações não vinculadas" });
  }

  const cardAnalise = () => screen.getByRole("region", { name: "Em análise" });

  it("mostra a fila, a primeira participação em análise e as resolvidas", async () => {
    await abrir();

    expect(screen.getByText("2 na fila")).toBeInTheDocument();
    expect(within(cardAnalise()).getByText("bruno@teste.com")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Nenhuma pessoa com nome parecido. Busque manualmente abaixo, se souber quem é.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByText("Nenhuma sugestão")).toBeInTheDocument();
    expect(screen.getByText("Admin Teste", { exact: false })).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "Analisar" })[1]).toHaveAttribute(
      "href",
      "/admin/eventos/conciliacao?periodo=recentes&analisar=3001%3Ap3",
    );
  });

  it("vincula a participação à pessoa sugerida", async () => {
    await abrir("analisar=3001:p3");

    expect(screen.getByRole("radio", { name: /Ana Lima · Similaridade 0,82/ })).toBeChecked();
    await usuario.click(screen.getByRole("button", { name: "Vincular participação" }));

    expect(await avisos().findByText("Participação vinculada")).toBeInTheDocument();
    expect(chamadasPara("POST", "/admin/agenda/conciliacao/vinculos")[0].corpo).toEqual({
      eventoId: "3001",
      participanteId: "p3",
      pessoaId: PESSOA_ANA,
    });
    await waitFor(() => expect(chamadasPara("GET", "/admin/agenda/conciliacao")).toHaveLength(2));
  });

  it("vincula pela busca manual e pede a pessoa quando nenhuma foi escolhida", async () => {
    await abrir();

    await usuario.click(screen.getByRole("button", { name: "Vincular participação" }));
    expect(await avisos().findByText("Selecione a pessoa para vincular.")).toBeInTheDocument();

    await usuario.selectOptions(screen.getByRole("combobox", { name: "Pessoa" }), PESSOA_CARLA);
    await usuario.click(screen.getByRole("button", { name: "Vincular participação" }));

    await waitFor(() =>
      expect(chamadasPara("POST", "/admin/agenda/conciliacao/vinculos")[0]?.corpo).toEqual({
        eventoId: "3001",
        participanteId: "p2",
        pessoaId: PESSOA_CARLA,
      }),
    );
  });

  it("marca a participação em análise como não membro", async () => {
    await abrir();

    await usuario.click(screen.getByRole("button", { name: "Não é membro do capítulo" }));

    expect(await avisos().findByText("Participação marcada como não membro")).toBeInTheDocument();
    expect(chamadasPara("POST", "/admin/agenda/conciliacao/nao-membros")[0].corpo).toEqual({
      inscricoes: [{ eventoId: "3001", participanteId: "p2" }],
    });
  });

  it("marca as selecionadas da fila como não membros", async () => {
    await abrir();

    const marcar = screen.getByRole("button", { name: "Marcar selecionados como não membros" });
    await usuario.click(marcar);
    expect(await avisos().findByText("Selecione ao menos uma participação.")).toBeInTheDocument();

    await usuario.click(screen.getByRole("checkbox", { name: "Selecionar bruno@teste.com" }));
    await usuario.click(screen.getByRole("checkbox", { name: "Selecionar ana.pessoal@teste.com" }));
    await usuario.click(marcar);

    expect(
      await avisos().findByText("Participações marcadas como não membros"),
    ).toBeInTheDocument();
    expect(chamadasPara("POST", "/admin/agenda/conciliacao/nao-membros")[0].corpo).toEqual({
      inscricoes: [
        { eventoId: "3001", participanteId: "p2" },
        { eventoId: "3001", participanteId: "p3" },
      ],
    });
  });

  it("desfaz uma resolução e avisa quando uma ação falha", async () => {
    await abrir();

    await usuario.click(screen.getByRole("button", { name: "Desfazer" }));
    expect(await avisos().findByText("A participação voltou para a fila")).toBeInTheDocument();
    expect(
      chamadas.some(
        (c) => c.metodo === "DELETE" && c.caminho === "/admin/agenda/conciliacao/3001/p9",
      ),
    ).toBe(true);

    servidor.use(
      http.post(
        "*/api/admin/agenda/conciliacao/nao-membros",
        () => new HttpResponse(null, { status: 500 }),
      ),
    );
    await usuario.click(screen.getByRole("button", { name: "Não é membro do capítulo" }));
    expect(
      await avisos().findByText("Não foi possível concluir a ação. Tente novamente."),
    ).toBeInTheDocument();
  });

  it("troca o período pela URL e mostra a fila vazia", async () => {
    servidor.use(
      http.get("*/api/admin/agenda/conciliacao", () =>
        HttpResponse.json({ total: 0, fila: [], resolvidas: [], pessoas: [] }),
      ),
    );
    await abrir("periodo=12m");

    expect(chamadasPara("GET", "/admin/agenda/conciliacao")[0].busca).toBe("?periodo=12m");
    expect(
      screen.getByText("Nenhuma participação aguardando conciliação neste período."),
    ).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Em análise" })).not.toBeInTheDocument();

    await usuario.selectOptions(screen.getByRole("combobox", { name: "Período" }), "recentes");
    expect(roteadorFalso.replace).toHaveBeenLastCalledWith("/admin/eventos/conciliacao", {
      scroll: false,
    });
  });
});
