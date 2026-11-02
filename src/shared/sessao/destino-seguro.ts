export const DESTINO_PADRAO = "/inicio";

export function destinoSeguro(destino: string | null | undefined): string {
  if (!destino || !destino.startsWith("/") || destino.startsWith("//") || destino.includes("\\")) {
    return DESTINO_PADRAO;
  }
  return destino;
}

export function caminhoDeLogin(destinoAtual: string): string {
  return `/login?redirecionar=${encodeURIComponent(destinoAtual)}`;
}

export function destinoDaUrlAtual(): string {
  return destinoSeguro(new URLSearchParams(window.location.search).get("redirecionar"));
}
