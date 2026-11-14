import "@testing-library/jest-dom/vitest";
import "./polyfills";

import { cleanup } from "@testing-library/react";
import { afterAll, afterEach, beforeAll, vi } from "vitest";

import { configurarOuvintesSessao, encerrarSessaoLocal } from "@/shared/api/token-sessao";

import { reiniciarNavegacao } from "./navegacao-falsa";
import { servidor } from "./servidor";

vi.mock("next/navigation", () => import("./navegacao-falsa"));

beforeAll(() => servidor.listen({ onUnhandledFrame: "error" }));

afterEach(() => {
  cleanup();
  servidor.resetHandlers();
  encerrarSessaoLocal();
  configurarOuvintesSessao({});
  reiniciarNavegacao();
});

afterAll(() => servidor.close());
