const PONTUACAO_FINAL = /[.,;:!?)\]>"']+$/;

export function normalizarToken(token: string | null): string {
  return (token ?? "").trim().replace(PONTUACAO_FINAL, "");
}
