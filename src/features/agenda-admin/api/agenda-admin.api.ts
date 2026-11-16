import { baixarArquivo } from "@/shared/api/baixar-arquivo";
import { api } from "@/shared/api/cliente-http";
import type { Evento } from "@/features/agenda/types";

import type { LinhaNumeros } from "../linhas-numeros";
import type { LinhaParticipante } from "../linhas-participantes";
import type { PeriodoAdmin } from "../periodo";

export type PessoaResumo = {
  id: string;
  nome: string;
  email: string | null;
  pmiId: string | null;
  statusFiliacao: "filiado" | "nao-filiado";
  desde: number;
};

export type Inscricao = { eventoId: string; participanteId: string };

export type ItemFila = {
  participacao: { id: string; eventoId: string; nome: string; email: string; checkIn: boolean };
  evento: { id: string; titulo: string; inicio: string };
  sugestoes: { pessoa: PessoaResumo; similaridade: number }[];
};

export type Resolvida = {
  participacao: { id: string; nome: string; email: string; eventoId: string };
  evento: { id: string; titulo: string };
  tipo: "vinculo" | "nao-membro";
  pessoa: { id: string; nome: string } | null;
  por: string;
  em: string;
};

export type Conciliacao = {
  total: number;
  fila: ItemFila[];
  resolvidas: Resolvida[];
  pessoas: PessoaResumo[];
};

export type EventosComNumeros = { linhas: LinhaNumeros[]; categorias: string[] };

export type ParticipantesDoEvento = {
  evento: Evento;
  encerrado: boolean;
  participantes: LinhaParticipante[];
  porTipo: { tipo: string; inscritos: number }[];
};

export type FiltrosExportacaoNumeros = {
  periodo: PeriodoAdmin;
  q?: string;
  situacao?: string;
  formato?: string;
  categoria?: string;
  ids?: string;
};

export type FiltrosExportacaoParticipantes = {
  q?: string;
  checkin?: string;
  tipo?: string;
  vinculo?: string;
};

const evento = (id: string) => `/admin/agenda/eventos/${encodeURIComponent(id)}`;

export function atualizarAgenda(): Promise<void> {
  return api.enviar<void>("/admin/agenda/atualizar");
}

export function listarEventosComNumeros(periodo: PeriodoAdmin): Promise<EventosComNumeros> {
  return api.obter<EventosComNumeros>("/admin/agenda/eventos", { consulta: { periodo } });
}

export function obterParticipantesDoEvento(id: string): Promise<ParticipantesDoEvento> {
  return api.obter<ParticipantesDoEvento>(`${evento(id)}/participantes`);
}

export function obterConciliacao(periodo: PeriodoAdmin): Promise<Conciliacao> {
  return api.obter<Conciliacao>("/admin/agenda/conciliacao", { consulta: { periodo } });
}

export function vincularParticipacao({
  eventoId,
  participanteId,
  pessoaId,
}: Inscricao & { pessoaId: string }): Promise<void> {
  return api.enviar<void>("/admin/agenda/conciliacao/vinculos", {
    eventoId,
    participanteId,
    pessoaId,
  });
}

export function marcarNaoMembros(inscricoes: Inscricao[]): Promise<void> {
  return api.enviar<void>("/admin/agenda/conciliacao/nao-membros", { inscricoes });
}

export function desfazerResolucao({ eventoId, participanteId }: Inscricao): Promise<void> {
  return api.remover<void>(
    `/admin/agenda/conciliacao/${encodeURIComponent(eventoId)}/${encodeURIComponent(participanteId)}`,
  );
}

export function exportarNumeros(filtros: FiltrosExportacaoNumeros): Promise<string> {
  return baixarArquivo("/admin/agenda/eventos/numeros.csv", "eventos-numeros.csv", filtros);
}

export function exportarParticipantes(
  id: string,
  filtros: FiltrosExportacaoParticipantes,
): Promise<string> {
  return baixarArquivo(`${evento(id)}/participantes.csv`, `participantes-${id}.csv`, filtros);
}
