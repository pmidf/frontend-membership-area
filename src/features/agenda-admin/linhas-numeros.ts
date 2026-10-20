// Linhas da visão analítica (US-05.05), em formato serializável: usadas pela tabela no navegador
// e pela exportação CSV no servidor, com os mesmos filtros.
import { formatoDoEvento, rotuloFormato } from "@/features/agenda/lib/regras";
import { formatarDataCurta } from "@/features/agenda/lib/datas";
import type { Evento, FormatoEvento } from "@/features/agenda/types";
import { agregar, formatarTaxa, type NumerosEvento, type SituacaoEvento } from "./numeros";

export type LinhaNumeros = {
  id: string;
  titulo: string;
  inicio: string;
  formato: FormatoEvento;
  categoria: string;
  situacao: SituacaoEvento;
  inscritos: number;
  presentes: number;
  ausentes: number;
  cancelados: number;
  taxa: number | null;
  indisponivel: boolean;
};

export type FiltrosNumeros = {
  busca?: string;
  situacao?: SituacaoEvento;
  formato?: FormatoEvento;
  categoria?: string;
};

export function montarLinhas(eventos: Evento[], numeros: Map<string, NumerosEvento>): LinhaNumeros[] {
  return eventos.map((evento) => {
    const n = numeros.get(evento.id);
    return {
      id: evento.id,
      titulo: evento.titulo,
      inicio: evento.inicio,
      formato: formatoDoEvento(evento),
      categoria: evento.categoria,
      situacao: n?.situacao ?? "inativo",
      inscritos: n?.inscritos ?? 0,
      presentes: n?.presentes ?? 0,
      ausentes: n?.ausentes ?? 0,
      cancelados: n?.cancelados ?? 0,
      taxa: n?.taxa ?? null,
      indisponivel: !n || Boolean(n.indisponivel),
    };
  });
}

function normalizar(texto: string) {
  return texto
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

export function filtrarLinhas(linhas: LinhaNumeros[], filtros: FiltrosNumeros) {
  const busca = filtros.busca ? normalizar(filtros.busca) : "";
  return linhas.filter(
    (l) =>
      (!busca || normalizar(l.titulo).includes(busca)) &&
      (!filtros.situacao || l.situacao === filtros.situacao) &&
      (!filtros.formato || l.formato === filtros.formato) &&
      (!filtros.categoria || l.categoria === filtros.categoria),
  );
}

export function lerFiltrosNumeros(params: URLSearchParams): FiltrosNumeros {
  const situacao = params.get("situacao");
  const formato = params.get("formato");
  return {
    busca: params.get("q") || undefined,
    situacao: situacao === "ativo" || situacao === "inativo" ? situacao : undefined,
    formato: formato === "online" || formato === "presencial" ? formato : undefined,
    categoria: params.get("categoria") || undefined,
  };
}

/** CSV de US-05.05: uma linha por evento + linha final com os totais agregados. */
export function linhasCsvNumeros(linhas: LinhaNumeros[]) {
  const totais = agregar(linhas);
  return [
    ["Evento", "ID Sympla", "Data", "Formato", "Situação", "Inscritos", "Presentes", "Ausentes", "Cancelados", "Taxa de presença"],
    ...linhas.map((l) => [
      l.titulo,
      l.id,
      formatarDataCurta(l.inicio),
      rotuloFormato(l.formato),
      l.situacao === "ativo" ? "Ativo" : "Inativo",
      l.inscritos,
      l.presentes,
      l.ausentes,
      l.cancelados,
      // Evento ainda ativo não tem taxa de presença (mesma regra da tabela).
      l.situacao === "ativo" ? "—" : formatarTaxa(l.taxa),
    ]),
    ["Total", `${totais.eventos} eventos`, "", "", "", totais.inscritos, totais.presentes, totais.ausentes, totais.cancelados, formatarTaxa(totais.taxa)],
  ];
}
