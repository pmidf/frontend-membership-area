import type { Escolaridade, Genero } from "@/shared/sessao/tipos";
import type { OpcaoSelecao } from "@/shared/ui";

export const rotulosGenero: Record<Genero, string> = {
  FEMININO: "Feminino",
  MASCULINO: "Masculino",
  NAO_BINARIO: "Não binário",
  OUTRO: "Outro",
  PREFIRO_NAO_INFORMAR: "Prefiro não informar",
};

export const rotulosEscolaridade: Record<Escolaridade, string> = {
  ENSINO_FUNDAMENTAL: "Ensino fundamental",
  ENSINO_MEDIO: "Ensino médio",
  TECNICO: "Técnico",
  SUPERIOR_INCOMPLETO: "Superior incompleto",
  SUPERIOR_COMPLETO: "Superior completo",
  ESPECIALIZACAO_MBA: "Especialização / MBA",
  MESTRADO: "Mestrado",
  DOUTORADO: "Doutorado",
};

export const UFS = [
  "AC",
  "AL",
  "AP",
  "AM",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "MT",
  "MS",
  "MG",
  "PA",
  "PB",
  "PR",
  "PE",
  "PI",
  "RJ",
  "RN",
  "RS",
  "RO",
  "RR",
  "SC",
  "SP",
  "SE",
  "TO",
] as const;

function paraOpcoes<V extends string>(rotulos: Record<V, string>): OpcaoSelecao[] {
  return (Object.entries(rotulos) as [V, string][]).map(([valor, rotulo]) => ({ valor, rotulo }));
}

export const opcoesGenero = paraOpcoes(rotulosGenero);
export const opcoesEscolaridade = paraOpcoes(rotulosEscolaridade);
export const opcoesUf: OpcaoSelecao[] = UFS.map((uf) => ({ valor: uf, rotulo: uf }));
