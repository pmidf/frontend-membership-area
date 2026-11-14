"use client";

import { useState, type ReactNode } from "react";

import { cn } from "@/shared/ui/lib/cn";

import { BarraLateral } from "./BarraLateral";
import { BarraSuperior } from "./BarraSuperior";
import { ComCaminhoAtual } from "./ComCaminhoAtual";
import { Gaveta } from "./Gaveta";
import { tituloDaRota, type ItemDeNavegacao } from "./navegacao";
import { NavegacaoInferior } from "./NavegacaoInferior";
import { PularParaConteudo } from "./PularParaConteudo";

type PropsCasca = {
  rotuloNavegacao: string;
  itens: ItemDeNavegacao[];
  inicio: string;
  topo?: ReactNode;
  rodape: (aoNavegar?: () => void) => ReactNode;
  classeBarraLateral?: string;
  itensSomenteMobile?: ItemDeNavegacao[];
  comNavegacaoInferior?: boolean;
  aviso?: ReactNode;
  children: ReactNode;
};

export function Casca({
  rotuloNavegacao,
  itens,
  inicio,
  topo,
  rodape,
  classeBarraLateral,
  itensSomenteMobile,
  comNavegacaoInferior = false,
  aviso,
  children,
}: PropsCasca) {
  const [gavetaAberta, setGavetaAberta] = useState(false);
  const fecharGaveta = () => setGavetaAberta(false);

  return (
    <div className="min-h-screen lg:pl-65">
      <PularParaConteudo />
      <ComCaminhoAtual>
        {(caminhoAtual) => (
          <BarraLateral
            rotulo={rotuloNavegacao}
            itens={itens}
            caminhoAtual={caminhoAtual}
            inicio={inicio}
            topo={topo}
            rodape={rodape()}
            className={cn("fixed inset-y-0 left-0 z-10 hidden lg:flex", classeBarraLateral)}
          />
        )}
      </ComCaminhoAtual>
      <Gaveta aberta={gavetaAberta} aoFechar={fecharGaveta} rotulo={rotuloNavegacao}>
        <ComCaminhoAtual>
          {(caminhoAtual) => (
            <BarraLateral
              rotulo={rotuloNavegacao}
              itens={itens}
              caminhoAtual={caminhoAtual}
              inicio={inicio}
              topo={topo}
              rodape={rodape(fecharGaveta)}
              aoNavegar={fecharGaveta}
              className={classeBarraLateral}
            />
          )}
        </ComCaminhoAtual>
      </Gaveta>
      <div className="flex min-h-screen flex-col">
        <ComCaminhoAtual>
          {(caminhoAtual) => (
            <BarraSuperior
              titulo={tituloDaRota(itens, caminhoAtual)}
              aoAbrirNavegacao={() => setGavetaAberta(true)}
              navegacaoNoMobile={!comNavegacaoInferior}
              itensSomenteMobile={itensSomenteMobile}
            />
          )}
        </ComCaminhoAtual>
        {aviso}
        <main
          id="conteudo"
          tabIndex={-1}
          className={cn(
            "flex-1 px-4 pt-6 pb-10 focus:outline-none md:px-8",
            comNavegacaoInferior && "pb-24 md:pb-10",
          )}
        >
          {children}
        </main>
      </div>
      {comNavegacaoInferior && (
        <ComCaminhoAtual>
          {(caminhoAtual) => <NavegacaoInferior caminhoAtual={caminhoAtual} />}
        </ComCaminhoAtual>
      )}
    </div>
  );
}
