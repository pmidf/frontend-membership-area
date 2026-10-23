import { gerarIcs } from "@/features/agenda/lib/ics";
import { obterEvento } from "@/features/agenda/services/agenda-service";

// "Adicionar ao meu calendário" (US-05.01 c6): devolve o .ics do evento.
export async function GET(_request: Request, ctx: RouteContext<"/api/agenda/[id]/ics">) {
  const { id } = await ctx.params;
  const evento = await obterEvento(id);
  if (!evento) {
    return new Response("Evento não encontrado", { status: 404 });
  }

  return new Response(gerarIcs(evento), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="evento-${evento.id}.ics"`,
    },
  });
}
