export function caminhoDeConfirmacao(email: string): string {
  return `/confirmar-email?email=${encodeURIComponent(email)}`;
}
