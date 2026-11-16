// Sessão do usuário autenticado.
// TODO(auth): a autenticação (ÉP-01) ainda não existe. Até lá, a usuária e o Admin abaixo são de exemplo.

export type StatusFiliacao = "filiado" | "nao-filiado";

export type Usuario = {
  id: string;
  nome: string;
  statusFiliacao: StatusFiliacao;
  filiacaoValidaAte?: string; // "MM/AAAA"
};

const usuarioMock: Usuario = {
  // O backend espera o id_pessoa (UUID) da tabela `pessoa`. Troque por um id real do banco para testar.
  id: "00000000-0000-4000-8000-000000000001",
  nome: "Maria Souza",
  statusFiliacao: "filiado",
  filiacaoValidaAte: "03/2027",
};

/** Retorna o usuário autenticado ou `null` para visitante (a agenda é pública). */
export async function obterUsuarioAtual(): Promise<Usuario | null> {
  // TODO(auth): ler a sessão autenticada.
  return usuarioMock;
}
