import { connection } from "next/server";
import { autorAuditoria } from "@/lib/sessao";
import { atualizarEstado, registrarAuditoria } from "@/features/agenda-admin/armazenamento";
import { gerarCsv, respostaCsv } from "@/features/agenda-admin/csv";
import { eventosDoPeriodo, lerPeriodoAdmin, numerosDosEventos } from "@/features/agenda-admin/dados";
import { filtrarLinhas, lerFiltrosNumeros, linhasCsvNumeros, montarLinhas } from "@/features/agenda-admin/linhas-numeros";

// Exportação dos números (US-05.05), respeitando filtros e seleção. Fica registrada na auditoria (RN-05.05.5).
// TODO(auth): validar a sessão de Admin aqui também (hoje o acesso é restringido em src/proxy.ts).
export async function GET(request: Request) {
  await connection();
  const agora = new Date();
  const params = new URL(request.url).searchParams;
  const periodo = lerPeriodoAdmin(params.get("periodo") ?? undefined);
  const ids = new Set((params.get("ids") ?? "").split(",").filter(Boolean));

  const eventos = await eventosDoPeriodo(periodo, agora);
  const linhas = filtrarLinhas(montarLinhas(eventos, await numerosDosEventos(eventos, agora)), lerFiltrosNumeros(params))
    .filter((l) => ids.size === 0 || ids.has(l.id))
    .sort((a, b) => new Date(b.inicio).getTime() - new Date(a.inicio).getTime());

  const por = await autorAuditoria();
  await atualizarEstado((estado) =>
    registrarAuditoria(estado, {
      por,
      acao: "Exportação de números dos eventos (CSV)",
      detalhes: `${linhas.length} eventos · filtros: ${params.toString() || "nenhum"}`,
    }),
  );

  const data = agora.toISOString().slice(0, 10);
  return respostaCsv(gerarCsv(linhasCsvNumeros(linhas)), `eventos-numeros-${data}.csv`);
}
