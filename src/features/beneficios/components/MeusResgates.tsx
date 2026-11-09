"use client";

import type { ReactNode } from "react";

import { useSessao } from "@/shared/sessao/useSessao";
import { Cartao, EstadoErro, Esqueleto } from "@/shared/ui";

import { useMeusResgates } from "../api/resgates.queries";
import { ItemResgate } from "./ItemResgate";

function Moldura({ children }: { children: ReactNode }) {
  return (
    <Cartao className="flex flex-col gap-4 p-6">
      <header className="flex flex-col gap-1">
        <h2 className="text-h3">Meus resgates</h2>
        <p className="text-corpo-pequeno text-texto-secundario">
          O histórico guarda o código e a data, mesmo que o benefício saia do ar depois.
        </p>
      </header>
      {children}
    </Cartao>
  );
}

export function MeusResgates() {
  const { ehFiliado } = useSessao();
  const historico = useMeusResgates();

  if (historico.isPending) {
    return ehFiliado ? (
      <Moldura>
        <Esqueleto variante="linha" quantidade={3} rotulo="Carregando seus resgates…" />
      </Moldura>
    ) : null;
  }

  if (historico.isError) {
    return ehFiliado ? (
      <Moldura>
        <EstadoErro
          compacto
          mensagem="Não foi possível carregar seus resgates."
          aoTentarNovamente={() => void historico.refetch()}
        />
      </Moldura>
    ) : null;
  }

  const { itens, codigos_ocultos } = historico.data;

  if (itens.length === 0) {
    return ehFiliado ? (
      <Moldura>
        <p className="text-corpo-pequeno text-texto-secundario">
          Você ainda não resgatou nenhum benefício.
        </p>
      </Moldura>
    ) : null;
  }

  return (
    <Moldura>
      <ul aria-label="Meus resgates" className="flex flex-col gap-3">
        {itens.map((resgate) => (
          <ItemResgate key={resgate.id_beneficio} resgate={resgate} />
        ))}
      </ul>
      {codigos_ocultos && (
        <p className="text-legenda text-texto-secundario">
          Os códigos ficam disponíveis enquanto sua filiação estiver ativa.
        </p>
      )}
    </Moldura>
  );
}
