import { TOTAL_PECAS, type PainelGamificacao } from "../tipos/gamificacao";
import { CartaoQuebraCabecaAtual } from "./CartaoQuebraCabecaAtual";
import { CatalogoQuebraCabecas } from "./CatalogoQuebraCabecas";
import { IndicadoresGamificacao } from "./IndicadoresGamificacao";

export function PainelQuebraCabecas({ painel }: { painel: PainelGamificacao }) {
  return (
    <>
      <IndicadoresGamificacao painel={painel} />
      <CartaoQuebraCabecaAtual emAndamento={painel.em_andamento} />
      <CatalogoQuebraCabecas painel={painel} />
      <p className="rounded-md bg-violeta-50 px-5 py-4 text-corpo-pequeno text-texto-secundario">
        Cada quebra-cabeça tem sempre {TOTAL_PECAS} peças. Ao completar o atual, use o dado para
        sortear o próximo entre os que você ainda não tem. Cada presença confirmada em um evento
        vira 1 crédito, trocável por 1 peça.
      </p>
    </>
  );
}
