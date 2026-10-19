// Dados de exemplo enquanto a API da plataforma (sincronizada com o Sympla) não está disponível.
// Conteúdo baseado no protótipo de alta fidelidade (Figma · ÉP-05).
import type { Evento, StatusParticipacao } from "../types";

const IMPACT_HUB = {
  nome: "Impact Hub Brasília",
  logradouro: "SGAN 601 Módulo N",
  bairro: "Asa Norte",
  cidade: "Brasília",
  uf: "DF",
};

export const EVENTOS_MOCK: Evento[] = [
  {
    id: "3184201",
    titulo: "PMI-DF Summit 2026",
    descricao:
      "O maior encontro anual do capítulo reúne profissionais de gerenciamento de projetos do Distrito Federal para um dia de trilhas simultâneas, estudos de caso do setor público e networking. A edição de 2026 tem foco em inteligência artificial aplicada à gestão de projetos e em liderança em ambientes regulados.",
    inicio: "2026-11-29T08:30:00-03:00",
    fim: "2026-11-29T18:00:00-03:00",
    urlSympla: "https://www.sympla.com.br/evento/pmi-df-summit-2026/3184201",
    endereco: IMPACT_HUB,
    categoria: "Congresso",
    cancelado: false,
  },
  {
    id: "3184188",
    titulo: "Webinar: o fator humano nos projetos",
    descricao:
      "Conversa sobre comunicação, engajamento de stakeholders e gestão de conflitos em equipes de projeto, com espaço para perguntas ao vivo.",
    inicio: "2026-11-26T19:00:00-03:00",
    fim: "2026-11-26T20:30:00-03:00",
    urlSympla: "https://www.sympla.com.br/evento-online/webinar-o-fator-humano-nos-projetos/3184188",
    endereco: null,
    categoria: "Webinar",
    cancelado: false,
  },
  {
    id: "3184150",
    titulo: "Meetup: métricas ágeis na prática",
    descricao: "Encontro presencial para troca de experiências sobre métricas de fluxo, previsibilidade e OKRs.",
    inicio: "2026-10-29T19:00:00-03:00",
    fim: "2026-10-29T21:00:00-03:00",
    urlSympla: "https://www.sympla.com.br/evento/meetup-metricas-ageis/3184150",
    endereco: IMPACT_HUB,
    categoria: "Networking",
    cancelado: false,
  },
  {
    id: "3184230",
    titulo: "Workshop: preparação para o PMP",
    descricao:
      "Dia inteiro de revisão dos domínios do exame PMP, com simulado comentado e dicas de estudo de quem já foi aprovado.",
    inicio: "2026-12-18T09:00:00-03:00",
    fim: "2026-12-18T17:00:00-03:00",
    urlSympla: "https://www.sympla.com.br/evento-online/workshop-preparacao-pmp/3184230",
    endereco: null,
    categoria: "Workshop",
    cancelado: false,
  },
  {
    id: "3184299",
    titulo: "Café com projetos: carreira em gestão pública",
    descricao: "Bate-papo matinal com gestores de projetos do setor público sobre carreira, concursos e transição.",
    inicio: "2027-01-21T08:30:00-03:00",
    fim: "2027-01-21T10:00:00-03:00",
    urlSympla: "https://www.sympla.com.br/evento/cafe-com-projetos-gestao-publica/3184299",
    endereco: IMPACT_HUB,
    categoria: "Networking",
    cancelado: false,
  },
  {
    id: "3184102",
    titulo: "Palestra: riscos em contratações públicas",
    descricao: "Palestra sobre gestão de riscos aplicada à nova lei de licitações.",
    inicio: "2026-10-14T19:00:00-03:00",
    fim: "2026-10-14T21:00:00-03:00",
    urlSympla: "https://www.sympla.com.br/evento/palestra-riscos-contratacoes/3184102",
    endereco: IMPACT_HUB,
    categoria: "Palestra",
    cancelado: true,
  },
  {
    id: "2950011",
    titulo: "PMI-DF Summit 2025",
    descricao: "Edição 2025 do encontro anual do capítulo.",
    inicio: "2025-11-14T08:30:00-03:00",
    fim: "2025-11-14T18:00:00-03:00",
    urlSympla: "https://www.sympla.com.br/evento/pmi-df-summit-2025/2950011",
    endereco: IMPACT_HUB,
    categoria: "Congresso",
    cancelado: false,
  },
  {
    id: "3120044",
    titulo: "Webinar: liderança em projetos públicos",
    descricao: "Webinar sobre liderança situacional em projetos de governo.",
    inicio: "2026-09-22T19:00:00-03:00",
    fim: "2026-09-22T20:30:00-03:00",
    urlSympla: "https://www.sympla.com.br/evento-online/webinar-lideranca-projetos-publicos/3120044",
    endereco: null,
    categoria: "Webinar",
    cancelado: false,
  },
  {
    id: "3098870",
    titulo: "Workshop de preparação PMP",
    descricao: "Edição de agosto do workshop de preparação para o exame PMP.",
    inicio: "2026-08-05T09:00:00-03:00",
    fim: "2026-08-05T17:00:00-03:00",
    urlSympla: "https://www.sympla.com.br/evento-online/workshop-preparacao-pmp-agosto/3098870",
    endereco: null,
    categoria: "Workshop",
    cancelado: false,
  },
];

/** Participações do usuário de exemplo, vinculadas por e-mail verificado (US-05.04). */
export const PARTICIPACOES_MOCK: Record<string, StatusParticipacao> = {
  "3184188": "inscrito",
  "2950011": "presente",
  "3120044": "presente",
  "3098870": "ausente",
};
