import { useMutation } from "@tanstack/react-query";

import { buscarEndereco } from "./cep.api";

export function useBuscarEndereco() {
  return useMutation({ mutationFn: buscarEndereco });
}
