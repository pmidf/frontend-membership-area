import { z } from "zod";

import { MEIOS_CANDIDATURA, MODALIDADES } from "@/features/oportunidades/tipos/oportunidade";
import { hojeNoFuso } from "@/shared/lib/datas";

const DIA = /^\d{4}-\d{2}-\d{2}$/;
const MAXIMO_URL = "Use no máximo 500 caracteres";
const URL_INVALIDA = "Informe uma URL http(s) válida";

export function ehEnderecoHttp(valor: string): boolean {
  try {
    const { protocol, hostname } = new URL(valor);
    return (protocol === "http:" || protocol === "https:") && hostname.includes(".");
  } catch {
    return false;
  }
}

function ehEmail(valor: string): boolean {
  return z.email().safeParse(valor).success;
}

export const esquemaOportunidade = z
  .object({
    titulo: z.string().trim().min(1, "Informe o título").max(150, "Use no máximo 150 caracteres"),
    empresa: z.string().trim().min(1, "Informe a empresa").max(150, "Use no máximo 150 caracteres"),
    descricao: z.string().trim().min(1, "Informe a descrição"),
    meio_candidatura: z.enum(MEIOS_CANDIDATURA, { error: "Escolha um meio de candidatura" }),
    url_candidatura: z.string().trim().max(500, MAXIMO_URL),
    email_recrutador: z.string().trim().max(254, "Use no máximo 254 caracteres"),
    modalidade: z.union([z.literal(""), z.enum(MODALIDADES)]),
    localidade: z.string().trim().max(100, "Use no máximo 100 caracteres"),
    logo_empresa: z
      .string()
      .trim()
      .max(500, MAXIMO_URL)
      .refine((valor) => valor === "" || ehEnderecoHttp(valor), { error: URL_INVALIDA }),
    data_encerramento: z
      .string()
      .refine((valor) => valor === "" || DIA.test(valor), { error: "Informe uma data válida" })
      .refine((valor) => valor === "" || valor >= hojeNoFuso(), {
        error: "A data de encerramento não pode estar no passado",
      }),
  })
  .refine((dados) => dados.meio_candidatura !== "LINK" || dados.url_candidatura.trim() !== "", {
    path: ["url_candidatura"],
    error: "Informe a URL de candidatura",
    when: () => true,
  })
  .refine(
    (dados) =>
      dados.meio_candidatura !== "LINK" ||
      dados.url_candidatura.trim() === "" ||
      ehEnderecoHttp(dados.url_candidatura.trim()),
    { path: ["url_candidatura"], error: URL_INVALIDA, when: () => true },
  )
  .refine((dados) => dados.meio_candidatura !== "EMAIL" || dados.email_recrutador.trim() !== "", {
    path: ["email_recrutador"],
    error: "Informe o e-mail do recrutador",
    when: () => true,
  })
  .refine(
    (dados) =>
      dados.meio_candidatura !== "EMAIL" ||
      dados.email_recrutador.trim() === "" ||
      ehEmail(dados.email_recrutador.trim()),
    { path: ["email_recrutador"], error: "Informe um e-mail válido", when: () => true },
  );

export type DadosOportunidade = z.input<typeof esquemaOportunidade>;
