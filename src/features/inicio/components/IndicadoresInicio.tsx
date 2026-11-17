"use client";

import { useMemo } from "react";

import { useEventosAgenda, useSituacaoNosEventos } from "@/features/agenda/api/agenda.queries";
import { useMeusResgates } from "@/features/beneficios/api/resgates.queries";
import { usePainelGamificacao } from "@/features/gamificacao/api/gamificacao.queries";
import { Botao, Indicador } from "@/shared/ui";

import { contarPresencas, idsDeEventosPassados } from "../lib/selecionar-destaques";

type EstadoIndicador = {
  valor: number | undefined;
  carregando: boolean;
  falhou: boolean;
  recarregar: () => void;
};

function usePresencas(): EstadoIndicador {
  const eventos = useEventosAgenda();
  const ids = useMemo(
    () => (eventos.data ? idsDeEventosPassados(eventos.data, new Date()) : []),
    [eventos.data],
  );
  const situacao = useSituacaoNosEventos(ids);
  const semEventosPassados = eventos.data !== undefined && ids.length === 0;

  if (semEventosPassados) {
    return { valor: 0, carregando: false, falhou: false, recarregar: () => undefined };
  }
  return {
    valor: situacao.data && contarPresencas(situacao.data),
    carregando: eventos.isPending || (eventos.isSuccess && situacao.isPending),
    falhou: eventos.isError || situacao.isError,
    recarregar: () => void (eventos.isError ? eventos.refetch() : situacao.refetch()),
  };
}

function IndicadorInicio({ rotulo, estado }: { rotulo: string; estado: EstadoIndicador }) {
  const { valor, carregando, falhou, recarregar } = estado;

  return (
    <li>
      <Indicador
        rotulo={rotulo}
        valor={valor}
        carregando={carregando}
        className="h-full"
        acao={
          falhou && valor === undefined ? (
            <Botao variante="link" tamanho="sm" onClick={recarregar} className="self-start">
              Tentar novamente
            </Botao>
          ) : undefined
        }
      />
    </li>
  );
}

export function IndicadoresInicio() {
  const presencas = usePresencas();
  const painel = usePainelGamificacao();
  const resgates = useMeusResgates();

  return (
    <ul aria-label="Seus números no capítulo" className="grid gap-4 md:grid-cols-3">
      <IndicadorInicio rotulo="Eventos em que você esteve presente" estado={presencas} />
      <IndicadorInicio
        rotulo="Quebra-cabeças completos"
        estado={{
          valor: painel.data?.concluidos.length,
          carregando: painel.isPending,
          falhou: painel.isError,
          recarregar: () => void painel.refetch(),
        }}
      />
      <IndicadorInicio
        rotulo="Benefícios resgatados"
        estado={{
          valor: resgates.data?.itens.length,
          carregando: resgates.isPending,
          falhou: resgates.isError,
          recarregar: () => void resgates.refetch(),
        }}
      />
    </ul>
  );
}
