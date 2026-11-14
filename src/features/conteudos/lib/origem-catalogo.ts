import { destinoSeguro } from "@/shared/sessao/destino-seguro";

export const CAMINHO_CATALOGO = "/conteudos";

function ehDoCatalogo(caminho: string): boolean {
  return (
    caminho === CAMINHO_CATALOGO ||
    caminho.startsWith(`${CAMINHO_CATALOGO}/`) ||
    caminho.startsWith(`${CAMINHO_CATALOGO}?`)
  );
}

export function destinoDeVolta(origem: string | null): string {
  return origem && ehDoCatalogo(origem) && destinoSeguro(origem) === origem
    ? origem
    : CAMINHO_CATALOGO;
}

export function caminhoDoConteudo(idConteudo: string, origem: string): string {
  return `${CAMINHO_CATALOGO}/${encodeURIComponent(idConteudo)}?${new URLSearchParams({ de: origem })}`;
}
