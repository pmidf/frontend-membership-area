import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: { tsconfigPaths: true },
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    css: false,
    coverage: {
      provider: "v8",
      include: ["src/**/*.{ts,tsx}"],
      exclude: ["src/app/**", "src/test/**", "src/**/mocks/**", "src/**/*.test.{ts,tsx}"],
      thresholds: { lines: 80, functions: 80, branches: 80, statements: 80 },
    },
  },
});
