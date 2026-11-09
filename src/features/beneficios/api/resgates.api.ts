import { api } from "@/shared/api/cliente-http";

import type { TipoResgate } from "../tipos/beneficio";

export type ItemHistoricoResgate = {
  id_beneficio: string;
  titulo: string;
  parceiro: string;
  tipo_resgate: TipoResgate;
  data_resgate: string;
  beneficio_encerrado: boolean;
  conteudo_entregue?: string;
};

export type HistoricoResgates = {
  codigos_ocultos: boolean;
  itens: ItemHistoricoResgate[];
};

export function listarMeusResgates(): Promise<HistoricoResgates> {
  return api.obter<HistoricoResgates>("/me/resgates");
}
