// Sessão do usuário autenticado.
// TODO(auth): a autenticação (ÉP-01) ainda não existe. Até lá, a usuária e o Admin abaixo são de exemplo.

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
  // TODO(auth): ler a sessão autenticada.
  return usuarioMock;
}

export type Admin = { nome: string; papel: string };

/** Admin do console. TODO(auth): virá da sessão autenticada, com o papel validado no servidor. */
export async function obterAdminAtual(): Promise<Admin> {
  return { nome: "Rafael Lima", papel: "Super admin" };
}

/** Quem fez a ação, para a auditoria do console (marcado enquanto não há autenticação). */
export async function autorAuditoria(): Promise<string> {
  const admin = await obterAdminAtual();
  return `${admin.nome} (sem autenticação)`;
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
