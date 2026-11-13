import { api } from "@/shared/api/cliente-http";
import type { Pagina } from "@/shared/api/tipos";

import type {
  AtualizarConteudo,
  ConsultaConteudosAdmin,
  ConteudoAdmin,
  CriarConteudo,
  PreviaYoutube,
} from "../tipos/conteudo-admin";

const CAMINHO = "/admin/conteudos";
const caminhoConteudo = (id: string) => `${CAMINHO}/${encodeURIComponent(id)}`;

export function listarConteudosAdmin(
  consulta: ConsultaConteudosAdmin = {},
): Promise<Pagina<ConteudoAdmin>> {
  return api.obter<Pagina<ConteudoAdmin>>(CAMINHO, { consulta });
}

export function detalharConteudoAdmin(id: string): Promise<ConteudoAdmin> {
  return api.obter<ConteudoAdmin>(caminhoConteudo(id));
}

export function criarConteudo(dados: CriarConteudo): Promise<ConteudoAdmin> {
  return api.enviar<ConteudoAdmin>(CAMINHO, dados);
}

export function atualizarConteudo(id: string, dados: AtualizarConteudo): Promise<ConteudoAdmin> {
  return api.atualizar<ConteudoAdmin>(caminhoConteudo(id), dados);
}

export function publicarConteudo(id: string): Promise<ConteudoAdmin> {
  return api.enviar<ConteudoAdmin>(`${caminhoConteudo(id)}/publicar`);
}

export function arquivarConteudo(id: string): Promise<void> {
  return api.remover<void>(caminhoConteudo(id));
}

export function previaYoutube(url: string): Promise<PreviaYoutube> {
  return api.enviar<PreviaYoutube>(`${CAMINHO}/youtube/preview`, { url });
}
