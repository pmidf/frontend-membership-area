import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import { By } from "selenium-webdriver";
import { Navegador, URL_BASE } from "./navegador.mts";

const TITULO_PAGINA = By.css("h1");
const CAMPO_BUSCA = By.css('input[type="search"]');
const SELETOR_FORMATO = By.xpath('//select[option[@value="" and normalize-space(.)="Formato"]]');
const SELETOR_PERIODO = By.xpath('//select[option[@value="" and normalize-space(.)="Período"]]');
const TITULO_DESTAQUE = By.css('article h2 a[href^="/agenda/"]');
const SECAO_PROXIMOS = '[aria-labelledby="titulo-proximos"]';
const TITULO_SECAO_PROXIMOS = By.id("titulo-proximos");
const ITENS_PROXIMOS = By.css(`${SECAO_PROXIMOS} li a[href^="/agenda/"]`);
const ITENS_PASSADOS = By.css('[aria-labelledby="titulo-passados"] li a[href^="/agenda/"]');
const TITULO_EVENTO = By.id("titulo-evento");
const TITULO_MES = By.id("titulo-mes");
const DIALOGO_ABERTO = By.css("dialog[open]");
const VOLTAR_AGENDA = By.xpath('//a[normalize-space(.)="‹ Voltar para a agenda"]');
const NOMES_MESES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

function opcaoVisao(nome: string) {
  return By.xpath(`//nav[@aria-label="Visão da agenda"]//a[normalize-space(.)="${nome}"]`);
}

function linkComTexto(texto: string) {
  return By.xpath(`//*[self::a or self::button][normalize-space(.)="${texto}"]`);
}

function mesSeguinte(titulo: string, delta: number) {
  const [nome, ano] = titulo.split(" ");
  const data = new Date(Date.UTC(Number(ano), NOMES_MESES.indexOf(nome) + delta, 1));
  return `${NOMES_MESES[data.getUTCMonth()]} ${data.getUTCFullYear()}`;
}

