import Link from "next/link";

import { Etiqueta } from "@/shared/ui";

import { encerraEmBreve, textoExpiracao, textoPublicacao } from "../lib/prazo";
import { rotulosModalidade } from "../lib/rotulos";
import type { ItemOportunidade } from "../tipos/oportunidade";
import { LogoEmpresa } from "./LogoEmpresa";

type PropsLinhaVaga = {
  vaga: ItemOportunidade;
  consultaAtual: string;
};

export function LinhaVaga({ vaga, consultaAtual }: PropsLinhaVaga) {
  const { id_oportunidade, titulo, empresa, logo_empresa, modalidade, localidade } = vaga;
  const descricao = [empresa, modalidade && rotulosModalidade[modalidade].rotulo, localidade]
    .filter(Boolean)
    .join(" · ");
  const prazos = [
    vaga.data_publicacao && textoPublicacao(vaga.data_publicacao),
    textoExpiracao(vaga.data_encerramento),
  ]
    .filter(Boolean)
    .join(" · ");
  const destino = `/vagas/${id_oportunidade}${consultaAtual ? `?${consultaAtual}` : ""}`;

  return (
    <li className="flex flex-col gap-3 rounded-md bg-fundo-pagina p-4 sm:flex-row sm:items-center">
      <Link
        href={destino}
        tabIndex={-1}
        aria-hidden="true"
        className="self-start rounded-md transition-opacity hover:opacity-80 sm:self-center"
      >
        <LogoEmpresa empresa={empresa} logo={logo_empresa} className="size-12" />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <h3 className="text-corpo font-medium break-words">{titulo}</h3>
        <p className="text-corpo-pequeno text-texto-secundario">{descricao}</p>
        <p className="text-legenda text-texto-secundario">{prazos}</p>
      </div>
      <div className="flex items-center gap-4">
        {encerraEmBreve(vaga.data_encerramento) && <Etiqueta>Encerra em breve</Etiqueta>}
        <Link
          href={destino}
          aria-label={`Ver vaga: ${titulo}`}
          className="text-corpo-pequeno font-medium whitespace-nowrap text-texto-marca underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-acao-destaque"
        >
          Ver vaga
        </Link>
      </div>
    </li>
  );
}
