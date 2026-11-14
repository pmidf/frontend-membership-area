import { cn } from "../lib/cn";

export type BarraGrafico = { chave: string; rotulo: string; rotuloEixo: string; valor: number };

type PropsGraficoBarras = {
  barras: BarraGrafico[];
  titulo: string;
  nomeCategoria: string;
  nomeValor: string;
  maximoRotulosEixo?: number;
};

const formatoNumero = new Intl.NumberFormat("pt-BR");

export function GraficoBarras({
  barras,
  titulo,
  nomeCategoria,
  nomeValor,
  maximoRotulosEixo = 8,
}: PropsGraficoBarras) {
  const maximo = Math.max(1, ...barras.map(({ valor }) => valor));
  const passoRotulo = Math.max(1, Math.ceil(barras.length / maximoRotulosEixo));

  return (
    <figure className="flex flex-col gap-2">
      <div aria-hidden="true" className="flex gap-2">
        <div className="flex h-48 flex-col justify-between text-right text-legenda text-texto-secundario">
          <span>{formatoNumero.format(maximo)}</span>
          <span>0</span>
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <div className="relative flex h-48 items-end gap-0.5 border-b border-borda-padrao">
            <span className="pointer-events-none absolute inset-x-0 top-0 border-t border-dashed border-borda-padrao" />
            {barras.map(({ chave, rotulo, valor }) => (
              <div
                key={chave}
                data-barra
                className="group relative flex h-full min-w-0 flex-1 items-end hover:bg-violeta-50/60"
              >
                <div
                  className={cn("w-full rounded-t-sm bg-acao-primaria", valor > 0 && "min-h-0.5")}
                  style={{ height: `${(valor / maximo) * 100}%` }}
                />
                <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 hidden -translate-x-1/2 rounded-md bg-violeta-950 px-2.5 py-1.5 text-legenda whitespace-nowrap text-texto-inverso shadow-md group-hover:block">
                  <span className="block">{rotulo}</span>
                  <span className="block font-medium">
                    {formatoNumero.format(valor)} {nomeValor.toLowerCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-0.5">
            {barras.map(({ chave, rotuloEixo }, indice) => (
              <span
                key={chave}
                className={cn(
                  "min-w-0 flex-1 overflow-visible text-center text-legenda whitespace-nowrap text-texto-secundario",
                  indice % (passoRotulo * 2) !== 0 && "max-sm:invisible",
                )}
              >
                {indice % passoRotulo === 0 ? rotuloEixo : ""}
              </span>
            ))}
          </div>
        </div>
      </div>
      <table className="sr-only">
        <caption>{titulo}</caption>
        <thead>
          <tr>
            <th scope="col">{nomeCategoria}</th>
            <th scope="col">{nomeValor}</th>
          </tr>
        </thead>
        <tbody>
          {barras.map(({ chave, rotulo, valor }) => (
            <tr key={chave}>
              <th scope="row">{rotulo}</th>
              <td>{valor}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
