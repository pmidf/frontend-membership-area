import { existsSync } from "node:fs";

import { defineConfig, devices } from "@playwright/test";

const ARQUIVO_DE_CREDENCIAIS = ".env.e2e";

if (existsSync(ARQUIVO_DE_CREDENCIAIS)) process.loadEnvFile(ARQUIVO_DE_CREDENCIAIS);

const URL_PRODUCAO = "https://comunidade.pmidf.org";
const TELA = { width: 1600, height: 900 };
const TESTE_DE_POPULAR = /popular\.spec\.ts/;

export default defineConfig({
  testDir: "./e2e-producao",
  outputDir: "test-results/producao",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 20 * 60_000,
  expect: { timeout: 20_000 },
  reporter: [["list"], ["html", { open: "never", outputFolder: "playwright-report/producao" }]],
  use: {
    baseURL: process.env.E2E_URL ?? URL_PRODUCAO,
    locale: "pt-BR",
    timezoneId: "America/Sao_Paulo",
    video: { mode: "on", size: TELA },
    trace: "on",
    screenshot: "on",
  },
  projects: [
    {
      name: "producao",
      testIgnore: TESTE_DE_POPULAR,
      use: {
        ...devices["Desktop Chrome"],
        viewport: TELA,
        launchOptions: { slowMo: Number(process.env.E2E_SLOWMO ?? 800) },
      },
    },
    {
      name: "popular",
      testMatch: TESTE_DE_POPULAR,
      use: {
        ...devices["Desktop Chrome"],
        viewport: TELA,
        launchOptions: { slowMo: 0 },
      },
    },
  ],
});
