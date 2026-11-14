export function paginaDaUrl(valor: string | null): number {
  const pagina = Number(valor);
  return Number.isInteger(pagina) && pagina >= 1 ? pagina : 1;
}
