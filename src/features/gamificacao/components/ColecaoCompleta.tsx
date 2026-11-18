import type { MotivoSemSorteio } from "../api/gamificacao.queries";

const TEXTOS: Record<MotivoSemSorteio, { titulo: string; destaque: string; detalhe: string }> = {
  COLECAO_COMPLETA: {
    titulo: "Coleção completa!",
    destaque: "Você montou todos os quebra-cabeças publicados",
    detalhe:
      "Assim que soltarmos um quebra-cabeça novo, você já começa nele. Seus créditos continuam guardados.",
  },
  CATALOGO_VAZIO: {
    titulo: "Nenhum quebra-cabeça publicado",
    destaque: "Ainda não há quebra-cabeças publicados.",
    detalhe: "Seus créditos ficam guardados até o primeiro chegar.",
  },
};

export function ColecaoCompleta({ motivo }: { motivo: MotivoSemSorteio }) {
  const { titulo, destaque, detalhe } = TEXTOS[motivo];

  return (
    <div role="status" className="flex max-w-130 flex-col items-center gap-5 text-center">
      <p className="text-corpo font-bold md:text-[22px]">{titulo}</p>
      <p className="text-corpo-pequeno font-medium text-texto-marca md:text-corpo">{destaque}</p>
      <p className="text-corpo-pequeno text-texto-secundario">{detalhe}</p>
    </div>
  );
}
