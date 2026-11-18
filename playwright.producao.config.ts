import { existsSync } from "node:fs";

import { defineConfig, devices } from "@playwright/test";

const ARQUIVO_DE_CREDENCIAIS = ".env.e2e";

if (existsSync(ARQUIVO_DE_CREDENCIAIS)) process.loadEnvFile(ARQUIVO_DE_CREDENCIAIS);

const URL_PRODUCAO = "https://comunidade.pmidf.org";
const TELA = { width: 1600, height: 900 };
const TESTE_DE_POPULAR = /popular\.spec\.ts/;
const ATRASO_ENTRE_ACOES_MS = Math.round(Number(process.env.E2E_DELAY || 1.5) * 1000);
const DESTACAR = process.env.E2E_DESTACAR !== "false";

const destaques = DESTACAR
  ? {
      show: {
        actions: {
          duration: Math.max(ATRASO_ENTRE_ACOES_MS, 800),
          position: "top" as const,
          cursor: "pointer" as const,
          style: {
            highlight:
              "outline: 4px solid #f97316; border-radius: 6px; background: rgba(249, 115, 22, .25)",
            point:
              "width: 18px; height: 18px; border-radius: 50%; background: rgba(220, 38, 38, .75)",
          },
        },
        test: { level: "step" as const, position: "bottom-right" as const },
      },
    }
  : {};

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
    video: { mode: "on", size: TELA, ...destaques },
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
        launchOptions: { slowMo: ATRASO_ENTRE_ACOES_MS },
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
