import { TAMANHO_MINIMO_SENHA } from "./regras-senha";

export type ForcaSenha = "fraca" | "media" | "forte";

const TAMANHO_SENHA_FORTE = 12;

const tiposDeCaractere = [/[a-z]/, /[A-Z]/, /\d/, /[^a-zA-Z\d]/];

export function classificarForcaSenha(senha: string): ForcaSenha | null {
  if (!senha) return null;
  if (senha.length < TAMANHO_MINIMO_SENHA) return "fraca";
  const variedade = tiposDeCaractere.filter((tipo) => tipo.test(senha)).length;
  if (senha.length >= TAMANHO_SENHA_FORTE && variedade >= 3) return "forte";
  return variedade >= 2 ? "media" : "fraca";
}
