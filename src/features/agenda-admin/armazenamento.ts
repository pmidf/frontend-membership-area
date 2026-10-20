// Armazenamento local do console da agenda, enquanto não há backend: um arquivo JSON no servidor do Next.
// Guarda o que o Sympla não tem — log de sincronizações, conciliações e auditoria.
//
// Limitações: só funciona com um servidor persistente (next start / container com volume).
// Em ambiente serverless o arquivo não persiste entre execuções. Não é compartilhado entre instâncias.
import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";

export type TipoExecucao = "eventos" | "participantes";

export type Execucao = {
  id: string;
  inicio: string;
  duracaoMs: number;
  tipo: TipoExecucao;
  lidos: number;
  /** Eventos: criados + atualizados + cancelados. Participantes: inscrições novas ou com check-in alterado. */
  novosOuAlterados: number;
  detalhe?: { criados: number; atualizados: number; cancelados: number };
  erros: number;
  mensagemErro?: string;
  status: "concluida" | "falhou";
};

export type Resolucao =
  | { tipo: "vinculo"; pessoaId: string; em: string; por: string }
  | { tipo: "nao-membro"; em: string; por: string };

export type RegistroAuditoria = {
  em: string;
  por: string;
  acao: string;
  detalhes: string;
};

export type EstadoAgendaAdmin = {
  execucoes: Execucao[];
  /** Conciliação manual, por chave `${eventoId}:${participanteId}` (RN-05.06.2: um vínculo por participação). */
  resolucoes: Record<string, Resolucao>;
  auditoria: RegistroAuditoria[];
  /** Última versão conhecida de cada evento, para contar criados/atualizados/cancelados. */
  snapshotEventos: Record<string, string>;
  /** Por evento: participante → teve check-in (1) ou não (0). */
  snapshotParticipantes: Record<string, Record<string, 0 | 1>>;
};

const MAX_EXECUCOES = 50;
const MAX_AUDITORIA = 2000;

const ARQUIVO = process.env.AGENDA_ADMIN_ARQUIVO ?? path.join(process.cwd(), "data", "agenda-admin.json");

function vazio(): EstadoAgendaAdmin {
  return { execucoes: [], resolucoes: {}, auditoria: [], snapshotEventos: {}, snapshotParticipantes: {} };
}

export async function lerEstado(): Promise<EstadoAgendaAdmin> {
  try {
    return { ...vazio(), ...JSON.parse(await fs.readFile(ARQUIVO, "utf8")) };
  } catch (erro) {
    if ((erro as NodeJS.ErrnoException).code === "ENOENT") return vazio();
    throw erro;
  }
}

// Escritas em série dentro do processo, para duas ações simultâneas não se sobrescreverem.
let filaEscrita: Promise<unknown> = Promise.resolve();

export function atualizarEstado<T>(alterar: (estado: EstadoAgendaAdmin) => T): Promise<T> {
  const tarefa = filaEscrita.then(async () => {
    const estado = await lerEstado();
    const resultado = alterar(estado);
    estado.execucoes = estado.execucoes.slice(0, MAX_EXECUCOES);
    estado.auditoria = estado.auditoria.slice(0, MAX_AUDITORIA);
    await fs.mkdir(path.dirname(ARQUIVO), { recursive: true });
    // Grava num arquivo temporário e renomeia: um processo interrompido não deixa o JSON pela metade.
    const temporario = `${ARQUIVO}.${process.pid}.tmp`;
    await fs.writeFile(temporario, JSON.stringify(estado, null, 2), "utf8");
    await fs.rename(temporario, ARQUIVO);
    return resultado;
  });
  filaEscrita = tarefa.catch(() => undefined);
  return tarefa;
}

/** Participações vinculadas manualmente a uma pessoa (chaves `${eventoId}:${participanteId}`). */
export async function vinculosManuaisDe(pessoaId: string): Promise<Set<string>> {
  const { resolucoes } = await lerEstado();
  return new Set(
    Object.entries(resolucoes)
      .filter(([, r]) => r.tipo === "vinculo" && r.pessoaId === pessoaId)
      .map(([chave]) => chave),
  );
}

/** Registra uma ação sensível na auditoria (RN-05.05.5: exportações sempre registradas). */
export function registrarAuditoria(estado: EstadoAgendaAdmin, registro: Omit<RegistroAuditoria, "em">) {
  estado.auditoria.unshift({ em: new Date().toISOString(), ...registro });
}
