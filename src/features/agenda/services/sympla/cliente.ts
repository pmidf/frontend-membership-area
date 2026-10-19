// Cliente HTTP da API Pública do Sympla. Roda só no servidor: o s_token dá acesso de organizador
// (dados pessoais de participantes, pedidos e check-in) e nunca pode chegar ao navegador.
import "server-only";
import type { SymplaPaginaCursor } from "./tipos";

const URL_BASE = "https://api.sympla.com.br/public/v1.6.0";
const FUSO = "America/Sao_Paulo";
const MAX_TENTATIVAS = 3;
const MAX_PAGINAS = 50;

export class ErroSympla extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = "ErroSympla";
  }
}

/** A integração só fica ativa com o token configurado; sem ele a agenda usa dados de exemplo. */
export function symplaConfigurado() {
  return Boolean(process.env.SYMPLA_TOKEN);
}

function token() {
  const valor = process.env.SYMPLA_TOKEN;
  if (!valor) throw new ErroSympla("SYMPLA_TOKEN não configurado.");
  return valor;
}

function esperar(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

type Parametros = Record<string, string | number | undefined>;

/**
 * GET autenticado. Respeita 429 aguardando antes de tentar de novo (RN-05.03.5)
 * e trata 204 (sem conteúdo) e 404 como "nada encontrado".
 */
async function get<T>(caminho: string, parametros: Parametros = {}): Promise<T | null> {
  const url = new URL(URL_BASE + caminho);
  url.searchParams.set("timezone", FUSO);
  for (const [chave, valor] of Object.entries(parametros)) {
    if (valor !== undefined) url.searchParams.set(chave, String(valor));
  }

  for (let tentativa = 1; ; tentativa++) {
    const resposta = await fetch(url, {
      headers: { s_token: token(), Accept: "application/json" },
      cache: "no-store", // o cache fica nas funções com "use cache" do agenda-service
    });

    if (resposta.status === 204 || resposta.status === 404) return null;
    if (resposta.ok) return (await resposta.json()) as T;

    const repetivel = resposta.status === 429 || resposta.status >= 500;
    if (repetivel && tentativa < MAX_TENTATIVAS) {
      const retryAfter = Number(resposta.headers.get("retry-after"));
      await esperar(Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter * 1000 : 1000 * 2 ** tentativa);
      continue;
    }

    // Não incluir a URL completa na mensagem: o e-mail do participante pode estar na query.
    throw new ErroSympla(`Sympla respondeu ${resposta.status} em ${caminho}.`, resposta.status);
  }
}

/** Percorre a paginação por cursor até o fim. */
export async function listarTodasAsPaginas<T>(caminho: string, parametros: Parametros = {}): Promise<T[]> {
  const itens: T[] = [];
  let cursor: string | undefined;
  for (let pagina = 0; pagina < MAX_PAGINAS; pagina++) {
    const resposta = await get<SymplaPaginaCursor<T>>(caminho, { ...parametros, cursor });
    if (!resposta) break;
    itens.push(...resposta.data);
    cursor = resposta.pagination?.next_cursor ?? undefined;
    if (!cursor) break;
  }
  return itens;
}

export async function buscarUm<T>(caminho: string): Promise<T | null> {
  const resposta = await get<T | { data: T }>(caminho);
  if (resposta && typeof resposta === "object" && "data" in resposta) return resposta.data;
  return resposta;
}
