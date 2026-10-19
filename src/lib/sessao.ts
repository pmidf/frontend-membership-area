// Sessão do usuário autenticado.
// TODO: substituir pelo usuário vindo da autenticação (ÉP-01) quando o backend estiver disponível.

export type StatusFiliacao = "filiado" | "nao-filiado";

export type EmailUsuario = {
  endereco: string;
  tipo: "principal" | "alternativo";
  verificado: boolean;
};

export type Usuario = {
  id: string;
  nome: string;
  statusFiliacao: StatusFiliacao;
  filiacaoValidaAte?: string; // "MM/AAAA"
  emails: EmailUsuario[];
};

const usuarioMock: Usuario = {
  id: "usr-001",
  nome: "Maria Souza",
  statusFiliacao: "filiado",
  filiacaoValidaAte: "03/2027",
  emails: [
    { endereco: "maria.souza@email.com", tipo: "principal", verificado: true },
    { endereco: "maria.s@empresa.com.br", tipo: "alternativo", verificado: true },
  ],
};

/** Retorna o usuário autenticado ou `null` para visitante (a agenda é pública). */
export async function obterUsuarioAtual(): Promise<Usuario | null> {
  return usuarioMock;
}

/** E-mails que permitem vincular a participação no Sympla (RN-05.02.3: só verificados). */
export function emailsVerificados(usuario: Usuario): EmailUsuario[] {
  return usuario.emails.filter((email) => email.verificado);
}

export function iniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/);
  const primeira = partes[0]?.[0] ?? "";
  const ultima = partes.length > 1 ? partes[partes.length - 1][0] : "";
  return (primeira + ultima).toUpperCase();
}
