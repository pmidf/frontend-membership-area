import type { Tom } from "@/shared/ui";

import type { CategoriaBeneficio } from "../tipos/beneficio";

export const rotulosCategoria: Record<CategoriaBeneficio, { rotulo: string; tom: Tom }> = {
  EDUCACAO: { rotulo: "Educação", tom: "aqua" },
  FERRAMENTAS: { rotulo: "Ferramentas", tom: "neutro" },
  EVENTOS: { rotulo: "Eventos", tom: "aqua" },
  CERTIFICACAO: { rotulo: "Certificação", tom: "violeta" },
  CARREIRA: { rotulo: "Carreira", tom: "alerta" },
};
