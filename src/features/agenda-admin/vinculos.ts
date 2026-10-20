// Vínculo entre participações do Sympla e pessoas da plataforma (US-05.04 e US-05.06).
import type { Pessoa } from "@/lib/pessoas";
import type { ParticipanteEvento } from "@/features/agenda/types";
import type { Resolucao } from "./armazenamento";

export type Vinculo =
  | { tipo: "pessoa"; pessoa: Pessoa; origem: "automatico" | "manual" }
  | { tipo: "nao-membro" }
  | { tipo: "nao-vinculado" };

export function chaveParticipacao(p: Pick<ParticipanteEvento, "eventoId" | "id">) {
  return `${p.eventoId}:${p.id}`;
}

export type BaseVinculos = {
  pessoasPorId: Map<string, Pessoa>;
  pessoasPorEmail: Map<string, Pessoa>;
  resolucoes: Record<string, Resolucao>;
};

export function montarBase(pessoas: Pessoa[], resolucoes: Record<string, Resolucao>): BaseVinculos {
  const pessoasPorEmail = new Map<string, Pessoa>();
  for (const pessoa of pessoas) {
    for (const email of pessoa.emailsVerificados) pessoasPorEmail.set(email.trim().toLowerCase(), pessoa);
  }
  return { pessoasPorId: new Map(pessoas.map((p) => [p.id, p])), pessoasPorEmail, resolucoes };
}

/**
 * A decisão manual do Admin prevalece; sem ela, vincula pelo e-mail verificado (RN-05.04.2).
 * O vínculo manual não cadastra o e-mail do Sympla como alternativo da pessoa (RN-05.06.1).
 */
export function resolverVinculo(p: ParticipanteEvento, base: BaseVinculos): Vinculo {
  const resolucao = base.resolucoes[chaveParticipacao(p)];
  if (resolucao?.tipo === "nao-membro") return { tipo: "nao-membro" };
  if (resolucao?.tipo === "vinculo") {
    const pessoa = base.pessoasPorId.get(resolucao.pessoaId);
    if (pessoa) return { tipo: "pessoa", pessoa, origem: "manual" };
  }
  const pessoa = base.pessoasPorEmail.get(p.email);
  return pessoa ? { tipo: "pessoa", pessoa, origem: "automatico" } : { tipo: "nao-vinculado" };
}

export function rotuloVinculo(vinculo: Vinculo) {
  if (vinculo.tipo === "pessoa") return vinculo.pessoa.nome;
  return vinculo.tipo === "nao-membro" ? "Não é membro" : "Não vinculado";
}

function normalizar(nome: string) {
  return nome
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function bigramas(texto: string) {
  const resultado = new Map<string, number>();
  const compacto = ` ${texto} `;
  for (let i = 0; i < compacto.length - 1; i++) {
    const par = compacto.slice(i, i + 2);
    resultado.set(par, (resultado.get(par) ?? 0) + 1);
  }
  return resultado;
}

/** Coeficiente de Dice sobre bigramas do nome normalizado: 0 (nada a ver) a 1 (igual). */
export function similaridade(a: string, b: string) {
  const x = bigramas(normalizar(a));
  const y = bigramas(normalizar(b));
  let comuns = 0;
  let total = 0;
  for (const [par, n] of x) {
    comuns += Math.min(n, y.get(par) ?? 0);
    total += n;
  }
  for (const n of y.values()) total += n;
  return total === 0 ? 0 : (2 * comuns) / total;
}

/** Sugestões abaixo deste valor não são exibidas (protótipo: "abaixo do limiar de 0,40"). */
export const LIMIAR_SUGESTAO = 0.4;

export type Sugestao = { pessoa: Pessoa; similaridade: number };

export function sugerirPessoas(nome: string, pessoas: Pessoa[], limite = 3): Sugestao[] {
  return pessoas
    .map((pessoa) => ({ pessoa, similaridade: similaridade(nome, pessoa.nome) }))
    .filter((s) => s.similaridade >= LIMIAR_SUGESTAO)
    .sort((a, b) => b.similaridade - a.similaridade)
    .slice(0, limite);
}

export function formatarSimilaridade(valor: number) {
  return valor.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
