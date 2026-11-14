import { api } from "@/shared/api/cliente-http";
import { baixarArquivo } from "@/shared/api/baixar-arquivo";

import type {
  AcessosConteudo,
  EstatisticasConteudo,
  PeriodoEstatisticas,
} from "../tipos/conteudo-admin";

const caminhoConteudo = (id: string) => `/admin/conteudos/${encodeURIComponent(id)}`;

export function obterEstatisticas(
  id: string,
  periodo: PeriodoEstatisticas,
): Promise<EstatisticasConteudo> {
  return api.obter<EstatisticasConteudo>(`${caminhoConteudo(id)}/estatisticas`, {
    consulta: periodo,
  });
}

export function listarAcessos(id: string, pagina: number): Promise<AcessosConteudo> {
  return api.obter<AcessosConteudo>(`${caminhoConteudo(id)}/acessos`, {
    consulta: pagina > 1 ? { page: pagina } : {},
  });
}

export function exportarAcessos(id: string): Promise<string> {
  return baixarArquivo(`${caminhoConteudo(id)}/acessos/export.csv`, `acessos-${id}.csv`);
}
