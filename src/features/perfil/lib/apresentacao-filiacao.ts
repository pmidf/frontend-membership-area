import { formatarDataCivil, formatarDataHoraOuHoje } from "@/shared/lib/datas";
import type { FiliacaoPerfil, MotivoPendencia } from "@/shared/sessao/tipos";
import type { Tom } from "@/shared/ui";

export type DadoFiliacao = { rotulo: string; valor: string };

export type ApresentacaoFiliacao = {
  rotuloSelo: string;
  tom: Tom;
  mensagem: string | null;
  pmiId: string | null;
  dados: DadoFiliacao[];
  mostrarRenovacao: boolean;
};

const SEM_VALOR = "—";

const NAO_VINCULADO: ApresentacaoFiliacao = {
  rotuloSelo: "Não vinculado",
  tom: "neutro",
  mensagem: "Você ainda não tem uma filiação reconhecida pelo PMI-DF.",
  pmiId: null,
  dados: [],
  mostrarRenovacao: false,
};

function dadoVerificacao(filiacao: FiliacaoPerfil, agora: Date): DadoFiliacao {
  const { data_ultima_verificacao: instante } = filiacao;
  return {
    rotulo: "Última verificação",
    valor: instante ? formatarDataHoraOuHoje(instante, agora) : SEM_VALOR,
  };
}

function aprovada(filiacao: FiliacaoPerfil, agora: Date): ApresentacaoFiliacao {
  const { data_expiracao: expiracao } = filiacao;
  return {
    rotuloSelo: "Filiado PMI-DF",
    tom: "aqua",
    mensagem: null,
    pmiId: filiacao.pmi_id,
    dados: [
      {
        rotulo: "Filiação válida até",
        valor: expiracao ? formatarDataCivil(expiracao) : SEM_VALOR,
      },
      dadoVerificacao(filiacao, agora),
    ],
    mostrarRenovacao: false,
  };
}

function vencida({ data_expiracao: expiracao }: FiliacaoPerfil): ApresentacaoFiliacao {
  return {
    rotuloSelo: expiracao
      ? `Filiação vencida em ${formatarDataCivil(expiracao)}`
      : "Filiação vencida",
    tom: "erro",
    mensagem:
      "Seu acesso exclusivo foi suspenso. Renove sua filiação no PMI para recuperar o acesso.",
    pmiId: null,
    dados: [],
    mostrarRenovacao: true,
  };
}

function pendente(filiacao: FiliacaoPerfil, agora: Date): ApresentacaoFiliacao {
  if (filiacao.motivo_pendencia === "NAO_LOCALIZADO") {
    return {
      rotuloSelo: "Aguardando localização na base do PMI",
      tom: "alerta",
      mensagem:
        "Ainda não localizamos sua filiação na base do PMI. Se você se filiou recentemente, a atualização pode levar alguns dias.",
      pmiId: filiacao.pmi_id,
      dados: [dadoVerificacao(filiacao, agora)],
      mostrarRenovacao: false,
    };
  }
  return {
    rotuloSelo: "Aguardando verificação",
    tom: "alerta",
    mensagem:
      filiacao.motivo_pendencia === "PMI_INDISPONIVEL"
        ? "Não conseguimos consultar o PMI na última tentativa. Sua filiação será verificada novamente no seu próximo acesso."
        : "Sua filiação será verificada novamente no seu próximo acesso.",
    pmiId: null,
    dados: [],
    mostrarRenovacao: false,
  };
}

export function apresentarFiliacao(
  filiacao: FiliacaoPerfil | null,
  filiado: boolean,
  agora: Date = new Date(),
): ApresentacaoFiliacao {
  if (!filiacao) return NAO_VINCULADO;

  switch (filiacao.situacao) {
    case "APROVADO":
      return filiado ? aprovada(filiacao, agora) : vencida(filiacao);
    case "EXPIRADO":
      return vencida(filiacao);
    case "PENDENTE":
      return pendente(filiacao, agora);
    case "AGUARDANDO_CODIGO":
      return {
        rotuloSelo: "Aguardando confirmação",
        tom: "neutro",
        mensagem: "Sua filiação aguarda uma confirmação adicional.",
        pmiId: null,
        dados: [],
        mostrarRenovacao: false,
      };
    case "SEM_VINCULO":
      return NAO_VINCULADO;
  }
}

const rotulosMotivoPendencia: Record<MotivoPendencia, string> = {
  NAO_LOCALIZADO: "Não localizado na base do PMI",
  PMI_INDISPONIVEL: "PMI indisponível na última consulta",
};

export function apresentarFiliacaoParaAdmin(
  filiacao: FiliacaoPerfil | null,
  filiado: boolean,
  agora: Date = new Date(),
): ApresentacaoFiliacao {
  const apresentacao = apresentarFiliacao(filiacao, filiado, agora);
  if (!filiacao || filiacao.situacao === "SEM_VINCULO") {
    return { ...apresentacao, mensagem: null };
  }
  const { capitulo, data_expiracao: expiracao, motivo_pendencia: motivo } = filiacao;
  return {
    ...apresentacao,
    mensagem: null,
    mostrarRenovacao: false,
    pmiId: filiacao.pmi_id,
    dados: [
      { rotulo: "Capítulo", valor: capitulo ?? SEM_VALOR },
      { rotulo: "Validade", valor: expiracao ? formatarDataCivil(expiracao) : SEM_VALOR },
      ...(motivo ? [{ rotulo: "Motivo da pendência", valor: rotulosMotivoPendencia[motivo] }] : []),
      dadoVerificacao(filiacao, agora),
    ],
  };
}
