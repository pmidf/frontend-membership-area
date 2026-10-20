// Base de pessoas cadastradas na plataforma (ÉP-02).
// TODO: a base ainda não existe. Até lá a lista é vazia: nenhuma participação é vinculada a uma conta
// e a conciliação só permite marcar "não é membro".

export type Pessoa = {
  id: string;
  nome: string;
  statusFiliacao: "filiado" | "nao-filiado";
  pmiId?: string;
  /** Ano de cadastro, para contextualizar as sugestões da conciliação. */
  desde: number;
  /** Só e-mails verificados vinculam participação automaticamente (RN-05.04.2). */
  emailsVerificados: string[];
};

export async function listarPessoas(): Promise<Pessoa[]> {
  return [];
}
