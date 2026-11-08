"use client";

import { SecaoSeguranca } from "@/features/seguranca/components/SecaoSeguranca";
import { useSessao } from "@/shared/sessao/useSessao";

import { CabecalhoPerfil } from "./CabecalhoPerfil";
import { SecaoDadosPessoais } from "./SecaoDadosPessoais";

export function PaginaPerfil() {
  const { perfil } = useSessao();

  if (!perfil) return null;

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
      <h1 className="sr-only">Meu perfil</h1>
      <CabecalhoPerfil perfil={perfil} />
      <SecaoDadosPessoais perfil={perfil} />
      <SecaoSeguranca />
    </div>
  );
}
