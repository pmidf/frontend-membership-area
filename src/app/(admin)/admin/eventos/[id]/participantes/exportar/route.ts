import { connection } from "next/server";
import { autorAuditoria } from "@/lib/sessao";
import { jaAconteceu } from "@/features/agenda/lib/regras";
import { obterEvento } from "@/features/agenda/services/agenda-service";
import { atualizarEstado, registrarAuditoria } from "@/features/agenda-admin/armazenamento";
import { gerarCsv, respostaCsv } from "@/features/agenda-admin/csv";
import { participantesComVinculo } from "@/features/agenda-admin/dados";
import {
  filtrarParticipantes,
  lerFiltrosParticipantes,
  linhasCsvParticipantes,
  montarLinhasParticipantes,
} from "@/features/agenda-admin/linhas-participantes";

// Exportação da lista de participantes (US-05.05), respeitando os filtros. Registrada na auditoria (RN-05.05.5).
// TODO(auth): validar a sessão de Admin aqui também (hoje o acesso é restringido em src/proxy.ts).
export async function GET(request: Request, ctx: RouteContext<"/admin/eventos/[id]/participantes/exportar">) {
  const { id } = await ctx.params;
  await connection();
  const agora = new Date();
  const evento = await obterEvento(id);
  if (!evento) return new Response("Evento não encontrado", { status: 404 });

  const params = new URL(request.url).searchParams;
  const linhas = filtrarParticipantes(
    montarLinhasParticipantes(await participantesComVinculo(evento, agora)),
    lerFiltrosParticipantes(params),
  );

  const por = await autorAuditoria();
  await atualizarEstado((estado) =>
    registrarAuditoria(estado, {
      por,
      acao: "Exportação de participantes (CSV)",
      detalhes: `${evento.titulo} (${evento.id}) · ${linhas.length} participantes · filtros: ${params.toString() || "nenhum"}`,
    }),
  );

  return respostaCsv(gerarCsv(linhasCsvParticipantes(linhas, jaAconteceu(evento, agora))), `participantes-${evento.id}.csv`);
}
