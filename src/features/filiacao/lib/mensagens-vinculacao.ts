import type { ResultadoVinculacao } from "@/features/auth/api/auth.api";
import { ehErroApi } from "@/shared/api/erro-api";
import { formatarDuracao } from "@/shared/hooks/useContagemRegressiva";
import type { TomAviso } from "@/shared/ui";

export type AvisoVinculacao = { tom: TomAviso; mensagem: string };

export const MENSAGEM_FILIACAO_CONFIRMADA =
  "Filiação confirmada. Seu acesso de filiado está liberado.";

export const MENSAGEM_FILIACAO_EM_DIA = "Sua filiação está em dia. Os dados foram atualizados.";

export const avisosVinculacao: Record<
  Exclude<ResultadoVinculacao, "CODIGO_ENVIADO">,
  AvisoVinculacao
> = {
  APROVADO: { tom: "sucesso", mensagem: MENSAGEM_FILIACAO_CONFIRMADA },
  NAO_LOCALIZADO: {
    tom: "informacao",
    mensagem:
      "Ainda não localizamos sua filiação na base do PMI. Se você se filiou recentemente, a atualização pode levar alguns dias.",
  },
  PMI_INDISPONIVEL: {
    tom: "erro",
    mensagem: "Não conseguimos consultar o PMI agora. Tente de novo em alguns minutos.",
  },
  OUTRO_CAPITULO: {
    tom: "erro",
    mensagem: "Sua filiação ao PMI foi localizada, mas não no capítulo PMI-DF.",
  },
  FILIACAO_INATIVA: {
    tom: "erro",
    mensagem: "Sua filiação ao PMI-DF está inativa. Renove no PMI e tente de novo.",
  },
  DADOS_NAO_CONFEREM: {
    tom: "erro",
    mensagem: "Os dados não conferem com o cadastro do PMI. Confira o PMI ID no MyPMI.",
  },
};

export function segundosDeEspera(erro: unknown, codigo: string): number | null {
  if (!ehErroApi(erro) || erro.codigo !== codigo) return null;
  const { segundos_restantes } = erro.dados as { segundos_restantes?: unknown };
  return typeof segundos_restantes === "number" ? segundos_restantes : null;
}

export function segundosAte(instante: string | null, agora: number): number {
  if (!instante) return 0;
  return Math.max(0, Math.ceil((new Date(instante).getTime() - agora) / 1000));
}

export function mensagemDeEspera(segundos: number): string {
  return `Você pode consultar o PMI de novo em ${formatarDuracao(segundos)}.`;
}
