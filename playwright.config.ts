import { defineConfig, devices } from "@playwright/test";

const emCi = Boolean(process.env.CI);

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: emCi,
  retries: emCi ? 2 : 0,
  reporter: emCi ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: "http://localhost:3001",
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
  webServer: {
    command: emCi ? "npm run start" : "npm run dev",
    url: "http://localhost:3001",
    reuseExistingServer: !emCi,
    timeout: 120_000,
    env: { EXIBIR_COMPONENTES: "true" },
  },
});
