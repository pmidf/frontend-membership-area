export function montarMailto(email: string, assunto: string): string {
  return `mailto:${email}?subject=${encodeURIComponent(assunto)}`;
}
