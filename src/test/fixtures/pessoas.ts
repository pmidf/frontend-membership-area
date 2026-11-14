import type { FiliacaoPerfil, Perfil } from "@/shared/sessao/tipos";

const filiacaoAprovada: FiliacaoPerfil = {
  situacao: "APROVADO",
  pmi_id: "1000001",
  nome_pmi: "Maria Souza",
  capitulo: "C219",
  data_expiracao: "2027-03-31",
  motivo_pendencia: null,
  data_ultima_verificacao: "2026-11-01T11:14:00.000Z",
};

const base: Perfil = {
  id_pessoa: "8b6f4c1e-2a3d-4b5c-9d6e-7f8a9b0c1d2e",
  nome_completo: "Maria Souza",
  email: "maria.souza@teste.pmidf.org.br",
  data_nascimento: "1990-05-12",
  genero: "FEMININO",
  escolaridade: "ESPECIALIZACAO_MBA",
  telefone: "61991234567",
  empresa: "Construtora Vega",
  cargo: "Gerente de Projetos Sênior",
  linkedin_url: "https://linkedin.com/in/mariasouza",
  foto_perfil: null,
  mini_bio: null,
  cep: "70040010",
  logradouro: "SBS Quadra 2, Bloco A",
  numero: "1058",
  complemento: "Sala 1204",
  bairro: "Asa Sul",
  cidade: "Brasília",
  uf: "DF",
  situacao_conta: "ATIVA",
  bol_voluntario: false,
  data_cadastro: "2026-01-10T12:00:00.000Z",
  data_ultimo_acesso: "2026-11-01T11:14:00.000Z",
  papeis: { admin: false, filiado: true },
  exibindo_na_vitrine: false,
  filiacao: filiacaoAprovada,
};

export const perfilFiliado: Perfil = base;

export const perfilNaoFiliado: Perfil = {
  ...base,
  id_pessoa: "1c2d3e4f-5a6b-4c7d-8e9f-0a1b2c3d4e5f",
  nome_completo: "Rafael Souza",
  email: "rafael.souza@teste.pmidf.org.br",
  papeis: { admin: false, filiado: false },
  filiacao: null,
};

export const perfilAdmin: Perfil = {
  ...base,
  id_pessoa: "9a8b7c6d-5e4f-4a3b-8c2d-1e0f9a8b7c6d",
  nome_completo: "Rafael Lima",
  email: "admin@pmidf.org.br",
  papeis: { admin: true, filiado: false },
  filiacao: null,
};

export const perfilPendente: Perfil = {
  ...perfilNaoFiliado,
  filiacao: {
    ...filiacaoAprovada,
    situacao: "PENDENTE",
    pmi_id: "9999999",
    nome_pmi: null,
    capitulo: null,
    data_expiracao: null,
    motivo_pendencia: "NAO_LOCALIZADO",
  },
};

export const perfilIndisponivel: Perfil = {
  ...perfilPendente,
  filiacao: { ...perfilPendente.filiacao!, motivo_pendencia: "PMI_INDISPONIVEL" },
};

export const perfilAguardandoCodigo: Perfil = {
  ...perfilPendente,
  filiacao: {
    ...perfilPendente.filiacao!,
    situacao: "AGUARDANDO_CODIGO",
    motivo_pendencia: null,
  },
};

export const perfilExpirado: Perfil = {
  ...perfilNaoFiliado,
  filiacao: { ...filiacaoAprovada, situacao: "EXPIRADO", data_expiracao: "2026-09-30" },
};

export const perfilAprovadoVencido: Perfil = {
  ...perfilNaoFiliado,
  filiacao: { ...filiacaoAprovada, data_expiracao: "2026-09-30" },
};

export const perfilSemVinculo: Perfil = {
  ...perfilNaoFiliado,
  filiacao: {
    ...filiacaoAprovada,
    situacao: "SEM_VINCULO",
    pmi_id: null,
    nome_pmi: null,
    capitulo: null,
    data_expiracao: null,
    data_ultima_verificacao: null,
  },
};
