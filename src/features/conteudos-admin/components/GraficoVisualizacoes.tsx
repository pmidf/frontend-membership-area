import { formatarDataCivil } from "@/shared/lib/datas";
import { Cartao, EstadoVazio, GraficoBarras } from "@/shared/ui";

import { agruparSerie } from "../lib/agrupar-serie";
import type { PeriodoTela } from "../lib/periodo-estatisticas";
import type { PontoSerie } from "../tipos/conteudo-admin";

type PropsGrafico = { serie: PontoSerie[]; periodo: PeriodoTela };

export function GraficoVisualizacoes({ serie, periodo }: PropsGrafico) {
  const { porSemana, barras } = agruparSerie(serie);
  const intervalo = `${formatarDataCivil(periodo.de)} a ${formatarDataCivil(periodo.ate)}`;
  const vazio = barras.every(({ valor }) => valor === 0);

  return (
    <Cartao className="flex flex-col gap-4 p-4 md:p-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-h3">Visualizações ao longo do tempo</h2>
        <p className="text-corpo-pequeno text-texto-secundario">
          {porSemana ? "Por semana" : "Por dia"} · {intervalo}
        </p>
      </div>
      {vazio ? (
        <EstadoVazio titulo="Ainda não há acessos neste período" />
      ) : (
        <GraficoBarras
          barras={barras}
          titulo={`Visualizações ${porSemana ? "por semana" : "por dia"}, de ${intervalo}`}
          nomeCategoria={porSemana ? "Semana" : "Dia"}
          nomeValor="Visualizações"
        />
      )}
    </Cartao>
  );
}
