// Totais exibidos no console (US-05.05). Os números de cada evento vêm prontos do backend;
// aqui só se recalculam os totais da seleção feita na tela.

export type SituacaoEvento = "ativo" | "inativo";

export type TotaisAgregados = {
  eventos: number;
  inscritos: number;
  presentes: number;
  ausentes: number;
  cancelados: number;
  taxa: number | null;
};

type Contagens = { inscritos: number; presentes: number; ausentes: number; cancelados: number };

/** RN-05.05.4: a taxa agregada é calculada sobre as somas, não pela média das taxas. */
export function agregar(numeros: Contagens[]): TotaisAgregados {
  const soma = (campo: keyof Contagens) => numeros.reduce((total, n) => total + n[campo], 0);
  const inscritos = soma("inscritos");
  const presentes = soma("presentes");
  return {
    eventos: numeros.length,
    inscritos,
    presentes,
    ausentes: soma("ausentes"),
    cancelados: soma("cancelados"),
    taxa: inscritos > 0 ? presentes / inscritos : null,
  };
}

export function formatarTaxa(taxa: number | null) {
  if (taxa === null) return "—";
  return `${(taxa * 100).toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`;
}

export function formatarNumero(valor: number) {
  return valor.toLocaleString("pt-BR");
}

export function formatarSimilaridade(valor: number) {
  return valor.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
