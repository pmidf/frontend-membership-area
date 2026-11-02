import { z } from "zod";

export const TAMANHO_MINIMO_SENHA = 10;
export const TAMANHO_MAXIMO_SENHA = 128;

const limiteMaximo = `Use no máximo ${TAMANHO_MAXIMO_SENHA} caracteres`;

export const esquemaSenhaNova = z
  .string()
  .min(TAMANHO_MINIMO_SENHA, `Use pelo menos ${TAMANHO_MINIMO_SENHA} caracteres`)
  .max(TAMANHO_MAXIMO_SENHA, limiteMaximo);

export function esquemaSenhaInformada(mensagem: string) {
  return z.string().min(1, mensagem).max(TAMANHO_MAXIMO_SENHA, limiteMaximo);
}
