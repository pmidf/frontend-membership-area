"use client";

import { useSessao } from "@/shared/sessao/useSessao";
import { Esqueleto } from "@/shared/ui";

import { ConteudoRecenteInicio } from "./ConteudoRecenteInicio";
import { FaixaVersaoGratuita } from "./FaixaVersaoGratuita";
import { IndicadoresInicio } from "./IndicadoresInicio";
import { ProximosEventosInicio } from "./ProximosEventosInicio";
import { SaudacaoInicio } from "./SaudacaoInicio";
import { VantagensInicio } from "./VantagensInicio";

export function PaginaInicio() {
  const { perfil, ehFiliado } = useSessao();

  if (!perfil) return <Esqueleto variante="cartao" quantidade={3} rotulo="Carregando o início…" />;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
      {!ehFiliado && <FaixaVersaoGratuita />}
      <SaudacaoInicio perfil={perfil} filiado={ehFiliado} />
      {ehFiliado && <IndicadoresInicio />}
      <ProximosEventosInicio />
      <VantagensInicio filiado={ehFiliado} />
      <ConteudoRecenteInicio filiado={ehFiliado} />
    </div>
  );
}
