"use client";

import { useSessao } from "@/shared/sessao/useSessao";

export function useEmailsInscricao(): string[] | null {
  const { estado, perfil } = useSessao();
  if (estado !== "autenticado" || !perfil?.email) return null;
  return [perfil.email];
}
