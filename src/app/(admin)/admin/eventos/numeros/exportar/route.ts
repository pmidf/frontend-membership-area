import { connection } from "next/server";
import { obterAdminAtual } from "@/lib/sessao";
import { exportarCsv } from "@/features/agenda-admin/api";

// Exportação dos números (US-05.05). O backend aplica filtros e seleção, gera o CSV e registra a auditoria
// (RN-05.05.5); aqui a resposta só é repassada. TODO(auth): validar a sessão de Admin.
export async function GET(request: Request) {
  await connection();
  const query = new URL(request.url).searchParams;
  const resposta = await exportarCsv("numeros.csv", query, (await obterAdminAtual()).nome);
  return new Response(resposta.body, {
    headers: {
      "Content-Type": resposta.headers.get("content-type") ?? "text/csv; charset=utf-8",
      "Content-Disposition": resposta.headers.get("content-disposition") ?? 'attachment; filename="eventos-numeros.csv"',
      "Cache-Control": "private, no-store",
    },
  });
}
