"use client";

import type { ReactNode } from "react";

import { AvisoVencimento } from "./AvisoVencimento";
import { Casca } from "./Casca";
import { itensForaDaNavegacaoInferior, itensMembro } from "./navegacao";
import { RodapeSituacao } from "./RodapeSituacao";

export function CascaMembro({ children }: { children: ReactNode }) {
  return (
    <Casca
      rotuloNavegacao="Área do membro"
      itens={itensMembro}
      inicio="/inicio"
      rodape={(aoNavegar) => <RodapeSituacao aoNavegar={aoNavegar} />}
      itensSomenteMobile={itensForaDaNavegacaoInferior}
      comNavegacaoInferior
      aviso={<AvisoVencimento />}
    >
      {children}
    </Casca>
  );
}
