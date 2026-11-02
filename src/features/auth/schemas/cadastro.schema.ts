import { z } from "zod";

import { somenteDigitos } from "@/shared/lib/mascaras";
import type { Escolaridade, Genero } from "@/shared/sessao/tipos";

import { rotulosEscolaridade, rotulosGenero, UFS } from "../lib/opcoes-cadastro";
import { esquemaSenhaNova } from "./senha.schema";

export const IDADE_MINIMA = 18;
export const FORMATO_PMI_ID = /^\d{1,20}$/;

const DATA_ISO = /^\d{4}-\d{2}-\d{2}$/;

export function idadeEmAnos(nascimento: string, hoje: Date): number {
  const data = new Date(`${nascimento}T00:00:00.000Z`);
  const anos = hoje.getUTCFullYear() - data.getUTCFullYear();
  const aniversarioJaPassou =
    hoje.getUTCMonth() > data.getUTCMonth() ||
    (hoje.getUTCMonth() === data.getUTCMonth() && hoje.getUTCDate() >= data.getUTCDate());
  return aniversarioJaPassou ? anos : anos - 1;
}

function textoObrigatorio(mensagem: string, maximo: number) {
  return z.string().trim().min(1, mensagem).max(maximo, `Use no máximo ${maximo} caracteres`);
}

const opcional = (maximo: number) =>
  z.string().trim().max(maximo, `Use no máximo ${maximo} caracteres`);

const valoresGenero = Object.keys(rotulosGenero) as [Genero, ...Genero[]];
const valoresEscolaridade = Object.keys(rotulosEscolaridade) as [Escolaridade, ...Escolaridade[]];

export const esquemaCadastro = z
  .object({
    nome_completo: z
      .string()
      .trim()
      .min(3, "Informe seu nome completo")
      .max(150, "Use no máximo 150 caracteres"),
    filiado_pmi: z.enum(["sim", "nao"], { error: "Responda se você já é filiado ao PMI" }),
    pmi_id: z.string().trim(),
    email: z
      .string()
      .trim()
      .min(1, "Informe seu e-mail")
      .max(254, "Use no máximo 254 caracteres")
      .pipe(z.email("Informe um e-mail válido")),
    senha: esquemaSenhaNova,
    aceite_termos: z.boolean().refine((aceite) => aceite, {
      error: "É preciso aceitar os Termos de Uso e a Política de Privacidade",
    }),
    telefone: z.string().refine((valor) => /^\d{10,11}$/.test(somenteDigitos(valor)), {
      error: "Informe o telefone com DDD",
    }),
    data_nascimento: z
      .string()
      .regex(DATA_ISO, "Informe sua data de nascimento")
      .refine((valor) => !DATA_ISO.test(valor) || idadeEmAnos(valor, new Date()) >= IDADE_MINIMA, {
        error: `É preciso ter ${IDADE_MINIMA} anos ou mais para criar conta`,
      }),
    genero: z.enum(valoresGenero, { error: "Selecione uma opção" }),
    escolaridade: z.enum(valoresEscolaridade, { error: "Selecione sua escolaridade" }),
    cep: z
      .string()
      .refine((valor) => /^\d{8}$/.test(somenteDigitos(valor)), { error: "Informe um CEP válido" }),
    logradouro: textoObrigatorio("Informe o logradouro", 200),
    numero: textoObrigatorio("Informe o número", 10),
    complemento: opcional(100),
    bairro: textoObrigatorio("Informe o bairro", 100),
    cidade: textoObrigatorio("Informe a cidade", 100),
    uf: z.enum(UFS, { error: "Selecione a UF" }),
    empresa: textoObrigatorio("Informe a empresa onde trabalha", 150),
    cargo: textoObrigatorio("Informe seu cargo", 150),
    linkedin_url: opcional(255).refine(
      (valor) => !valor || (valor.startsWith("https://") && /linkedin\.com\//i.test(valor)),
      { error: "Use o endereço completo do seu perfil (https://linkedin.com/in/...)" },
    ),
  })
  .refine((dados) => dados.filiado_pmi !== "sim" || FORMATO_PMI_ID.test(dados.pmi_id ?? ""), {
    path: ["pmi_id"],
    error: "Informe seu PMI ID (só números)",
    when: () => true,
  });

export type DadosCadastro = z.input<typeof esquemaCadastro>;
export type CampoCadastro = keyof DadosCadastro;

export const camposPorPasso = [
  ["nome_completo", "filiado_pmi", "pmi_id", "email", "senha", "aceite_termos"],
  ["telefone", "data_nascimento", "genero", "escolaridade"],
  ["cep", "logradouro", "numero", "complemento", "bairro", "cidade", "uf"],
  ["empresa", "cargo", "linkedin_url"],
] as const satisfies readonly (readonly CampoCadastro[])[];

export function passoDoCampo(campo: string): number {
  const indice = camposPorPasso.findIndex((campos) =>
    (campos as readonly string[]).includes(campo),
  );
  return indice === -1 ? camposPorPasso.length - 1 : indice;
}

export const valoresIniciaisCadastro: DadosCadastro = {
  nome_completo: "",
  filiado_pmi: "" as DadosCadastro["filiado_pmi"],
  pmi_id: "",
  email: "",
  senha: "",
  aceite_termos: false,
  telefone: "",
  data_nascimento: "",
  genero: "" as DadosCadastro["genero"],
  escolaridade: "" as DadosCadastro["escolaridade"],
  cep: "",
  logradouro: "",
  numero: "",
  complemento: "",
  bairro: "",
  cidade: "",
  uf: "" as DadosCadastro["uf"],
  empresa: "",
  cargo: "",
  linkedin_url: "",
};
