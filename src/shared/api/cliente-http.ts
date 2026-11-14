import { erroDaResposta, erroSemConexao } from "./erro-api";
import { expirarSessao, obterToken, renovarSessao } from "./token-sessao";
import { urlApi } from "./url-api";

type Metodo = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

type ValorConsulta = string | number | boolean | null | undefined;

export type Consulta = Record<string, ValorConsulta | ValorConsulta[]>;

export type OpcoesRequisicao = {
  metodo?: Metodo;
  corpo?: unknown;
  consulta?: Consulta;
  sinal?: AbortSignal;
};

export type RespostaComStatus<T> = { status: number; dados: T };

export function montarUrl(caminho: string, consulta?: Consulta): string {
  const url = new URL(urlApi(caminho));
  Object.entries(consulta ?? {}).forEach(([chave, valor]) => {
    const valores = Array.isArray(valor) ? valor : [valor];
    valores
      .filter((item) => item !== undefined && item !== null && item !== "")
      .forEach((item) => url.searchParams.append(chave, String(item)));
  });
  return url.toString();
}

function montarInit({ metodo = "GET", corpo, sinal }: OpcoesRequisicao): RequestInit {
  const cabecalhos = new Headers();
  const token = obterToken();
  if (token) cabecalhos.set("Authorization", `Bearer ${token}`);
  const ehFormulario = corpo instanceof FormData;
  if (corpo !== undefined && !ehFormulario) cabecalhos.set("Content-Type", "application/json");

  return {
    method: metodo,
    headers: cabecalhos,
    body: corpo === undefined ? undefined : ehFormulario ? corpo : JSON.stringify(corpo),
    credentials: "same-origin",
    signal: sinal,
  };
}

async function enviar(caminho: string, opcoes: OpcoesRequisicao): Promise<Response> {
  try {
    return await fetch(montarUrl(caminho, opcoes.consulta), montarInit(opcoes));
  } catch (erro) {
    if (opcoes.sinal?.aborted) throw erro;
    throw erroSemConexao();
  }
}

async function sessaoRenovada(tokenEnviado: string | null): Promise<boolean> {
  const tokenAtual = obterToken();
  if (tokenAtual && tokenAtual !== tokenEnviado) return true;
  return renovarSessao();
}

export async function buscar(caminho: string, opcoes: OpcoesRequisicao = {}): Promise<Response> {
  const tokenEnviado = obterToken();
  let resposta = await enviar(caminho, opcoes);
  const podeRenovar = resposta.status === 401 && !caminho.startsWith("/auth/");

  if (podeRenovar) {
    if (await sessaoRenovada(tokenEnviado)) {
      resposta = await enviar(caminho, opcoes);
    } else {
      expirarSessao();
    }
  }

  if (!resposta.ok) throw await erroDaResposta(resposta);
  return resposta;
}

async function lerCorpo<T>(resposta: Response): Promise<T> {
  if (resposta.status === 204) return undefined as T;
  const texto = await resposta.text();
  if (!texto) return undefined as T;
  const ehJson = resposta.headers.get("content-type")?.includes("application/json");
  return (ehJson ? JSON.parse(texto) : texto) as T;
}

export async function requisicaoComStatus<T>(
  caminho: string,
  opcoes: OpcoesRequisicao = {},
): Promise<RespostaComStatus<T>> {
  const resposta = await buscar(caminho, opcoes);
  return { status: resposta.status, dados: await lerCorpo<T>(resposta) };
}

export async function requisicao<T>(caminho: string, opcoes: OpcoesRequisicao = {}): Promise<T> {
  return (await requisicaoComStatus<T>(caminho, opcoes)).dados;
}

type OpcoesSemMetodo = Omit<OpcoesRequisicao, "metodo" | "corpo">;

export const api = {
  obter: <T>(caminho: string, opcoes?: OpcoesSemMetodo) => requisicao<T>(caminho, opcoes),
  enviar: <T>(caminho: string, corpo?: unknown, opcoes?: OpcoesSemMetodo) =>
    requisicao<T>(caminho, { ...opcoes, metodo: "POST", corpo }),
  atualizar: <T>(caminho: string, corpo?: unknown, opcoes?: OpcoesSemMetodo) =>
    requisicao<T>(caminho, { ...opcoes, metodo: "PATCH", corpo }),
  substituir: <T>(caminho: string, corpo?: unknown, opcoes?: OpcoesSemMetodo) =>
    requisicao<T>(caminho, { ...opcoes, metodo: "PUT", corpo }),
  remover: <T>(caminho: string, corpo?: unknown, opcoes?: OpcoesSemMetodo) =>
    requisicao<T>(caminho, { ...opcoes, metodo: "DELETE", corpo }),
};
