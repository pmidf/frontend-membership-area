export type SituacaoFiliacao =
  "SEM_VINCULO" | "PENDENTE" | "AGUARDANDO_CODIGO" | "APROVADO" | "EXPIRADO";

export type MotivoPendencia = "NAO_LOCALIZADO" | "PMI_INDISPONIVEL";

export type Genero = "FEMININO" | "MASCULINO" | "NAO_BINARIO" | "OUTRO" | "PREFIRO_NAO_INFORMAR";

export type Escolaridade =
  | "ENSINO_FUNDAMENTAL"
  | "ENSINO_MEDIO"
  | "TECNICO"
  | "SUPERIOR_INCOMPLETO"
  | "SUPERIOR_COMPLETO"
  | "ESPECIALIZACAO_MBA"
  | "MESTRADO"
  | "DOUTORADO";

export type SituacaoConta = "ATIVA" | "SUSPENSA";

export type FiliacaoPerfil = {
  situacao: SituacaoFiliacao;
  pmi_id: string | null;
  nome_pmi: string | null;
  capitulo: string | null;
  data_expiracao: string | null;
  motivo_pendencia: MotivoPendencia | null;
  data_ultima_verificacao: string | null;
};

export type Perfil = {
  id_pessoa: string;
  nome_completo: string;
  email: string | null;
  data_nascimento: string;
  genero: Genero;
  escolaridade: Escolaridade;
  telefone: string;
  empresa: string;
  cargo: string;
  linkedin_url: string | null;
  foto_perfil: string | null;
  mini_bio: string | null;
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string | null;
  bairro: string;
  cidade: string;
  uf: string;
  situacao_conta: SituacaoConta;
  bol_voluntario: boolean;
  data_cadastro: string;
  data_ultimo_acesso: string | null;
  papeis: { admin: boolean; filiado: boolean };
  exibindo_na_vitrine: boolean;
  filiacao: FiliacaoPerfil | null;
};
