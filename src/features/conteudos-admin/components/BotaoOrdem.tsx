import { ChevronDown, ChevronUp } from "lucide-react";

type PropsBotaoOrdem = {
  direcao: "subir" | "descer";
  nome: string;
  desabilitado: boolean;
  aoClicar: () => void;
};

export function BotaoOrdem({ direcao, nome, desabilitado, aoClicar }: PropsBotaoOrdem) {
  const Icone = direcao === "subir" ? ChevronUp : ChevronDown;
  return (
    <button
      type="button"
      aria-label={`${direcao === "subir" ? "Subir" : "Descer"} ${nome}`}
      disabled={desabilitado}
      onClick={aoClicar}
      className="inline-flex size-9 shrink-0 items-center justify-center rounded-pill border border-acao-primaria text-texto-marca hover:bg-violeta-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acao-destaque disabled:cursor-not-allowed disabled:opacity-35"
    >
      <Icone aria-hidden="true" className="size-4" />
    </button>
  );
}
