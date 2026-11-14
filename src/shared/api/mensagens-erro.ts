import { ehErroApi } from "./erro-api";

export const MENSAGEM_GENERICA = "Não foi possível concluir a ação. Tente novamente.";

const mensagens: Record<string, string> = {
  CREDENCIAIS_INVALIDAS: "E-mail ou senha inválidos.",
  CONTA_SUSPENSA: "Sua conta está suspensa. Fale com a diretoria do PMI-DF para mais informações.",
  EMAIL_NAO_CONFIRMADO: "Confirme seu e-mail para continuar.",
  SENHA_ATUAL_INCORRETA: "A senha atual está incorreta.",
  SENHA_INCORRETA: "Senha incorreta.",
  CODIGO_INVALIDO: "Código incorreto. Confira e tente novamente.",
  CODIGO_EXPIRADO: "Este código expirou ou foi invalidado. Peça um novo código.",
  AGUARDE_PARA_REENVIAR: "Aguarde um pouco antes de pedir um novo código.",
  TOKEN_INVALIDO: "Este link expirou ou já foi usado. Peça um novo.",
  DADOS_INVALIDOS: "Confira os campos destacados.",
  FILIACAO_NECESSARIA: "Este recurso é exclusivo para filiados com filiação ativa.",
  ADMIN_NECESSARIO: "Você não tem permissão para acessar o console administrativo.",
  NOME_DEFINIDO_PELO_PMI: "O nome vem da base do PMI e não pode ser alterado aqui.",
  AUTOSSUSPENSAO: "Você não pode suspender a própria conta.",
  ULTIMO_ADMIN: "Esta é a única conta de administrador ativa.",
  CONTA_COM_PUBLICACOES:
    "Esta conta publicou conteúdos ou vagas e não pode ser excluída. Fale com outro administrador.",
  BENEFICIO_NAO_ENCONTRADO: "Este benefício não está mais disponível.",
  BENEFICIO_NAO_PUBLICADO: "Só benefícios publicados podem ser despublicados.",
  BENEFICIO_JA_PUBLICADO: "Este benefício já está publicado.",
  BENEFICIO_ARQUIVADO: "Este benefício foi arquivado e não pode ser alterado.",
  BENEFICIO_NAO_ARQUIVADO: "Só é possível duplicar um benefício arquivado.",
  TIPO_BLOQUEADO: "Já houve resgates: a forma de resgate não pode mais mudar.",
  OPORTUNIDADE_NAO_ENCONTRADA: "Vaga não encontrada.",
  OPORTUNIDADE_NAO_PUBLICADA: "Só vagas publicadas podem ser encerradas.",
  OPORTUNIDADE_NAO_E_RASCUNHO: "Só rascunhos podem ser publicados.",
  OPORTUNIDADE_ENCERRADA: "Esta vaga foi encerrada.",
  PROFISSIONAL_NAO_ENCONTRADO: "Profissional não encontrado ou fora da vitrine.",
  QUEBRA_CABECA_NAO_ENCONTRADO: "Quebra-cabeça não encontrado.",
  QUEBRA_CABECA_EM_ANDAMENTO: "Você já tem um quebra-cabeça em andamento.",
  QUEBRA_CABECA_FORA_DO_AR: "Este quebra-cabeça está fora do ar.",
  SEM_QUEBRA_CABECA_EM_ANDAMENTO: "Sorteie um quebra-cabeça antes de sortear peças.",
  SEM_CREDITOS: "Você não tem créditos. Participe de um evento para ganhar mais.",
  CATALOGO_VAZIO: "Ainda não há quebra-cabeças publicados.",
  COLECAO_COMPLETA: "Você completou todos os quebra-cabeças disponíveis.",
  IMAGEM_BLOQUEADA: "A imagem não pode mais mudar: filiados já começaram a montar.",
  TRANSICAO_INVALIDA: "A situação mudou. Atualize a página e tente de novo.",
  MUITAS_REQUISICOES: "Muitas tentativas em pouco tempo. Aguarde e tente novamente.",
  SEM_CONEXAO: "Não foi possível conectar ao servidor. Verifique sua conexão.",
};

export function mensagemDeErro(erro: unknown): string {
  if (!ehErroApi(erro)) return MENSAGEM_GENERICA;
  return mensagens[erro.codigo] ?? MENSAGEM_GENERICA;
}
