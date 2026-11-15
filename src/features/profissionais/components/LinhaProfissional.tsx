import Link from "next/link";

import { Avatar } from "@/shared/ui";

import type { ItemProfissional } from "../tipos/profissional";

type PropsLinhaProfissional = {
  profissional: ItemProfissional;
  consultaAtual: string;
};

export function LinhaProfissional({ profissional, consultaAtual }: PropsLinhaProfissional) {
  const { id_pessoa, nome_completo, foto_perfil, cargo, empresa, cidade, uf } = profissional;
  const destino = `/profissionais/${id_pessoa}${consultaAtual ? `?${consultaAtual}` : ""}`;

  return (
    <li className="flex items-center gap-4 rounded-md p-3 sm:p-4">
      <Avatar nome={nome_completo} imagem={foto_perfil} tamanho="md" className="sm:size-12" />
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <h3 className="text-corpo font-medium break-words">{nome_completo}</h3>
        <p className="text-corpo-pequeno text-texto-secundario">
          {cargo} · {empresa}
        </p>
        <p className="text-legenda text-texto-secundario">
          {cidade}/{uf}
        </p>
      </div>
      <Link
        href={destino}
        aria-label={`Ver perfil de ${nome_completo}`}
        className="text-corpo-pequeno font-medium whitespace-nowrap text-texto-marca underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-acao-destaque"
      >
        Ver perfil
      </Link>
    </li>
  );
}
