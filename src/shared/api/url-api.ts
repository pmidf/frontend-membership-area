export function urlApi(caminho = ""): string {
  return new URL(`/api${caminho}`, window.location.origin).toString();
}
