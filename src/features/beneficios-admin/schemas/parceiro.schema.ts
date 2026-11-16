import { z } from "zod";

import type { CriarParceiro } from "../api/beneficios-admin.api";
import { ehEnderecoHttp } from "./beneficio.schema";

export const TAMANHO_MAXIMO_NOME_PARCEIRO = 150;

export const esquemaNovoParceiro = z.object({
  nome: z
    .string()
    .trim()
    .min(1, "Informe o nome do parceiro")
    .max(TAMANHO_MAXIMO_NOME_PARCEIRO, `Use no máximo ${TAMANHO_MAXIMO_NOME_PARCEIRO} caracteres`),
  descricao: z.string().trim(),
  site_url: z
    .string()
    .trim()
    .max(500, "Use no máximo 500 caracteres")
    .refine((valor) => valor === "" || ehEnderecoHttp(valor), {
      error: "Informe uma URL http(s) válida",
    }),
});

export type DadosNovoParceiro = z.input<typeof esquemaNovoParceiro>;

export const VALORES_NOVO_PARCEIRO: DadosNovoParceiro = { nome: "", descricao: "", site_url: "" };

export function dadosParaCriarParceiro(dados: z.output<typeof esquemaNovoParceiro>): CriarParceiro {
  return {
    nome: dados.nome,
    ...(dados.descricao && { descricao: dados.descricao }),
    ...(dados.site_url && { site_url: dados.site_url }),
  };
}
