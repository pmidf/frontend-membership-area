// Acesso aos dados da agenda.
// Com SYMPLA_TOKEN configurado, os dados vêm da API Pública do Sympla, chamada do servidor do Next
// (o token nunca vai para o navegador). Sem o token, usa os dados de exemplo — útil em desenvolvimento.
import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { emailsVerificados, type Usuario } from "@/lib/sessao";
import { EVENTOS_MOCK, PARTICIPACOES_MOCK } from "../data/eventos-mock";
import { jaAconteceu } from "../lib/regras";
import type { Evento, EventoComParticipacao, StatusParticipacao } from "../types";
import { buscarUm, listarTodasAsPaginas, symplaConfigurado } from "./sympla/cliente";
import { paraEvento } from "./sympla/mapeamento";
import type { SymplaEvento, SymplaParticipante } from "./sympla/tipos";

export const TAG_EVENTOS = "agenda-eventos";

/** Quanto do passado buscar, para "Eventos passados" e histórico (RN-05.03.2). */
const MESES_HISTORICO = 12;
/** Chamadas simultâneas ao Sympla na consulta de participações. */
const CONCORRENCIA = 3;

/** "AAAA-MM-DDTHH:mm:ss" no fuso de São Paulo, formato esperado pelo filtro `from`. */
function dataLocalSaoPaulo(data: Date) {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/Sao_Paulo",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(data)
      .map((parte) => [parte.type, parte.value]),
  );
  return `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}:${p.second}`;
}

/** Eventos publicados do PMI-DF desde 12 meses atrás. Atualiza no máximo a cada hora. */
export async function listarEventos(): Promise<Evento[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(TAG_EVENTOS);

  if (!symplaConfigurado()) return EVENTOS_MOCK;

  const desde = new Date();
  desde.setMonth(desde.getMonth() - MESES_HISTORICO);

  const eventos = await listarTodasAsPaginas<SymplaEvento>("/events", {
    published: "true",
    from: dataLocalSaoPaulo(desde),
    field_sort: "start_date",
    sort: "asc",
    page_size: 200,
  });
  return eventos.map(paraEvento);
}

export async function obterEvento(id: string): Promise<Evento | null> {
  "use cache";
  cacheLife("hours");
  cacheTag(TAG_EVENTOS);

  if (!symplaConfigurado()) return EVENTOS_MOCK.find((evento) => evento.id === id) ?? null;

  // O id vem da URL: aceita só o formato de id do Sympla para não montar caminhos arbitrários.
  if (!/^[\w-]{1,64}$/.test(id)) return null;

  // Quase sempre o evento já está na listagem em cache: evita uma chamada ao Sympla por detalhe aberto.
  const daListagem = (await listarEventos()).find((evento) => evento.id === id);
  if (daListagem) return daListagem;
  const evento = await buscarUm<SymplaEvento>(`/events/${id}`);
  // Mesma regra da listagem: só eventos publicados aparecem na plataforma.
  return evento && evento.published === 1 ? paraEvento(evento) : null;
}

export async function listarCategorias(): Promise<string[]> {
  const eventos = await listarEventos();
  return [...new Set(eventos.map((e) => e.categoria))].sort((a, b) => a.localeCompare(b, "pt-BR"));
}

/** Inscrição no Sympla reduzida ao necessário para o status: e-mail e check-in. */
type Inscricao = { email: string; checkIn: boolean };

/** Depois disso, correções de check-in ficam raras: a lista do evento pode ficar um dia em cache. */
const DIAS_ATE_ESTABILIZAR = 7;

/**
 * Inscrições ativas de um evento (ingressos cancelados ficam de fora: `cancelled_filter=none`, o padrão).
 *
 * Uma chamada por evento, compartilhada por todas as pessoas: o custo não cresce com o número de usuários,
 * o que importa porque o Sympla fica atrás de um Cloudflare que bloqueia rajadas de requisições.
 * Os e-mails ficam só no cache do servidor; cada pessoa recebe apenas o próprio status (RN-05.02.1).
 */
