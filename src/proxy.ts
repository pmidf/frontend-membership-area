import { NextResponse } from "next/server";

/**
 * Guarda do console administrativo (/admin): páginas, exportações CSV e server actions passam por aqui.
 *
 * TODO(auth): quando a autenticação existir, verificar aqui a sessão e o papel de Admin
 * (toda verificação de permissão ocorre no servidor — regra transversal do ÉP-05).
 *
 * Até lá, o console expõe dados pessoais de participantes sem login. Por isso fica liberado em
 * desenvolvimento e, em produção, só com ADMIN_HABILITADO=true.
 */
export function proxy() {
  const liberado = process.env.NODE_ENV !== "production" || process.env.ADMIN_HABILITADO === "true";
  if (!liberado) {
    return new NextResponse("Não encontrado", { status: 404 });
  }
  const resposta = NextResponse.next();
  // Console não deve ser indexado nem guardado em cache compartilhado.
  resposta.headers.set("X-Robots-Tag", "noindex, nofollow");
  resposta.headers.set("Cache-Control", "private, no-store");
  return resposta;
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
