// "Sincronizar agora" (US-05.03 e US-05.04). Sem backend não há agendador: a atualização automática é o
// cache de 1 hora. Esta rotina força a atualização e registra o resultado no log de execuções.
import "server-only";
import { updateTag } from "next/cache";
import { buscarEventosNoSympla, TAG_EVENTOS } from "@/features/agenda/services/agenda-service";
import {
  buscarParticipantesNoSympla,
  emLotes,
  estabilizado,
  tagParticipantes,
} from "@/features/agenda/services/participantes";
import type { Evento } from "@/features/agenda/types";
import { atualizarEstado, registrarAuditoria, type Execucao } from "./armazenamento";

function assinatura(evento: Evento) {
  const { titulo, descricao, inicio, fim, imagemUrl, endereco, categoria, cancelado, urlSympla } = evento;
  return JSON.stringify([titulo, descricao, inicio, fim, imagemUrl, endereco, categoria, cancelado, urlSympla]);
}

function mensagem(erro: unknown) {
  return erro instanceof Error ? erro.message : "Erro desconhecido";
}

/**
 * Busca no Sympla primeiro e só então invalida o cache: se o Sympla falhar,
 * nenhum evento existente é apagado ou alterado (US-05.03).
 */
export async function executarSincronizacao(por: string): Promise<Execucao[]> {
  const agora = new Date();
  const execucoes: Execucao[] = [];

  // 1. Eventos
  const inicioEventos = Date.now();
  let eventos: Evento[] | null = null;
  try {
    eventos = await buscarEventosNoSympla();
    const novos = eventos;
    const detalhe = await atualizarEstado((estado) => {
      const anterior = estado.snapshotEventos;
      let criados = 0;
      let atualizados = 0;
      let cancelados = 0;
      const atual: Record<string, string> = {};
      for (const evento of novos) {
        atual[evento.id] = assinatura(evento);
        const antes = anterior[evento.id];
        if (!antes) criados++;
        else if (antes !== atual[evento.id]) {
          const eraCancelado = JSON.parse(antes)[7] === true;
          if (evento.cancelado && !eraCancelado) cancelados++;
          else atualizados++;
        }
      }
      // Evento despublicado some da API: conta como cancelado (RN-05.03.4 — nunca excluído do histórico).
      for (const id of Object.keys(anterior)) {
        if (!atual[id] && JSON.parse(anterior[id])[7] !== true) cancelados++;
      }
      estado.snapshotEventos = { ...anterior, ...atual };
      return { criados, atualizados, cancelados };
    });
    updateTag(TAG_EVENTOS);
    execucoes.push({
      id: crypto.randomUUID(),
      inicio: new Date(inicioEventos).toISOString(),
      duracaoMs: Date.now() - inicioEventos,
      tipo: "eventos",
      lidos: novos.length,
      novosOuAlterados: detalhe.criados + detalhe.atualizados + detalhe.cancelados,
      detalhe,
      erros: 0,
      status: "concluida",
    });
  } catch (erro) {
    execucoes.push({
      id: crypto.randomUUID(),
      inicio: new Date(inicioEventos).toISOString(),
      duracaoMs: Date.now() - inicioEventos,
      tipo: "eventos",
      lidos: 0,
      novosOuAlterados: 0,
      erros: 1,
      mensagemErro: mensagem(erro),
      status: "falhou",
    });
  }

  // 2. Participantes dos eventos em andamento ou recentes (janela da RN-05.04.1).
  if (eventos) {
    const inicioParticipantes = Date.now();
    const janela = eventos.filter((e) => !e.cancelado && !estabilizado(e, agora));
    const resultados = await emLotes(janela, 3, async (evento) => {
      try {
        const participantes = await buscarParticipantesNoSympla(evento.id, "ativos");
        return { evento, participantes, erro: null };
      } catch (erro) {
        return { evento, participantes: null, erro: mensagem(erro) };
      }
    });

    const ok = resultados.filter((r) => r.participantes !== null);
    const falhas = resultados.filter((r) => r.participantes === null);
    const alterados = await atualizarEstado((estado) => {
      let total = 0;
      for (const { evento, participantes } of ok) {
        const antes = estado.snapshotParticipantes[evento.id] ?? {};
        const depois: Record<string, 0 | 1> = {};
        for (const p of participantes!) {
          depois[p.id] = p.checkIn ? 1 : 0;
          if (antes[p.id] !== depois[p.id]) total++;
        }
        estado.snapshotParticipantes[evento.id] = depois;
      }
      return total;
    });
    for (const { evento } of ok) updateTag(tagParticipantes(evento.id));

    execucoes.push({
      id: crypto.randomUUID(),
      inicio: new Date(inicioParticipantes).toISOString(),
      duracaoMs: Date.now() - inicioParticipantes,
      tipo: "participantes",
      lidos: ok.reduce((soma, r) => soma + r.participantes!.length, 0),
      novosOuAlterados: alterados,
      erros: falhas.length,
      mensagemErro: falhas[0]?.erro ?? undefined,
      status: falhas.length > 0 && ok.length === 0 ? "falhou" : "concluida",
    });
  }

  await atualizarEstado((estado) => {
    estado.execucoes.unshift(...[...execucoes].reverse());
    registrarAuditoria(estado, {
      por,
      acao: "Sincronização manual com o Sympla",
      detalhes: execucoes.map((e) => `${e.tipo}: ${e.status}, ${e.lidos} lidos, ${e.erros} erros`).join("; "),
    });
  });
  return execucoes;
}
