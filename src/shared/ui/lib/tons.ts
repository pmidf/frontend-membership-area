export type Tom = "violeta" | "aqua" | "neutro" | "sucesso" | "alerta" | "erro";

export const classesTom: Record<Tom, string> = {
  violeta: "bg-violeta-50 text-texto-marca",
  aqua: "bg-aqua-50 text-aqua-600",
  neutro: "bg-neutro-100 text-texto-secundario",
  sucesso: "bg-sucesso-50 text-sucesso-700",
  alerta: "bg-alerta-50 text-alerta-700",
  erro: "bg-erro-50 text-erro-700",
};

export const classesPontoTom: Record<Tom, string> = {
  violeta: "bg-acao-primaria",
  aqua: "bg-aqua-600",
  neutro: "bg-texto-placeholder",
  sucesso: "bg-sucesso-700",
  alerta: "bg-alerta-700",
  erro: "bg-erro-700",
};
