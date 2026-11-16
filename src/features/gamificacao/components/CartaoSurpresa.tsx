import {
  SeloPecas,
  TextoCatalogo,
  classesCartaoCatalogo,
  classesMidiaCatalogo,
} from "./CartaoCatalogo";

type PropsCartaoSurpresa = {
  titulo?: string;
  detalhe?: string;
};

export function CartaoSurpresa({
  titulo = "Quebra-cabeça surpresa",
  detalhe = "Ainda não descoberto",
}: PropsCartaoSurpresa) {
  return (
    <div className={classesCartaoCatalogo}>
      <span
        className={`${classesMidiaCatalogo} flex items-center justify-center bg-neutro-200 text-h3 text-texto-secundario md:text-display`}
      >
        <span aria-hidden="true">?</span>
        <SeloPecas />
      </span>
      <TextoCatalogo titulo={titulo} detalhe={detalhe} classeDetalhe="text-texto-secundario" />
    </div>
  );
}
