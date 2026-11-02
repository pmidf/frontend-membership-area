import { useMutation } from "@tanstack/react-query";

import { cadastrar, entrar, preConsultar } from "./auth.api";
import { buscarEndereco } from "./cep.api";

export function useEntrar() {
  return useMutation({ mutationFn: entrar });
}

export function usePreCadastro() {
  return useMutation({ mutationFn: preConsultar });
}

export function useCadastrar() {
  return useMutation({ mutationFn: cadastrar });
}

export function useBuscarEndereco() {
  return useMutation({ mutationFn: buscarEndereco });
}
