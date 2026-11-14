import { urlApi } from "./url-api";

export type SessaoEmitida = { access_token: string; expira_em_segundos: number };

type Ouvintes = {
  aoExpirar?: () => void;
};

const ANTECEDENCIA_RENOVACAO_MS = 60_000;

let tokenAtual: string | null = null;
let temporizadorRenovacao: ReturnType<typeof setTimeout> | undefined;
let renovacaoEmAndamento: Promise<boolean> | null = null;
let ouvintes: Ouvintes = {};

export function obterToken(): string | null {
  return tokenAtual;
}

export function configurarOuvintesSessao(novos: Ouvintes): void {
  ouvintes = novos;
}

function cancelarRenovacaoAgendada(): void {
  clearTimeout(temporizadorRenovacao);
  temporizadorRenovacao = undefined;
}

export function iniciarSessao(sessao: SessaoEmitida): void {
  tokenAtual = sessao.access_token;
  cancelarRenovacaoAgendada();
  const atraso = Math.max(0, sessao.expira_em_segundos * 1000 - ANTECEDENCIA_RENOVACAO_MS);
  temporizadorRenovacao = setTimeout(() => {
    void renovarSessao().then((renovou) => {
      if (!renovou) expirarSessao();
    });
  }, atraso);
}

export function encerrarSessaoLocal(): void {
  tokenAtual = null;
  cancelarRenovacaoAgendada();
}

export function expirarSessao(): void {
  encerrarSessaoLocal();
  ouvintes.aoExpirar?.();
}

async function pedirRenovacao(): Promise<boolean> {
  try {
    const resposta = await fetch(urlApi("/auth/refresh"), {
      method: "POST",
      credentials: "same-origin",
    });
    if (!resposta.ok) return false;
    iniciarSessao((await resposta.json()) as SessaoEmitida);
    return true;
  } catch {
    return false;
  }
}

export function renovarSessao(): Promise<boolean> {
  renovacaoEmAndamento ??= pedirRenovacao().finally(() => {
    renovacaoEmAndamento = null;
  });
  return renovacaoEmAndamento;
}