describe("Agenda de eventos em produção", { timeout: 300_000 }, () => {
  let navegador: Navegador;

  before(async () => {
    navegador = await Navegador.abrir();
  });

  after(async () => {
    await navegador?.fechar();
  });

  it("abre a agenda e mostra o próximo evento em destaque e a lista de próximos", async () => {
    await navegador.visitar("/agenda");

    await navegador.aguardarTexto(TITULO_PAGINA, "Agenda de eventos");
    await navegador.aguardarTexto(TITULO_SECAO_PROXIMOS, "Próximos eventos");
    assert.ok(await navegador.existe(TITULO_DESTAQUE), "deveria haver um evento em destaque");
    await navegador.rolarAte(await navegador.encontrar(TITULO_SECAO_PROXIMOS));
    await navegador.pausa();
  });

  it("busca um evento pelo nome e depois limpa a busca", async () => {
    await navegador.visitar("/agenda");
    const destaque = await navegador.encontrar(TITULO_DESTAQUE);
    const titulo = await destaque.getText();
    const href = await destaque.getAttribute("href");
    const termo = titulo.split(" ").slice(0, 3).join(" ");

    await navegador.digitar(CAMPO_BUSCA, termo);

    await navegador.aguardarUrl((url) => url.searchParams.get("q") === termo, `q=${termo}`);
    await navegador.aguardarTexto(TITULO_SECAO_PROXIMOS, "Eventos encontrados");
    const encontrados = await navegador.visiveis(ITENS_PROXIMOS);
    const hrefs = await Promise.all(encontrados.map((item) => item.getAttribute("href")));
    assert.ok(hrefs.includes(href), `"${titulo}" deveria estar entre os resultados`);

    await navegador.limpar(CAMPO_BUSCA);

    await navegador.aguardarUrl((url) => !url.searchParams.has("q"), "sem o parâmetro q");
    await navegador.aguardarTexto(TITULO_SECAO_PROXIMOS, "Próximos eventos");
  });

  it("filtra os eventos online pelo formato", async () => {
    await navegador.visitar("/agenda");

    await navegador.escolherOpcao(SELETOR_FORMATO, "Online");

    await navegador.aguardarUrl(
      (url) => url.searchParams.get("formato") === "online",
      "formato=online",
    );
    await navegador.aguardarTexto(TITULO_SECAO_PROXIMOS, "Eventos encontrados");
    for (const item of await navegador.visiveis(ITENS_PROXIMOS)) {
      assert.match(await item.getText(), /Online/);
    }

    await navegador.escolherOpcao(SELETOR_FORMATO, "Formato");
    await navegador.aguardarUrl(
      (url) => !url.searchParams.has("formato"),
      "sem o parâmetro formato",
    );
  });

  it("mostra os eventos passados pelo filtro de período", async () => {
    await navegador.visitar("/agenda");

    await navegador.escolherOpcao(SELETOR_PERIODO, "Eventos passados");

    await navegador.aguardarUrl(
      (url) => url.searchParams.get("periodo") === "passados",
      "periodo=passados",
    );
    await navegador.aguardarTexto(By.id("titulo-passados"), "Eventos passados");
    const passados = await navegador.visiveis(ITENS_PASSADOS);
    assert.ok(passados.length > 0, "deveria listar ao menos um evento passado");
    for (const item of passados) {
      assert.doesNotMatch(await item.getText(), /Inscrever-se/);
    }

    const verMais = linkComTexto("Ver mais eventos passados");
    if (await navegador.existe(verMais)) {
      await navegador.clicar(verMais);
      await navegador.aguardarUrl(
        (url) => url.searchParams.has("limite"),
        "com o parâmetro limite",
      );
      assert.ok((await navegador.visiveis(ITENS_PASSADOS)).length > passados.length);
    }
  });

  it("abre o detalhe do evento e, sem login, vai direto ao Sympla sem popup", async () => {
    await navegador.visitar("/agenda");
    const destaque = await navegador.encontrar(TITULO_DESTAQUE);
    const titulo = await destaque.getText();
    const caminho = new URL((await destaque.getAttribute("href")) ?? "", URL_BASE).pathname;

    await navegador.clicar(destaque);

    await navegador.aguardarUrl((url) => url.pathname === caminho, caminho);
    await navegador.aguardarTexto(TITULO_EVENTO, titulo);
    await navegador.aguardarTexto(By.id("titulo-inscricao"), "Inscrição");

    const botaoSympla = await navegador.encontrar(linkComTexto("Inscrever-se no Sympla"));
    assert.equal(await botaoSympla.getTagName(), "a", "visitante vai direto ao Sympla, sem popup");
    assert.equal(await botaoSympla.getAttribute("target"), "_blank");
    assert.equal(
      await navegador.existe(By.id("titulo-presenca")),
      false,
      "visitante não vê o card de presença reconhecida",
    );

    const hostSympla = await navegador.naNovaAba(
      () => navegador.clicar(botaoSympla),
      async (url) => url.hostname,
    );
    assert.match(hostSympla, /sympla\.com\.br$/);
    assert.equal(await navegador.existe(DIALOGO_ABERTO), false);

    await navegador.clicar(VOLTAR_AGENDA);
    await navegador.aguardarUrl((url) => url.pathname === "/agenda", "/agenda");
    await navegador.aguardarTexto(TITULO_PAGINA, "Agenda de eventos");
  });

  it("alterna para o calendário, navega entre os meses e abre um evento", async () => {
    await navegador.visitar("/agenda");

    await navegador.clicar(opcaoVisao("Calendário"));

    await navegador.aguardarUrl(
      (url) => url.searchParams.get("visao") === "calendario",
      "visao=calendario",
    );
    const mesInicial = await navegador.texto(TITULO_MES);

    await navegador.clicar(By.css('[aria-label="Próximo mês"]'));
    await navegador.aguardarTexto(TITULO_MES, mesSeguinte(mesInicial, 1));

    await navegador.clicar(By.css('[aria-label="Mês anterior"]'));
    await navegador.aguardarTexto(TITULO_MES, mesInicial);

    const eventosDoMes = await navegador.visiveis(By.css('table a[href^="/agenda/"]'));
    if (eventosDoMes.length > 0) {
      const titulo = (await eventosDoMes[0].getAttribute("title")) ?? "";
      await navegador.clicar(eventosDoMes[0]);
      await navegador.aguardarTexto(TITULO_EVENTO, titulo.replace(/ \(cancelado\)$/, ""));
      await navegador.clicar(VOLTAR_AGENDA);
    }

    await navegador.visitar("/agenda?visao=calendario");
    await navegador.clicar(opcaoVisao("Lista"));
    await navegador.aguardarUrl((url) => !url.searchParams.has("visao"), "visão de lista");
    await navegador.aguardarTexto(TITULO_SECAO_PROXIMOS, "Próximos eventos");
  });

  it("avisa quando o evento não existe e permite voltar para a agenda", async () => {
    await navegador.visitar("/agenda/evento-que-nao-existe");

    await navegador.encontrar(By.xpath('//*[normalize-space(.)="Evento não encontrado"]'));

    await navegador.clicar(VOLTAR_AGENDA);
    await navegador.aguardarUrl((url) => url.pathname === "/agenda", "/agenda");
    await navegador.aguardarTexto(TITULO_PAGINA, "Agenda de eventos");
  });
});
