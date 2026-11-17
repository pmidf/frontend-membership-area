import { expect, test, type Page } from "@playwright/test";

import {
  aguardarCaminho,
  aguardarCarregamento,
  exigirCredenciais,
  passo,
  sairEConferirBloqueio,
  semDados,
  tituloDaPagina,
} from "./apoio";
import {
  baixarArquivo,
  cadastrarBeneficio,
  cadastrarConteudo,
  cadastrarQuebraCabeca,
  cadastrarTrilha,
  cadastrarVaga,
  conferirAviso,
  confirmarDialogo,
  diaDaqui,
  entrarNoConsole,
  garantirCategoria,
  irPeloConsole,
  type Beneficio,
  type Vaga,
} from "./console";

const marca = new Date().toLocaleString("pt-BR", {
  timeZone: "America/Sao_Paulo",
  day: "2-digit",
  month: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
});
const nome = (descricao: string) => `[Teste e2e] ${descricao} ${marca}`;

const nomes = {
  beneficioRascunho: nome("Benefício rascunho"),
  beneficioPublicado: nome("Benefício publicado"),
  categoria: nome("Categoria"),
  video: nome("Vídeo rascunho"),
  material: nome("Material publicado"),
  trilha: nome("Trilha publicada"),
  vagaRascunho: nome("Vaga rascunho"),
  vagaPublicada: nome("Vaga publicada"),
  quebraCabeca: nome("Quebra-cabeça"),
};
const DESCRICAO = "Cadastrado automaticamente pelo teste e2e de produção.";
const EDITADO = "Editado automaticamente pelo teste e2e de produção.";

const beneficio = (titulo: string, publicar: boolean): Beneficio => ({
  titulo,
  legenda: "Benefício criado pelo teste e2e",
  descricao: DESCRICAO,
  categoria: "Educação",
  parceiro: 0,
  imagem: "https://comunidade.pmidf.org/brand/logo-pmi-df.png",
  resgate: { cupom: "E2E10" },
  inicio: diaDaqui(0),
  publicar,
});

const vaga = (titulo: string, publicar: boolean): Vaga => ({
  titulo,
  empresa: "Empresa de Teste e2e",
  descricao: DESCRICAO,
  modalidade: "Remoto",
  candidatura: { link: "https://www.pmidf.org/" },
  publicar,
});

function campo(page: Page, rotulo: string) {
  return page.getByLabel(rotulo, { exact: true }).filter({ visible: true });
}

async function salvarAlteracoes(page: Page, aviso: string) {
  await page.getByRole("button", { name: /^Salvar (alterações|como rascunho|rascunho)$/ }).click();
  await conferirAviso(page, aviso);
}

async function buscarNaLista(page: Page, rotuloDaBusca: string, termo: string) {
  await page.getByRole("searchbox", { name: rotuloDaBusca }).fill(termo);
  await aguardarCarregamento(page);
}

