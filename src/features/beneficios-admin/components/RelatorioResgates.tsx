"use client";

import { useState } from "react";

import {
  Alerta,
  Botao,
  Cartao,
  CampoSelecao,
  EstadoErro,
  EstadoVazio,
  Tabela,
  useAvisos,
  type ColunaTabela,
} from "@/shared/ui";

import {
  useExportarRelatorioResgates,
  useRelatorioResgates,
} from "../api/beneficios-admin.queries";
import {
  anoAtual,
  anosDoRelatorio,
  formatarNumero,
  textoTaxaUtilizacao,
} from "../lib/relatorio-resgates";
import type { ResgatesPorBeneficio } from "../tipos/relatorio-resgates";

const colunas: ColunaTabela<ResgatesPorBeneficio>[] = [
  {
    id: "beneficio",
    cabecalho: "Benefício",
    celula: (linha) => <span className="font-medium">{linha.titulo}</span>,
  },
  { id: "parceiro", cabecalho: "Parceiro", celula: (linha) => linha.parceiro },
  {
    id: "resgates",
    cabecalho: "Resgates no ano",
    alinhamento: "fim",
    celula: (linha) => formatarNumero(linha.resgates),
  },
  {
    id: "distintos",
    cabecalho: "Filiados distintos",
    alinhamento: "fim",
    celula: (linha) => formatarNumero(linha.filiados_distintos),
  },
];

export function RelatorioResgates() {
  const [ano, setAno] = useState(() => anoAtual());
  const relatorio = useRelatorioResgates(ano);
  const exportacao = useExportarRelatorioResgates();
  const avisos = useAvisos();
  const { data } = relatorio;

  function exportar() {
    exportacao.mutate(ano, {
      onSuccess: () => avisos.sucesso("Relatório exportado"),
      onError: () => avisos.erro("Não foi possível exportar o relatório. Tente novamente."),
    });
  }

  return (
    <Cartao
      className="flex flex-col gap-4 p-4 md:p-6"
      aria-labelledby="titulo-relatorio-resgates"
      role="region"
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col gap-1">
          <h2 id="titulo-relatorio-resgates" className="text-h3">
            Relatório de resgates
          </h2>
          <p className="text-corpo-pequeno text-texto-secundario">
            Use estes números na renegociação com os parceiros. A exportação sai pseudonimizada e
            fica registrada na auditoria.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <CampoSelecao
            rotulo="Ano"
            className="sm:w-36"
            value={String(ano)}
            onChange={(evento) => setAno(Number(evento.target.value))}
            opcoes={anosDoRelatorio().map((opcao) => ({
              valor: String(opcao),
              rotulo: String(opcao),
            }))}
          />
          <Botao
            variante="secundario"
            className="shrink-0 whitespace-nowrap"
            aria-label={`Exportar CSV do relatório de resgates de ${ano}`}
            title="Uma linha por resgate, com o filiado pseudonimizado"
            carregando={exportacao.isPending}
            onClick={exportar}
          >
            Exportar CSV
          </Botao>
        </div>
      </div>

      {relatorio.isError ? (
        <EstadoErro
          compacto
          mensagem="Não foi possível carregar o relatório de resgates."
          aoTentarNovamente={() => void relatorio.refetch()}
        />
      ) : (
        <>
          {data && (
            <Alerta tom="informacao" titulo="Taxa de utilização sobre a base ativa">
              {textoTaxaUtilizacao(data)}
            </Alerta>
          )}
          <Tabela
            rotulo={`Resgates por benefício em ${ano}`}
            colunas={colunas}
            itens={data?.por_beneficio ?? []}
            chave={(linha) => linha.id_beneficio}
            carregando={relatorio.isPending}
            vazio={<EstadoVazio titulo={`Nenhum resgate em ${ano}`} />}
          />
        </>
      )}
    </Cartao>
  );
}
