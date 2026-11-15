import { defineConfig, devices } from "@playwright/test";

const emCi = Boolean(process.env.CI);
const portaBackendAgenda = 3399;
const backendAgenda = `http://localhost:${portaBackendAgenda}`;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: emCi,
  retries: emCi ? 2 : 0,
  reporter: emCi ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: "http://localhost:3001",
    locale: "pt-BR",
    timezoneId: "America/Sao_Paulo",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "desktop",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 900 } },
    },
    {
      name: "mobile",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true,
      },
    },
  ],
  webServer: [
    {
      command: "node e2e/backend-agenda.mts",
      url: `${backendAgenda}/`,
      reuseExistingServer: !emCi,
      env: { PORTA_BACKEND_AGENDA: String(portaBackendAgenda) },
    },
    {
      command: emCi ? "npm run start" : "npm run dev",
      url: "http://localhost:3001",
      reuseExistingServer: !emCi,
      timeout: 120_000,
      env: { EXIBIR_COMPONENTES: "true", BACKEND_URL: backendAgenda },
    },
  ],
});