test("o administrador cadastra, edita e acompanha itens em todas as áreas do console", async ({
  page,
}) => {
  const credenciais = exigirCredenciais("E2E_ADMIN");

  await passo(page, "entra e chega ao console pelo menu da conta", async () => {
    await entrarNoConsole(page, credenciais);
  });

  await passo(page, "busca uma pessoa e abre o detalhe", async () => {
    await buscarNaLista(page, "Buscar por nome, e-mail ou PMI ID", credenciais.email);
    const perfis = page.getByRole("link", { name: /^Ver perfil de / });
    await expect(perfis.first()).toBeVisible();
    await perfis.first().click();
    await aguardarCaminho(page, /^\/admin\/pessoas\/[^/]+$/);
    for (const secao of ["Dados pessoais", "Filiação PMI", "Sessões ativas", "Situação da conta"]) {
      const titulo = page.getByRole("heading", { level: 2, name: secao });
      await titulo.scrollIntoViewIfNeeded();
      await expect(titulo).toBeVisible();
    }
    await page.getByRole("link", { name: "Voltar para Pessoas" }).click();
    await aguardarCaminho(page, "/admin/pessoas");
  });

  await passo(page, "cadastra um benefício como rascunho, edita e arquiva", async () => {
    await cadastrarBeneficio(page, beneficio(nomes.beneficioRascunho, false));
    await campo(page, "Legenda curta").fill("Benefício editado pelo teste e2e");
    await salvarAlteracoes(page, "Alterações salvas.");
    await page.getByRole("button", { name: "Arquivar", exact: true }).click();
    await confirmarDialogo(page, "Arquivar benefício?", "Arquivar");
    await conferirAviso(page, "Benefício arquivado.");
    await expect(campo(page, "Título da vantagem")).toBeDisabled();
  });

  await passo(page, "cadastra e publica um benefício, despublica e publica de novo", async () => {
    await cadastrarBeneficio(page, beneficio(nomes.beneficioPublicado, true));
    await buscarNaLista(page, "Buscar benefício ou parceiro", nomes.beneficioPublicado);
    await page.getByRole("link", { name: `Editar ${nomes.beneficioPublicado}` }).click();
    await aguardarCaminho(page, /^\/admin\/beneficios\/(?!novo$)[^/]+$/);
    await page.getByRole("button", { name: "Despublicar" }).click();
    await confirmarDialogo(page, "Despublicar benefício?", "Despublicar");
    await conferirAviso(page, "Benefício despublicado.");
    await page.getByRole("button", { name: "Publicar benefício" }).click();
    await conferirAviso(page, "Benefício publicado.");
    await expect(page.getByRole("button", { name: "Despublicar" })).toBeVisible();
  });

  await passo(page, "acompanha o relatório de resgates e exporta o CSV", async () => {
    await irPeloConsole(page, "Benefícios", "/admin/beneficios", "Benefícios");
    const relatorio = page.getByRole("region", { name: "Relatório de resgates" });
    await relatorio.scrollIntoViewIfNeeded();
    await expect(relatorio).toBeVisible();
    await aguardarCarregamento(page);
    await baixarArquivo(page, relatorio.getByRole("button", { name: /^Exportar CSV/ }));
    await conferirAviso(page, "Relatório exportado");
  });

  await passo(
    page,
    "abre os participantes de um evento, filtra por tipo de ingresso e exporta o CSV",
    async () => {
      await irPeloConsole(page, "Eventos", "/admin/eventos", "Eventos");
      await aguardarCarregamento(page);
      const comInscritos = page.locator("table tbody tr:visible").filter({
        has: page.locator("td:nth-child(5)", { hasText: /^\s*[1-9]\d*( inscritos| · )/ }),
      });
      if ((await comInscritos.count()) === 0) {
        semDados("nenhum evento com inscritos no período");
        return;
      }
      await comInscritos.first().getByRole("link", { name: "Ver participantes" }).click();
      await aguardarCaminho(page, /^\/admin\/eventos\/[^/]+\/participantes$/);
      await expect(tituloDaPagina(page)).toHaveText(/ · Participantes$/);
      await aguardarCarregamento(page);

      const linhas = page.locator("table tbody tr:visible");
      await expect(linhas.first()).toBeVisible();
      const total = await linhas.count();
      const filtro = page.getByRole("combobox", { name: /Tipo de ingresso/ });
      const tipo = ((await filtro.locator("option").nth(1).textContent()) ?? "").trim();
      await filtro.selectOption({ label: tipo });

      await expect(filtro).not.toHaveValue("");
      const filtradas = await linhas.count();
      expect(filtradas).toBeGreaterThan(0);
      for (let indice = 0; indice < filtradas; indice += 1) {
        await expect(linhas.nth(indice).locator("td").nth(2)).toHaveText(tipo);
      }
      if (filtradas < total) {
        await expect(
          page.getByText(`${filtradas} de ${total} participantes`).filter({ visible: true }),
        ).toBeVisible();
      }

      await baixarArquivo(page, page.getByRole("button", { name: "Exportar participantes (CSV)" }));
      await conferirAviso(page, "CSV exportado");
    },
  );

  await passo(page, "abre as abas Números e Conciliação dos eventos", async () => {
    await irPeloConsole(page, "Eventos", "/admin/eventos", "Eventos");
    const abas = page.getByRole("navigation", { name: "Seções de eventos" });
    await abas.getByRole("link", { name: "Números", exact: true }).click();
    await aguardarCaminho(page, "/admin/eventos/numeros");
    await expect(tituloDaPagina(page, "Eventos · Números")).toBeVisible();
    await expect(page.locator("#titulo-totais:visible")).toBeVisible();
    await abas.getByRole("link", { name: "Conciliação", exact: true }).click();
    await aguardarCaminho(page, "/admin/eventos/conciliacao");
    await expect(tituloDaPagina(page, "Participações não vinculadas")).toBeVisible();
    await expect(page.locator("#titulo-fila:visible")).toBeVisible();
  });

  await passo(page, "cadastra uma nova categoria de conteúdo", async () => {
    await garantirCategoria(page, nomes.categoria);
  });

  await passo(page, "cadastra um vídeo como rascunho e edita a descrição", async () => {
    await cadastrarConteudo(page, {
      titulo: nomes.video,
      tipo: "VIDEO",
      url: "https://www.youtube.com/watch?v=9TycLR0TqFA",
      descricao: DESCRICAO,
      categoria: nomes.categoria,
      publicar: false,
    });
    await campo(page, "Descrição").fill(EDITADO);
    await salvarAlteracoes(page, "Conteúdo atualizado");
  });

  await passo(page, "cadastra e publica um material", async () => {
    await cadastrarConteudo(page, {
      titulo: nomes.material,
      tipo: "MATERIAL",
      url: "https://scrumguides.org/scrum-guide.html",
      descricao: DESCRICAO,
      categoria: nomes.categoria,
      publicar: true,
    });
  });

  await passo(page, "abre o material pela área do membro e exporta o CSV de acessos", async () => {
    await buscarNaLista(page, "Buscar conteúdo", nomes.material);
    const estatisticas = page.getByRole("link", { name: `Ver estatísticas de ${nomes.material}` });
    const endereco = (await estatisticas.getAttribute("href")) ?? "";
    const id = endereco.split("/")[3];

    await page.goto(`/conteudos/${id}`);
    await expect(tituloDaPagina(page, nomes.material)).toBeVisible();
    const [aba] = await Promise.all([
      page.context().waitForEvent("page"),
      page.getByRole("button", { name: "Abrir material" }).click(),
    ]);
    await aba.waitForLoadState();
    await aba.close();

    await page.goto(`/admin/conteudos/${id}/estatisticas`);
    await expect(page.getByText("Visualizações totais").filter({ visible: true })).toBeVisible();
    await expect(page.getByRole("list", { name: "Pessoas que acessaram" })).toBeVisible();
    await baixarArquivo(page, page.getByRole("button", { name: "Exportar CSV" }));
    await conferirAviso(page, "CSV exportado");
  });

  await passo(page, "cadastra uma trilha, reordena os conteúdos e publica", async () => {
    await cadastrarTrilha(page, {
      titulo: nomes.trilha,
      descricao: DESCRICAO,
      conteudos: [nomes.material, nomes.video],
      subir: nomes.video,
      publicar: true,
    });
  });

  await passo(page, "cadastra uma vaga como rascunho e edita a localidade", async () => {
    await cadastrarVaga(page, vaga(nomes.vagaRascunho, false));
    await campo(page, "Localidade").fill("Brasília/DF");
    await salvarAlteracoes(page, "Rascunho salvo");
  });

  await passo(page, "cadastra e publica uma vaga, depois encerra", async () => {
    await cadastrarVaga(page, vaga(nomes.vagaPublicada, true));
    await buscarNaLista(page, "Buscar por título ou empresa", nomes.vagaPublicada);
    await page.getByRole("button", { name: `Encerrar ${nomes.vagaPublicada}` }).click();
    await confirmarDialogo(page, "Encerrar vaga?", "Encerrar vaga");
    await expect(
      page.getByRole("button", { name: `Duplicar ${nomes.vagaPublicada}` }),
    ).toBeVisible();
  });

  await passo(page, "cadastra um quebra-cabeça, tira do ar e vê o ranking", async () => {
    await cadastrarQuebraCabeca(page, {
      nome: nomes.quebraCabeca,
      legenda: "Quebra-cabeça criado pelo teste e2e",
      historia: DESCRICAO,
      imagem: "sample.jpg",
      publicar: true,
    });
    await page.getByRole("button", { name: `Tirar do ar: ${nomes.quebraCabeca}` }).click();
    await confirmarDialogo(page, `Tirar "${nomes.quebraCabeca}" do ar?`, "Tirar do ar");
    await conferirAviso(page, "Quebra-cabeça fora do ar");

    await page.getByRole("link", { name: /Ver estatísticas/ }).click();
    await aguardarCaminho(page, "/admin/quebra-cabecas/estatisticas");
    await expect(tituloDaPagina(page, "Estatísticas de gamificação")).toBeVisible();
    await aguardarCarregamento(page);
    await expect(
      page
        .getByLabel("Ranking dos filiados mais engajados")
        .or(page.getByText("Ninguém concluiu um quebra-cabeça ainda."))
        .filter({ visible: true })
        .first(),
    ).toBeVisible();
    await page.getByRole("link", { name: "Voltar para quebra-cabeças" }).click();
    await aguardarCaminho(page, "/admin/quebra-cabecas");
  });

  await passo(page, "volta à área do membro, sai e perde o acesso ao console", async () => {
    await page.getByRole("link", { name: "Voltar à área do membro" }).click();
    await aguardarCaminho(page, "/inicio");
    await sairEConferirBloqueio(page, "/admin/conteudos");
  });
});
