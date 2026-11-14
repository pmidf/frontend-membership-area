import type { CategoriaConteudo } from "@/features/conteudos/tipos/conteudo";
import { api } from "@/shared/api/cliente-http";

const CAMINHO = "/admin/conteudo-categorias";

export type AtualizarCategoria = Partial<Pick<CategoriaConteudo, "desc_categoria" | "ordem">>;

export function criarCategoria(desc_categoria: string): Promise<CategoriaConteudo> {
  return api.enviar<CategoriaConteudo>(CAMINHO, { desc_categoria });
}

export function atualizarCategoria(
  cod_categoria: string,
  dados: AtualizarCategoria,
): Promise<CategoriaConteudo> {
  return api.atualizar<CategoriaConteudo>(`${CAMINHO}/${encodeURIComponent(cod_categoria)}`, dados);
}