async function inscricoesDoEvento(eventoId: string, estabilizado: boolean): Promise<Inscricao[]> {
  "use cache";
  if (estabilizado) cacheLife("days");
  else cacheLife("hours");
  cacheTag(`agenda-participantes-${eventoId}`);

  const participantes = await listarTodasAsPaginas<SymplaParticipante>(`/events/${eventoId}/participants`, {
    fields: "email,checkin",
    page_size: 500,
  });
  return participantes.map((p) => ({
    email: (p.email ?? "").trim().toLowerCase(),
    checkIn: p.checkin?.check_in === true,
  }));
}

function estabilizado(evento: Evento, agora: Date) {
  return new Date(evento.fim).getTime() + DIAS_ATE_ESTABILIZAR * 24 * 60 * 60 * 1000 < agora.getTime();
}

/** Executa as tarefas com no máximo `limite` em paralelo, para não disparar rajadas contra o Sympla. */
async function emLotes<T, R>(itens: T[], limite: number, tarefa: (item: T) => Promise<R>): Promise<R[]> {
  const resultados: R[] = new Array(itens.length);
  let proximo = 0;
  async function trabalhador() {
    while (proximo < itens.length) {
      const indice = proximo++;
      resultados[indice] = await tarefa(itens[indice]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limite, itens.length) }, trabalhador));
  return resultados;
}

/** Inscrito (evento futuro) · Presente (check-in) · Ausente (inscrito, sem check-in, evento encerrado). */
function statusDe(daPessoa: Inscricao[], evento: Evento, agora: Date): StatusParticipacao | null {
  if (daPessoa.some((i) => i.checkIn)) return "presente";
  if (daPessoa.length === 0) return null;
  return jaAconteceu(evento, agora) ? "ausente" : "inscrito";
}

/** Eventos ainda sem a situação da pessoa: usado enquanto as participações carregam. */
export function semParticipacao(eventos: Evento[]): EventoComParticipacao[] {
  return eventos.map((evento) => ({ ...evento, participacao: null }));
}

/**
 * Anexa a participação da pessoa autenticada a cada evento, cruzando os e-mails verificados dela
 * com os participantes do Sympla (RN-05.02.3). Só a própria participação é exposta (RN-05.02.1).
 *
 * Sem cache, custa uma chamada ao Sympla por evento: passe só os eventos que vão para a tela.
 */
export async function comParticipacao(
  eventos: Evento[],
  usuario: Usuario | null,
  agora = new Date(),
): Promise<EventoComParticipacao[]> {
  if (!usuario) return semParticipacao(eventos);

  if (!symplaConfigurado()) {
    return eventos.map((evento) => ({ ...evento, participacao: PARTICIPACOES_MOCK[evento.id] ?? null }));
  }

  const emails = new Set(emailsVerificados(usuario).map((e) => e.endereco.trim().toLowerCase()));
  // Evento cancelado não mostra participação; não vale a consulta. Ids repetidos são consultados uma vez.
  const consultaveis = [...new Map(eventos.filter((e) => !e.cancelado).map((e) => [e.id, e])).values()];

  const inscricoes = await emLotes(consultaveis, CONCORRENCIA, (evento) =>
    // Falha na consulta de um evento não derruba a agenda: o evento só fica sem o status da pessoa.
    inscricoesDoEvento(evento.id, estabilizado(evento, agora)).catch(() => [] as Inscricao[]),
  );

  const porEvento = new Map(
    consultaveis.map((evento, i) => [evento.id, inscricoes[i].filter((inscricao) => emails.has(inscricao.email))]),
  );

  return eventos.map((evento) => ({
    ...evento,
    participacao: statusDe(porEvento.get(evento.id) ?? [], evento, agora),
  }));
}
