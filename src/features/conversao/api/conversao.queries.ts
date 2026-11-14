"use client";

import { useMutation } from "@tanstack/react-query";

import { registrarCliqueConversao } from "./conversao.api";

export function useRegistrarCliqueConversao() {
  return useMutation({ mutationFn: registrarCliqueConversao });
}
