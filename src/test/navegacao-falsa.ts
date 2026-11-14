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
  parametrosRota: {} as Record<string, string>,
};

export function definirNavegacao(
  caminho: string,
  parametros = "",
  parametrosRota: Record<string, string> = {},
): void {
  estadoNavegacao.caminho = caminho;
  estadoNavegacao.parametros = new URLSearchParams(parametros);
  estadoNavegacao.parametrosRota = parametrosRota;
}

export function reiniciarNavegacao(): void {
  definirNavegacao("/");
  Object.values(roteadorFalso).forEach((funcao) => funcao.mockReset());
}

export const useRouter = () => roteadorFalso;
export const usePathname = () => estadoNavegacao.caminho;
export const useSearchParams = () => estadoNavegacao.parametros;
export const useParams = () => estadoNavegacao.parametrosRota;
export const redirect = vi.fn();
export const notFound = vi.fn();
