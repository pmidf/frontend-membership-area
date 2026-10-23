// Cliente HTTP do backend (backend-membership-area). Roda só no servidor do Next:
// BACKEND_URL não é exposta ao navegador e as rotas com dados pessoais nunca são chamadas do cliente.
import "server-only";

export class ErroBackend extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "ErroBackend";
  }
}

function urlBase() {
  const url = process.env.BACKEND_URL;
  if (!url) throw new ErroBackend("BACKEND_URL não configurada.", 500);
  return url.replace(/\/+$/, "");
}

type Opcoes = {
  method?: "GET" | "POST" | "DELETE";
  corpo?: unknown;
  /** Quem fez a ação, para a auditoria do console. TODO(auth): virá da sessão autenticada. */
  autor?: string;
};

async function requisitar(caminho: string, { method = "GET", corpo, autor }: Opcoes = {}): Promise<Response> {
  const resposta = await fetch(urlBase() + caminho, {
    method,
    cache: "no-store",
    headers: {
      Accept: "application/json",
      ...(corpo !== undefined ? { "Content-Type": "application/json" } : {}),
      ...(autor ? { "X-Admin-Nome": autor } : {}),
    },
    body: corpo !== undefined ? JSON.stringify(corpo) : undefined,
  });
  if (!resposta.ok) throw new ErroBackend(`Backend respondeu ${resposta.status} em ${method} ${caminho}.`, resposta.status);
  return resposta;
}

/** GET/POST com resposta JSON. */
export async function backendJson<T>(caminho: string, opcoes?: Opcoes): Promise<T> {
  return (await requisitar(caminho, opcoes)).json() as Promise<T>;
}

/** Ação sem corpo de resposta (204). */
export async function backendAcao(caminho: string, opcoes: Opcoes): Promise<void> {
  await requisitar(caminho, opcoes);
}

/** Repassa a resposta do backend como está (ex.: download de CSV). */
export function backendBruto(caminho: string, opcoes?: Opcoes): Promise<Response> {
  return requisitar(caminho, opcoes);
}

/** GET que devolve `null` quando o recurso não existe (404). */
export async function backendJsonOuNulo<T>(caminho: string): Promise<T | null> {
  try {
    return await backendJson<T>(caminho);
  } catch (erro) {
    if (erro instanceof ErroBackend && erro.status === 404) return null;
    throw erro;
  }
}
