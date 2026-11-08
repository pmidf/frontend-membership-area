"use client";

import { useContext } from "react";

import { ContextoSessao, type ValorSessao } from "./ProvedorSessao";

export function useSessao(): ValorSessao {
  const sessao = useContext(ContextoSessao);
  if (!sessao) throw new Error("useSessao precisa estar dentro de ProvedorSessao");
  return sessao;
}
