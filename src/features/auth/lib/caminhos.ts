export type OrigemConfirmacao = "login";

export function caminhoDeConfirmacao(email: string, origem?: OrigemConfirmacao): string {
  const parametros = new URLSearchParams({ email });
  if (origem) parametros.set("origem", origem);
  return `/confirmar-email?${parametros.toString()}`;
}
