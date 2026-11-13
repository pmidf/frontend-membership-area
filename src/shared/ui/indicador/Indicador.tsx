import { Cartao } from "../cartao/Cartao";
import { Esqueleto } from "../esqueleto/Esqueleto";
import { cn } from "../lib/cn";

type PropsIndicador = {
  rotulo: string;
  valor: number | undefined;
  carregando: boolean;
  className?: string;
};

export function Indicador({ rotulo, valor, carregando, className }: PropsIndicador) {
  return (
    <Cartao className={cn("flex flex-col gap-1 p-5", className)}>
      {carregando ? (
        <Esqueleto variante="linha" rotulo={`Carregando ${rotulo.toLowerCase()}…`} />
      ) : (
        <p className="text-h2 text-texto-marca">{valor ?? "—"}</p>
      )}
      <p className="text-corpo-pequeno text-texto-secundario">{rotulo}</p>
    </Cartao>
  );
}
