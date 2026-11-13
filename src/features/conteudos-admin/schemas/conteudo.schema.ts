import { z } from "zod";

export const ACESSOS = ["EXCLUSIVO", "PUBLICO"] as const;
const MINUTOS = /^\d+$/;

export function ehEnderecoHttp(valor: string): boolean {
  try {
    const { protocol, hostname } = new URL(valor);
    return (protocol === "http:" || protocol === "https:") && hostname.includes(".");
  } catch {
    return false;
  }
}

export const esquemaConteudo = z
  .object({
    titulo: z.string().trim().min(1, "Informe o título").max(150, "Use no máximo 150 caracteres"),
    tipo: z.enum(["VIDEO", "MATERIAL"], { error: "Selecione o tipo" }),
    url: z
      .string()
      .trim()
      .min(1, "Informe a URL")
      .max(500, "Use no máximo 500 caracteres")
      .refine(ehEnderecoHttp, { error: "Informe uma URL http(s) válida" }),
    descricao: z.string().trim().min(1, "Informe a descrição"),
    cod_categoria: z.string().min(1, "Selecione a categoria"),
    acesso: z.enum(ACESSOS),
    duracao_minutos: z.string().trim(),
  })
  .refine(
    ({ tipo, duracao_minutos }) =>
      tipo !== "VIDEO" ||
      duracao_minutos === "" ||
      (MINUTOS.test(duracao_minutos) && Number(duracao_minutos) >= 1),
    { path: ["duracao_minutos"], error: "Informe os minutos como um número inteiro a partir de 1" },
  );

export type DadosConteudo = z.input<typeof esquemaConteudo>;
