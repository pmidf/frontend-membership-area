import { expect, test, type Locator, type Page } from "@playwright/test";

import { abrirMenuDaConta, aguardarCaminho, digitar, entrar, tituloDaPagina } from "./apoio";

const FUSO = "America/Sao_Paulo";
const CLOUDINARY = "https://res.cloudinary.com/demo/image/upload";
const LARGURA_QUEBRA_CABECA = 1200;
const ALTURA_QUEBRA_CABECA = 600;
const LADO_DA_PECA = 300;
const PECAS_POR_LINHA = 4;
const TOTAL_DE_PECAS = 8;

export type Beneficio = {
  titulo: string;
  legenda: string;
  descricao: string;
  categoria: "Educação" | "Ferramentas" | "Eventos" | "Certificação" | "Carreira";
  parceiro: number;
  imagem: string;
  resgate: { cupom: string } | { instrucao: string };
  inicio: string;
  fim?: string;
  publicar: boolean;
};

export type Conteudo = {
  titulo: string;
  tipo: "VIDEO" | "MATERIAL";
  url: string;
  descricao: string;
  categoria: string;
  acesso?: "EXCLUSIVO" | "PUBLICO";
  publicar: boolean;
};

export type Trilha = {
  titulo: string;
  descricao: string;
  conteudos: string[];
  subir?: string;
  publicar: boolean;
};

export type Vaga = {
  titulo: string;
  empresa: string;
  descricao: string;
  modalidade?: "Híbrido" | "Remoto" | "Presencial";
  localidade?: string;
  encerramento?: string;
  candidatura: { link: string } | { email: string };
  publicar: boolean;
};

export type QuebraCabeca = {
  nome: string;
  legenda: string;
  historia: string;
  imagem: string;
  publicar: boolean;
};

export function diaDaqui(dias: number) {
  const data = new Date(Date.now() + dias * 24 * 60 * 60 * 1000);
  return data.toLocaleDateString("sv-SE", { timeZone: FUSO });
}

export function imagemDeExemplo(caminho: string, largura = 800, altura = 450) {
  return `${CLOUDINARY}/c_fill,w_${largura},h_${altura}/${caminho}`;
}

function campo(page: Page, rotulo: string) {
  return page.getByLabel(rotulo, { exact: true }).filter({ visible: true });
}

async function escolherOpcao(page: Page, texto: string) {
  await page.getByText(texto, { exact: true }).filter({ visible: true }).first().click();
}

export async function confirmarDialogo(page: Page, titulo: string, botao: string) {
  const dialogo = page.getByRole("dialog", { name: titulo });
  await dialogo.getByRole("button", { name: botao, exact: true }).click();
  await expect(dialogo).toBeHidden();
}

export async function baixarArquivo(page: Page, botao: Locator) {
  const [arquivo] = await Promise.all([page.waitForEvent("download"), botao.click()]);
  const nome = arquivo.suggestedFilename();
  await arquivo.saveAs(test.info().outputPath(nome));
  expect(nome).toMatch(/\.csv$/);
  return nome;
}

export async function conferirAviso(page: Page, texto: string) {
  await expect(page.getByRole("region", { name: "Avisos" })).toContainText(texto);
}

export async function irPeloConsole(page: Page, rotulo: string, caminho: string, titulo: string) {
  await page
    .getByRole("navigation", { name: "Console administrativo" })
    .getByRole("link", { name: rotulo, exact: true })
    .click();
  await aguardarCaminho(page, caminho);
  await expect(tituloDaPagina(page, titulo)).toBeVisible();
}

export async function entrarNoConsole(page: Page, credenciais: { email: string; senha: string }) {
  await entrar(page, credenciais);
  const menu = await abrirMenuDaConta(page);
  await menu.getByRole("link", { name: "Console administrativo" }).click();
  await aguardarCaminho(page, "/admin/pessoas");
  await expect(tituloDaPagina(page, "Pessoas")).toBeVisible();
}

export async function cadastrarBeneficio(page: Page, beneficio: Beneficio) {
  await irPeloConsole(page, "Benefícios", "/admin/beneficios", "Benefícios");
  await page.getByRole("link", { name: "Novo benefício" }).click();
  await aguardarCaminho(page, "/admin/beneficios/novo");
  await expect(tituloDaPagina(page, "Novo benefício")).toBeVisible();

  await digitar(campo(page, "Título da vantagem"), beneficio.titulo);
  await digitar(campo(page, "Legenda curta"), beneficio.legenda);
  await digitar(campo(page, "Descrição completa"), beneficio.descricao);
  await campo(page, "Categoria").selectOption({ label: beneficio.categoria });
  const parceiro = campo(page, "Parceiro");
  await expect(parceiro.locator("option").nth(1)).toBeAttached();
  const totalDeParceiros = (await parceiro.locator("option").count()) - 1;
  await parceiro.selectOption({ index: 1 + (beneficio.parceiro % totalDeParceiros) });
  await digitar(campo(page, "URL da imagem"), beneficio.imagem);
  if ("cupom" in beneficio.resgate) {
    await escolherOpcao(page, "Cupom compartilhado");
    await digitar(campo(page, "Código do cupom"), beneficio.resgate.cupom);
  } else {
    await escolherOpcao(page, "Instrução por texto");
    await digitar(campo(page, "Instrução de resgate"), beneficio.resgate.instrucao);
  }
  await campo(page, "Início da vigência").fill(beneficio.inicio);
  if (beneficio.fim) await campo(page, "Fim da vigência (opcional)").fill(beneficio.fim);

  if (beneficio.publicar) {
    await page.getByRole("button", { name: "Publicar benefício" }).click();
    await aguardarCaminho(page, "/admin/beneficios");
    await conferirAviso(page, "Benefício publicado");
  } else {
    await page.getByRole("button", { name: "Salvar rascunho" }).click();
    await aguardarCaminho(page, /^\/admin\/beneficios\/(?!novo$)[^/]+$/);
    await expect(tituloDaPagina(page, "Editar benefício")).toBeVisible();
    await expect(campo(page, "Título da vantagem")).toHaveValue(beneficio.titulo);
    await conferirAviso(page, "Rascunho salvo");
  }
}

