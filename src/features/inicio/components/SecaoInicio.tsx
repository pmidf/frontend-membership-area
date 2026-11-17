import type { UseQueryResult } from "@tanstack/react-query";
import Link from "next/link";
import { useId, type ReactNode } from "react";

import { EstadoErro, Esqueleto } from "@/shared/ui";

import { DESTAQUES_POR_SECAO } from "../lib/selecionar-destaques";

type ConsultaSecao = Pick<UseQueryResult<unknown>, "data" | "isPending" | "isError" | "refetch">;

type PropsSecaoInicio = {
  titulo: string;
  rotuloLink: string;
  href: string;
  consulta: ConsultaSecao;
  mensagemErro: string;
  children: ReactNode;
};

export function SecaoInicio({
  titulo,
  rotuloLink,
  href,
  consulta,
  mensagemErro,
  children,
}: PropsSecaoInicio) {
  const idTitulo = useId();

  return (
    <section aria-labelledby={idTitulo} className="flex min-w-0 flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <h2 id={idTitulo} className="text-h3">
          {titulo}
        </h2>
        <Link
          href={href}
          className="text-rotulo whitespace-nowrap text-texto-marca hover:underline"
        >
          {rotuloLink}
        </Link>
      </div>
      {consulta.isPending ? (
        <Esqueleto
          variante="cartao"
          quantidade={DESTAQUES_POR_SECAO}
          rotulo={`Carregando ${titulo.toLowerCase()}…`}
          className="grid gap-4 md:grid-cols-3 max-md:[&>span>span:nth-child(n+2)]:hidden"
        />
      ) : consulta.isError && consulta.data === undefined ? (
        <EstadoErro
          compacto
          mensagem={mensagemErro}
          aoTentarNovamente={() => void consulta.refetch()}
          className="rounded-lg border border-borda-padrao bg-fundo-superficie"
        />
      ) : (
        children
      )}
    </section>
  );
}
