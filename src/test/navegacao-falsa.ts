import { vi } from "vitest";

export const roteadorFalso = {
  push: vi.fn(),
  replace: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  refresh: vi.fn(),
  prefetch: vi.fn(),
};

export const estadoNavegacao = {
  caminho: "/",
  parametros: new URLSearchParams(),
};

export function definirNavegacao(caminho: string, parametros = ""): void {
  estadoNavegacao.caminho = caminho;
  estadoNavegacao.parametros = new URLSearchParams(parametros);
}

export function reiniciarNavegacao(): void {
  definirNavegacao("/");
  Object.values(roteadorFalso).forEach((funcao) => funcao.mockReset());
}

export const useRouter = () => roteadorFalso;
export const usePathname = () => estadoNavegacao.caminho;
export const useSearchParams = () => estadoNavegacao.parametros;
export const redirect = vi.fn();
export const notFound = vi.fn();
