import { z } from "zod";

export const TOTAL_RECORTES = 8;
export const TAMANHO_MAXIMO_NOME = 100;
export const TAMANHO_MAXIMO_LEGENDA = 60;
const TAMANHO_MAXIMO_URL = 500;

const EXTENSAO_DE_IMAGEM = /\.(jpe?g|png|webp)(\?[^#]*)?(#.*)?$/i;

function ehEnderecoHttp(valor: string): boolean {
  try {
    const { protocol } = new URL(valor);
    return protocol === "http:" || protocol === "https:";
  } catch {
    return false;
  }
}

export function ehImagemValida(valor: string): boolean {
  return ehEnderecoHttp(valor) && EXTENSAO_DE_IMAGEM.test(valor);
}

function urlDeImagem(vazio: string) {
  return z
    .string()
    .trim()
    .min(1, vazio)
    .max(TAMANHO_MAXIMO_URL, `Use no máximo ${TAMANHO_MAXIMO_URL} caracteres`)
    .refine((valor) => valor === "" || ehEnderecoHttp(valor), {
      error: "Informe uma URL http(s) válida",
    })
    .refine((valor) => !ehEnderecoHttp(valor) || EXTENSAO_DE_IMAGEM.test(valor), {
      error: "A imagem deve ser JPG, PNG ou WebP",
    });
}

export const esquemaQuebraCabeca = z.object({
  nome: z
    .string()
    .trim()
    .min(1, "Informe o nome")
    .max(TAMANHO_MAXIMO_NOME, `Use no máximo ${TAMANHO_MAXIMO_NOME} caracteres`),
  legenda: z
    .string()
    .trim()
    .min(1, "Informe a legenda")
    .max(TAMANHO_MAXIMO_LEGENDA, `Use no máximo ${TAMANHO_MAXIMO_LEGENDA} caracteres`),
  historia: z.string().trim().min(1, "Conte a história por trás da imagem"),
  imagem_original: urlDeImagem("Informe a URL da imagem completa"),
  recortes: z
    .array(urlDeImagem("Informe a URL desta peça"))
    .length(TOTAL_RECORTES, `Informe as ${TOTAL_RECORTES} peças`),
});

export type DadosQuebraCabeca = z.input<typeof esquemaQuebraCabeca>;
export type QuebraCabecaValidado = z.output<typeof esquemaQuebraCabeca>;

export const valoresIniciais: DadosQuebraCabeca = {
  nome: "",
  legenda: "",
  historia: "",
  imagem_original: "",
  recortes: Array.from({ length: TOTAL_RECORTES }, () => ""),
};
