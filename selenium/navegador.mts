import {
  Browser,
  Builder,
  Key,
  type Locator,
  type WebDriver,
  type WebElement,
} from "selenium-webdriver";
import chrome from "selenium-webdriver/chrome.js";

const URL_PRODUCAO = "https://frontend-membership-area.vercel.app";

export const URL_BASE = (process.env.SELENIUM_URL ?? URL_PRODUCAO).replace(/\/$/, "");
const PAUSA_MS = Number(process.env.SELENIUM_PAUSA_MS ?? 800);
const PAUSA_TECLA_MS = 60;
const ESPERA_MS = 20_000;

function esperar(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class Navegador {
  private readonly driver: WebDriver;

  private constructor(driver: WebDriver) {
    this.driver = driver;
  }

  static async abrir() {
    const opcoes = new chrome.Options();
    opcoes.windowSize({ width: 1280, height: 900 });
    opcoes.addArguments("--lang=pt-BR");
    if (process.env.SELENIUM_HEADLESS === "true") opcoes.addArguments("--headless=new");

    const driver = await new Builder().forBrowser(Browser.CHROME).setChromeOptions(opcoes).build();
    return new Navegador(driver);
  }

  pausa() {
    return esperar(PAUSA_MS);
  }

  async visitar(caminho: string) {
    await this.driver.get(`${URL_BASE}${caminho}`);
    await this.pausa();
  }

  async encontrar(locator: Locator): Promise<WebElement> {
    return this.driver.wait(
      async () => (await this.visiveis(locator))[0] ?? false,
      ESPERA_MS,
      `Elemento visível não encontrado: ${locator.toString()}`,
    );
  }

  async visiveis(locator: Locator) {
    const elementos = await this.driver.findElements(locator);
    const visiveis: WebElement[] = [];
    for (const elemento of elementos) {
      if (await elemento.isDisplayed().catch(() => false)) visiveis.push(elemento);
    }
    return visiveis;
  }

  async existe(locator: Locator) {
    return (await this.visiveis(locator)).length > 0;
  }

  async rolarAte(elemento: WebElement) {
    await this.driver.executeScript(
      "arguments[0].scrollIntoView({ block: 'center', behavior: 'smooth' })",
      elemento,
    );
    await esperar(PAUSA_MS / 2);
  }

  async clicar(alvo: Locator | WebElement) {
    const elemento = "getText" in alvo ? alvo : await this.encontrar(alvo);
    await this.rolarAte(elemento);
    await elemento.click();
    await this.pausa();
  }

  async digitar(locator: Locator, texto: string) {
    const campo = await this.encontrar(locator);
    await this.rolarAte(campo);
    await campo.click();
    for (const letra of texto) {
      await campo.sendKeys(letra);
      await esperar(PAUSA_TECLA_MS);
    }
    await this.pausa();
  }

  async limpar(locator: Locator) {
    const campo = await this.encontrar(locator);
    const valor = (await campo.getAttribute("value")) ?? "";
    for (let i = 0; i < valor.length; i++) {
      await campo.sendKeys(Key.BACK_SPACE);
      await esperar(PAUSA_TECLA_MS / 2);
    }
    await this.pausa();
  }

  async escolherOpcao(seletor: Locator, textoOpcao: string) {
    const select = await this.encontrar(seletor);
    await this.rolarAte(select);
    await select.click();
    await esperar(PAUSA_MS / 2);
    const opcao = await select.findElement({
      xpath: `./option[normalize-space(.)="${textoOpcao}"]`,
    });
    await opcao.click();
    await this.pausa();
  }

  async texto(locator: Locator) {
    return (await this.encontrar(locator)).getText();
  }

  async aguardarTexto(locator: Locator, esperado: string) {
    await this.driver.wait(
      async () => {
        const elemento = (await this.visiveis(locator))[0];
        return elemento ? (await elemento.getText()).trim() === esperado : false;
      },
      ESPERA_MS,
      `Texto "${esperado}" não apareceu em ${locator.toString()}`,
    );
  }

  async aguardarUrl(condicao: (url: URL) => boolean, descricao: string) {
    await this.driver.wait(
      async () => condicao(new URL(await this.driver.getCurrentUrl())),
      ESPERA_MS,
      `A URL não chegou em: ${descricao}`,
    );
    await this.pausa();
  }

  async urlAtual() {
    return new URL(await this.driver.getCurrentUrl());
  }

  async naNovaAba<T>(acao: () => Promise<void>, verificar: (url: URL) => Promise<T>) {
    const original = await this.driver.getWindowHandle();
    const antes = await this.driver.getAllWindowHandles();
    await acao();
    await this.driver.wait(
      async () => (await this.driver.getAllWindowHandles()).length > antes.length,
      ESPERA_MS,
      "Nenhuma aba nova foi aberta",
    );
    const novaAba = (await this.driver.getAllWindowHandles()).find((aba) => !antes.includes(aba));
    if (!novaAba) throw new Error("Nenhuma aba nova foi aberta");
    await this.driver.switchTo().window(novaAba);
    await this.driver.wait(
      async () => (await this.driver.getCurrentUrl()) !== "about:blank",
      ESPERA_MS,
    );
    await this.pausa();
    const resultado = await verificar(await this.urlAtual());
    await this.driver.close();
    await this.driver.switchTo().window(original);
    await this.pausa();
    return resultado;
  }

  async fechar() {
    await this.driver.quit();
  }
}
