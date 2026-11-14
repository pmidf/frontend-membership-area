import type { CategoriaConteudo } from "@/features/conteudos/tipos/conteudo";

export type NovaOrdem = Pick<CategoriaConteudo, "cod_categoria" | "ordem">;

export function moverCategoria(
  categorias: CategoriaConteudo[],
  indice: number,
  deslocamento: -1 | 1,
): NovaOrdem[] {
  const destino = indice + deslocamento;
  if (destino < 0 || destino >= categorias.length) return [];
  const reordenadas = [...categorias];
  [reordenadas[indice], reordenadas[destino]] = [reordenadas[destino], reordenadas[indice]];
  return reordenadas
    .map(({ cod_categoria }, posicao) => ({ cod_categoria, ordem: posicao + 1 }))
    .filter(({ cod_categoria, ordem }) =>
      categorias.some((atual) => atual.cod_categoria === cod_categoria && atual.ordem !== ordem),
    );
}

export function ordenarCategorias(
  categorias: CategoriaConteudo[],
  novas: NovaOrdem[],
): CategoriaConteudo[] {
  const ordemNova = new Map(novas.map(({ cod_categoria, ordem }) => [cod_categoria, ordem]));
  return categorias
    .map((categoria) => ({
      ...categoria,
      ordem: ordemNova.get(categoria.cod_categoria) ?? categoria.ordem,
    }))
    .sort((a, b) => a.ordem - b.ordem || a.desc_categoria.localeCompare(b.desc_categoria, "pt-BR"));
}
