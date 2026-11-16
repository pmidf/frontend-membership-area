import Image from "next/image";
import type { ReactNode } from "react";

import { Cartao, cn } from "@/shared/ui";

import { TOTAL_PECAS, type PainelGamificacao } from "../tipos/gamificacao";

type PropsCartaoIndicador = {
  valor: ReactNode;
  rotulo: ReactNode;
  icone?: string;
  className?: string;
};

function CartaoIndicador({ valor, rotulo, icone, className }: PropsCartaoIndicador) {
  return (
    <div className={cn("relative", className)}>
      <Cartao className="flex h-full flex-col gap-1 rounded-md px-3 py-2.5 md:rounded-lg md:p-5">
        <p className="text-h3 text-texto-marca md:text-display">{valor}</p>
        <p className="text-legenda text-texto-secundario md:text-corpo-pequeno">{rotulo}</p>
      </Cartao>
      {icone && (
        <Image
          src={icone}
          alt=""
          aria-hidden="true"
          width={50}
          height={48}
          className="absolute -top-4 right-[-11px] hidden md:block"
        />
      )}
    </div>
  );
}

function Rotulo({ curto, completo }: { curto: string; completo: string }) {
  return (
    <>
      <span className="md:hidden">{curto}</span>
      <span className="hidden md:inline">{completo}</span>
    </>
  );
}

export function IndicadoresGamificacao({ painel }: { painel: PainelGamificacao }) {
  const pecasAtual = painel.em_andamento?.pecas_obtidas;

  return (
    <section
      aria-label="Resumo da coleção"
      className="grid grid-cols-2 gap-2.5 md:grid-cols-3 md:gap-5 md:pt-4"
    >
      <CartaoIndicador
        className="hidden md:block"
        valor={painel.concluidos.length}
        rotulo="Quebra-cabeças completos"
        icone="/gamificacao/icone-pecas.svg"
      />
      <CartaoIndicador
        valor={
          pecasAtual === undefined ? (
            "—"
          ) : (
            <>
              {pecasAtual}
              <span className="md:hidden">/{TOTAL_PECAS}</span>
            </>
          )
        }
        rotulo={
          <Rotulo curto="Peças (atual)" completo={`de ${TOTAL_PECAS} peças coletadas no atual`} />
        }
        icone="/gamificacao/icone-peca.svg"
      />
      <CartaoIndicador
        className="order-first md:order-none"
        valor={painel.creditos}
        rotulo={<Rotulo curto="Créditos" completo="Créditos disponíveis" />}
      />
    </section>
  );
}
