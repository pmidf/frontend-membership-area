import { useMutation } from "@tanstack/react-query";

import { entrar } from "./auth.api";

export function useEntrar() {
  return useMutation({ mutationFn: entrar });
}
