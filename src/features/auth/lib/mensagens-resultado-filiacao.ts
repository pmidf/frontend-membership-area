import type { Genero } from "@/shared/sessao/tipos";
import type { TomAlerta } from "@/shared/ui";

import type { ResultadoVinculacao } from "../api/auth.api";

export type ApresentacaoResultado = {
  titulo: string;
  descricao: string;
  filiado: boolean;
  tom: TomAlerta;
  alerta?: string;
  detalhe?: string;
  linkFiliacao?: boolean;
};

const CONTA_CRIADA = "Conta criada";
const DESCRICAO_NAO_FILIADO =
  "Sua conta está ativa. Por enquanto, você entra como não filiado e pode acompanhar sua situação a qualquer momento.";

export const apresentacoesResultado: Record<ResultadoVinculacao, ApresentacaoResultado> = {
  APROVADO: {
    titulo: "Filiação confirmada",
    descricao:
      "Seu PMI ID está ativo no PMI-DF e o e-mail do PMI é o mesmo da sua conta. Não precisamos de mais nada.",
    filiado: true,
    tom: "sucesso",
    detalhe:
      "Você já tem acesso ao clube de benefícios, ao conteúdo exclusivo, às oportunidades e às conquistas.",
  },
  NAO_LOCALIZADO: {
    titulo: CONTA_CRIADA,
    descricao: DESCRICAO_NAO_FILIADO,
    filiado: false,
    tom: "alerta",
    alerta: "Não localizamos sua filiação na base do PMI.",
    detalhe: "Se você se filiou recentemente, a atualização pode levar alguns dias.",
  },
  PMI_INDISPONIVEL: {
    titulo: CONTA_CRIADA,
    descricao: DESCRICAO_NAO_FILIADO,
    filiado: false,
    tom: "alerta",
    alerta: "Não conseguimos consultar o PMI agora.",
    detalhe: "Sua filiação será verificada novamente mais tarde.",
  },
  OUTRO_CAPITULO: {
    titulo: CONTA_CRIADA,
    descricao: DESCRICAO_NAO_FILIADO,
    filiado: false,
    tom: "alerta",
    alerta: "Sua filiação ao PMI foi localizada, mas você não é filiado ao capítulo PMI-DF.",
    linkFiliacao: true,
  },
  FILIACAO_INATIVA: {
    titulo: CONTA_CRIADA,
    descricao: DESCRICAO_NAO_FILIADO,
    filiado: false,
    tom: "alerta",
    alerta: "Sua filiação ao PMI-DF está inativa.",
    detalhe: "Renove no PMI; a atualização pode levar alguns dias.",
  },
  DADOS_NAO_CONFEREM: {
    titulo: CONTA_CRIADA,
    descricao: DESCRICAO_NAO_FILIADO,
    filiado: false,
    tom: "erro",
    alerta: "Os dados informados não conferem com o cadastro do PMI.",
    detalhe: "Verifique o PMI ID e o e-mail cadastrado no MyPMI.",
  },
};

const saudacoes: Partial<Record<Genero, string>> = {
  FEMININO: "Bem-vinda",
  MASCULINO: "Bem-vindo",
};

export function saudacao(nomeCompleto: string | undefined, genero: Genero | undefined): string {
  const inicio = (genero && saudacoes[genero]) ?? "Boas-vindas";
  const primeiroNome = nomeCompleto?.trim().split(/\s+/)[0];
  return primeiroNome ? `${inicio}, ${primeiroNome}!` : `${inicio}!`;
}

export const MENSAGEM_BOAS_VINDAS = "E-mail confirmado. Boas-vindas ao PMI-DF!";
