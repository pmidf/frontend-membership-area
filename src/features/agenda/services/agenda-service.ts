// Acesso aos dados da agenda. Os dados vêm da API Pública do Sympla, chamada do servidor do Next:
// o SYMPLA_TOKEN é obrigatório e nunca vai para o navegador.
import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { emailsVerificados, type Usuario } from "@/lib/sessao";
import { vinculosManuaisDe } from "@/features/agenda-admin/armazenamento";
import { jaAconteceu } from "../lib/regras";
import type { Evento, EventoComParticipacao, ParticipanteEvento, StatusParticipacao } from "../types";
import { emLotes, estabilizado, listarParticipantes } from "./participantes";
import { buscarUm, listarTodasAsPaginas } from "./sympla/cliente";
import { paraEvento } from "./sympla/mapeamento";
import type { SymplaEvento } from "./sympla/tipos";

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

  return buscarEventosNoSympla();
}

/**
 * Consulta direta ao Sympla, sem cache. Usada pela sincronização manual, que só invalida o cache
 * depois de conseguir os dados novos (US-05.03: falha no Sympla não apaga nem altera o que existe).
 */
export async function buscarEventosNoSympla(): Promise<Evento[]> {
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

/** Inscrito (evento futuro) · Presente (check-in) · Ausente (inscrito, sem check-in, evento encerrado). */
function statusDe(daPessoa: ParticipanteEvento[], evento: Evento, agora: Date): StatusParticipacao | null {
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

  const emails = new Set(emailsVerificados(usuario).map((e) => e.endereco.trim().toLowerCase()));
  // Evento cancelado não mostra participação; não vale a consulta. Ids repetidos são consultados uma vez.
  const consultaveis = [...new Map(eventos.filter((e) => !e.cancelado).map((e) => [e.id, e])).values()];

  const [participantes, manuais] = await Promise.all([
    emLotes(consultaveis, CONCORRENCIA, (evento) =>
      // Falha na consulta de um evento não derruba a agenda: o evento só fica sem o status da pessoa.
      listarParticipantes(evento.id, "ativos", estabilizado(evento, agora)).catch(() => [] as ParticipanteEvento[]),
    ),
    // Vínculos feitos pelo Admin na conciliação também contam (US-05.06).
    vinculosManuaisDe(usuario.id).catch(() => new Set<string>()),
  ]);

  // Só a própria participação sai daqui (RN-05.02.1): os demais participantes ficam no servidor.
  const daPessoa = (p: ParticipanteEvento) => emails.has(p.email) || manuais.has(`${p.eventoId}:${p.id}`);
  const porEvento = new Map(consultaveis.map((evento, i) => [evento.id, participantes[i].filter(daPessoa)]));

  return eventos.map((evento) => ({
    ...evento,
    participacao: statusDe(porEvento.get(evento.id) ?? [], evento, agora),
  }));
}