export async function garantirCategoria(page: Page, nome: string) {
  await irPeloConsole(page, "Conteúdo", "/admin/conteudos", "Conteúdo");
  await page.getByRole("button", { name: "Gerenciar categorias" }).click();
  const dialogo = page.getByRole("dialog", { name: "Categorias" });
  const lista = dialogo.getByRole("list", { name: "Categorias na ordem do catálogo" });
  await expect(lista).toBeVisible();
  const existente = lista.getByRole("listitem").filter({ hasText: nome });
  if ((await existente.count()) === 0) {
    await digitar(dialogo.getByLabel("Nova categoria", { exact: true }), nome);
    await dialogo.getByRole("button", { name: "+ Adicionar" }).click();
    await expect(existente).toBeVisible();
  }
  await dialogo.getByRole("button", { name: "Concluir" }).click();
  await expect(dialogo).toBeHidden();
}

export async function cadastrarConteudo(page: Page, conteudo: Conteudo) {
  await irPeloConsole(page, "Conteúdo", "/admin/conteudos", "Conteúdo");
  await page.getByRole("link", { name: "+ Adicionar conteúdo" }).click();
  await aguardarCaminho(page, "/admin/conteudos/novo");
  await expect(tituloDaPagina(page, "Novo conteúdo")).toBeVisible();

  await digitar(campo(page, "Título"), conteudo.titulo);
  await campo(page, "Tipo").selectOption(conteudo.tipo);
  await digitar(campo(page, "URL"), conteudo.url);
  await digitar(campo(page, "Descrição"), conteudo.descricao);
  await campo(page, "Categoria").selectOption({ label: conteudo.categoria });
  if (conteudo.acesso) await campo(page, "Nível de acesso").selectOption(conteudo.acesso);

  if (conteudo.publicar) {
    await page.getByRole("button", { name: "Publicar conteúdo" }).click();
    await aguardarCaminho(page, "/admin/conteudos");
    await conferirAviso(page, "Conteúdo publicado");
  } else {
    await page.getByRole("button", { name: "Salvar rascunho" }).click();
    await aguardarCaminho(page, /^\/admin\/conteudos\/(?!novo$)[^/]+$/);
    await expect(tituloDaPagina(page, "Edição de conteúdo")).toBeVisible();
    await expect(campo(page, "Título")).toHaveValue(conteudo.titulo);
    await conferirAviso(page, "Rascunho salvo");
  }
}

export async function cadastrarTrilha(page: Page, trilha: Trilha) {
  await irPeloConsole(page, "Conteúdo", "/admin/conteudos", "Conteúdo");
  await page
    .getByRole("navigation", { name: "Seções do conteúdo" })
    .getByRole("link", { name: "Trilhas", exact: true })
    .click();
  await page.waitForURL((url) => url.searchParams.get("aba") === "trilhas");
  await page.getByRole("link", { name: "+ Nova trilha" }).click();
  await aguardarCaminho(page, "/admin/conteudos/trilhas/novo");
  await expect(tituloDaPagina(page, "Nova trilha de conhecimento")).toBeVisible();

  await digitar(campo(page, "Título da trilha"), trilha.titulo);
  await digitar(campo(page, "Descrição"), trilha.descricao);

  await page.getByRole("button", { name: "+ Adicionar conteúdo da biblioteca" }).click();
  const modal = page.getByRole("dialog", { name: "Adicionar conteúdos" });
  for (const titulo of trilha.conteudos) {
    await digitar(modal.getByLabel("Buscar na biblioteca", { exact: true }), titulo);
    await modal
      .getByRole("button", { name: `Adicionar ${titulo}`, exact: true })
      .first()
      .click();
  }
  const total = trilha.conteudos.length;
  await expect(
    modal.getByText(total === 1 ? "1 conteúdo na trilha" : `${total} conteúdos na trilha`),
  ).toBeVisible();
  await modal.getByRole("button", { name: "Concluir" }).click();
  const itens = page
    .getByRole("list", { name: "Conteúdos na ordem da trilha" })
    .getByRole("listitem");
  await expect(itens).toHaveCount(total);
  if (trilha.subir) {
    await page.getByRole("button", { name: `Subir ${trilha.subir}`, exact: true }).click();
    const posicao = trilha.conteudos.indexOf(trilha.subir) - 1;
    await expect(itens.nth(posicao)).toContainText(trilha.subir);
  }

  if (trilha.publicar) {
    await page.getByRole("button", { name: "Publicar trilha" }).click();
    await page.waitForURL(
      (url) => url.pathname === "/admin/conteudos" && url.searchParams.get("aba") === "trilhas",
    );
    await conferirAviso(page, "Trilha publicada");
  } else {
    await page.getByRole("button", { name: "Salvar rascunho" }).click();
    await aguardarCaminho(page, /^\/admin\/conteudos\/trilhas\/(?!novo$)[^/]+$/);
    await expect(tituloDaPagina(page, "Edição de trilha")).toBeVisible();
    await conferirAviso(page, "Rascunho salvo");
  }
}

