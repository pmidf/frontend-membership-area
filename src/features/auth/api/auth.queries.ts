import { useMutation } from "@tanstack/react-query";

import { cadastrar, confirmarEmail, entrar, preConsultar, reenviarCodigo } from "./auth.api";
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

export function useConfirmarEmail() {
  return useMutation({ mutationFn: confirmarEmail });
}

export function useReenviarCodigo() {
  return useMutation({ mutationFn: reenviarCodigo });
}
