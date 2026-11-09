import { z } from "zod";

import { CATEGORIAS_BENEFICIO } from "@/features/beneficios/tipos/beneficio";

import { TIPOS_RESGATE } from "../tipos/beneficio-admin";

const EXTENSAO_DE_IMAGEM = /\.(jpe?g|png|webp)(\?[^#]*)?(#.*)?$/i;
const DIA = /^\d{4}-\d{2}-\d{2}$/;

export const TAMANHO_MAXIMO_LEGENDA = 90;

function ehEnderecoHttp(valor: string): boolean {
  try {
    const { protocol, hostname } = new URL(valor);
    return (protocol === "http:" || protocol === "https:") && hostname.includes(".");
  } catch {
    return false;
  }
}

export function ehImagemValida(valor: string): boolean {
  return ehEnderecoHttp(valor) && EXTENSAO_DE_IMAGEM.test(valor);
}

function temTexto(html: string): boolean {
  return html.replace(/<[^>]*>/g, "").trim() !== "";
}

export const esquemaBeneficio = z
  .object({
    titulo: z.string().trim().min(1, "Informe o título").max(150, "Use no máximo 150 caracteres"),
    legenda: z
      .string()
      .trim()
      .min(1, "Informe a legenda")
      .max(TAMANHO_MAXIMO_LEGENDA, `Use no máximo ${TAMANHO_MAXIMO_LEGENDA} caracteres`),
    descricao: z.string().trim().min(1, "Informe a descrição"),
    imagem: z
      .string()
      .trim()
      .max(500, "Use no máximo 500 caracteres")
      .refine(ehEnderecoHttp, { error: "Informe uma URL http(s) válida" })
      .refine((valor) => !ehEnderecoHttp(valor) || EXTENSAO_DE_IMAGEM.test(valor), {
        error: "A imagem deve ser JPG, PNG ou WebP",
      }),
    categoria: z.enum(CATEGORIAS_BENEFICIO, { error: "Selecione a categoria" }),
    tipo_resgate: z.enum(TIPOS_RESGATE, { error: "Selecione a forma de resgate" }),
    cod_cupom: z.string().trim().max(100, "Use no máximo 100 caracteres"),
    desc_instrucao: z.string(),
    vigencia_inicio: z.string().regex(DIA, "Informe o início da vigência"),
    vigencia_fim: z.string(),
  })
  .refine((dados) => dados.tipo_resgate !== "CUPOM" || dados.cod_cupom?.trim() !== "", {
    path: ["cod_cupom"],
    error: "Informe o código do cupom",
    when: () => true,
  })
  .refine((dados) => dados.tipo_resgate !== "INSTRUCAO" || temTexto(dados.desc_instrucao ?? ""), {
    path: ["desc_instrucao"],
    error: "Informe a instrução de resgate",
    when: () => true,
  })
  .refine((dados) => !dados.vigencia_fim || dados.vigencia_fim >= dados.vigencia_inicio, {
    path: ["vigencia_fim"],
    error: "O fim da vigência não pode ser anterior ao início",
    when: () => true,
  });

export type DadosBeneficio = z.input<typeof esquemaBeneficio>;