export async function cadastrarVaga(page: Page, vaga: Vaga) {
  await irPeloConsole(page, "Vagas", "/admin/vagas", "Gerenciar vagas");
  await page.getByRole("link", { name: /Nova vaga/ }).click();
  await aguardarCaminho(page, "/admin/vagas/nova");
  await expect(tituloDaPagina(page, "Nova vaga")).toBeVisible();

  await digitar(campo(page, "Título da vaga"), vaga.titulo);
  await digitar(campo(page, "Empresa"), vaga.empresa);
  await digitar(campo(page, "Descrição"), vaga.descricao);
  if (vaga.localidade) await digitar(campo(page, "Localidade"), vaga.localidade);
  if (vaga.modalidade) await escolherOpcao(page, vaga.modalidade);
  if (vaga.encerramento) await campo(page, "Data de encerramento").fill(vaga.encerramento);
  if ("link" in vaga.candidatura) {
    await escolherOpcao(page, "Link de candidatura");
    await digitar(campo(page, "URL de candidatura"), vaga.candidatura.link);
  } else {
    await escolherOpcao(page, "E-mail do recrutador");
    await digitar(campo(page, "E-mail do recrutador"), vaga.candidatura.email);
  }

  if (vaga.publicar) {
    await page.getByRole("button", { name: "Publicar vaga" }).click();
    await aguardarCaminho(page, "/admin/vagas");
    await conferirAviso(page, "Vaga publicada");
  } else {
    await page.getByRole("button", { name: "Salvar como rascunho" }).click();
    await aguardarCaminho(page, /^\/admin\/vagas\/(?!nova$)[^/]+$/);
    await expect(tituloDaPagina(page, "Edição de vaga")).toBeVisible();
    await expect(campo(page, "Título da vaga")).toHaveValue(vaga.titulo);
    await conferirAviso(page, "Rascunho salvo");
  }
}

function urlsDoQuebraCabeca(imagem: string) {
  const base = `${CLOUDINARY}/c_fill,w_${LARGURA_QUEBRA_CABECA},h_${ALTURA_QUEBRA_CABECA}`;
  const pecas = Array.from({ length: TOTAL_DE_PECAS }, (_, indice) => {
    const x = (indice % PECAS_POR_LINHA) * LADO_DA_PECA;
    const y = Math.floor(indice / PECAS_POR_LINHA) * LADO_DA_PECA;
    return `${base}/c_crop,x_${x},y_${y},w_${LADO_DA_PECA},h_${LADO_DA_PECA}/${imagem}`;
  });
  return { completa: `${base}/${imagem}`, pecas };
}

export async function cadastrarQuebraCabeca(page: Page, quebraCabeca: QuebraCabeca) {
  await irPeloConsole(page, "Quebra-cabeças", "/admin/quebra-cabecas", "Quebra-cabeças");
  await page.getByRole("link", { name: "+ Novo quebra-cabeça" }).click();
  await aguardarCaminho(page, "/admin/quebra-cabecas/novo");
  await expect(tituloDaPagina(page, "Novo quebra-cabeça")).toBeVisible();

  const { completa, pecas } = urlsDoQuebraCabeca(quebraCabeca.imagem);
  await digitar(campo(page, "Nome do quebra-cabeça"), quebraCabeca.nome);
  await digitar(campo(page, "Legenda curta"), quebraCabeca.legenda);
  await digitar(campo(page, "História por trás da imagem"), quebraCabeca.historia);
  await digitar(campo(page, "URL da imagem completa"), completa);
  for (const [indice, url] of pecas.entries()) {
    await digitar(campo(page, `URL da peça ${indice + 1}`), url);
  }

  await page
    .getByRole("button", {
      name: quebraCabeca.publicar ? "Adicionar ao catálogo" : "Salvar rascunho",
    })
    .click();
  await aguardarCaminho(page, "/admin/quebra-cabecas");
  await conferirAviso(
    page,
    quebraCabeca.publicar ? "Quebra-cabeça adicionado ao catálogo." : "Rascunho salvo.",
  );
}
