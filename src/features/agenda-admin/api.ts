// Endpoints do console da agenda no backend (/admin/agenda/...). Só no servidor do Next: dados pessoais.
import "server-only";
import { backendAcao, backendBruto, backendJson } from "@/lib/backend";
import type { Evento } from "@/features/agenda/types";
import type { LinhaNumeros } from "./linhas-numeros";
import type { LinhaParticipante } from "./linhas-participantes";
import type { PeriodoAdmin } from "./periodo";

export type PessoaResumo = {
  id: string;
  nome: string;
  email: string | null;
  pmiId: string | null;
  statusFiliacao: "filiado" | "nao-filiado";
  desde: number;
};

/** Uma inscrição no Sympla é identificada pelo evento e pelo participante. */
export type Inscricao = { eventoId: string; participanteId: string };

export type ItemFila = {
  /** `id` é o id do participante no Sympla. */
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

export type ParticipantesDoEvento = {
  evento: Evento;
  encerrado: boolean;
  participantes: LinhaParticipante[];
  porTipo: { tipo: string; inscritos: number }[];
};

/** "Atualizar agora": o backend descarta o cache e a próxima leitura busca tudo de novo no Sympla. */
export function atualizar(autor: string) {
  return backendAcao("/admin/agenda/atualizar", { method: "POST", autor });
}

export function eventosComNumeros(periodo: PeriodoAdmin) {
  return backendJson<{ linhas: LinhaNumeros[]; categorias: string[] }>(`/admin/agenda/eventos?periodo=${periodo}`);
}

export function participantesDoEvento(id: string) {
  return backendJson<ParticipantesDoEvento>(`/admin/agenda/eventos/${encodeURIComponent(id)}/participantes`);
}

export function conciliacao(periodo: PeriodoAdmin) {
  return backendJson<Conciliacao>(`/admin/agenda/conciliacao?periodo=${periodo}`);
}

export function vincular({ eventoId, participanteId }: Inscricao, pessoaId: string, autor: string) {
  return backendAcao("/admin/agenda/conciliacao/vinculos", {
    method: "POST",
    corpo: { eventoId, participanteId, pessoaId },
    autor,
  });
}

export function marcarNaoMembros(inscricoes: Inscricao[], autor: string) {
  return backendAcao("/admin/agenda/conciliacao/nao-membros", { method: "POST", corpo: { inscricoes }, autor });
}

export function desfazer({ eventoId, participanteId }: Inscricao, autor: string) {
  return backendAcao(
    `/admin/agenda/conciliacao/${encodeURIComponent(eventoId)}/${encodeURIComponent(participanteId)}`,
    { method: "DELETE", autor },
  );
}

/** Exportações CSV: o backend gera o arquivo e registra a auditoria; aqui só repassamos. */
export function exportarCsv(caminho: string, query: URLSearchParams, autor: string) {
  const busca = query.toString();
  return backendBruto(`/admin/agenda/eventos/${caminho}${busca ? `?${busca}` : ""}`, { autor });
}
