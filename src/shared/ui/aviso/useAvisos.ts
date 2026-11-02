"use client";

import { useContext } from "react";

import { ContextoAvisos, type ApiAvisos } from "./ProvedorAvisos";

export function useAvisos(): ApiAvisos {
  const avisos = useContext(ContextoAvisos);
  if (!avisos) throw new Error("useAvisos precisa estar dentro de ProvedorAvisos");
  return avisos;
}
