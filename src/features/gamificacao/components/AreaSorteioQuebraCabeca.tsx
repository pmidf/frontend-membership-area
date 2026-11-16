"use client";

import { useState } from "react";

import { ehErroApi } from "@/shared/api/erro-api";
import { useAvisos } from "@/shared/ui";

import {
  motivoSemSorteio,
  useSortearQuebraCabeca,
  type MotivoSemSorteio,
} from "../api/gamificacao.queries";
import { ColecaoCompleta } from "./ColecaoCompleta";
import { Dado } from "./Dado";

export const MENSAGEM_FALHA_SORTEIO = "Não foi possível sortear agora. Tente de novo em instantes.";

type PropsAreaSorteioQuebraCabeca = {
  aoSortear: () => void;
};

export function AreaSorteioQuebraCabeca({ aoSortear }: PropsAreaSorteioQuebraCabeca) {
  const sortear = useSortearQuebraCabeca();
  const avisos = useAvisos();
  const [semSorteio, setSemSorteio] = useState<MotivoSemSorteio | null>(null);

  function aoClicar() {
    if (sortear.isPending) return;
    sortear.mutate(undefined, {
      onSuccess: aoSortear,
      onError: (erro) => {
        const motivo = motivoSemSorteio(erro);
        if (motivo) setSemSorteio(motivo);
        else if (!ehErroApi(erro) || (erro.status !== 403 && erro.status !== 409))
          avisos.erro(MENSAGEM_FALHA_SORTEIO);
      },
    });
  }

  if (semSorteio) return <ColecaoCompleta motivo={semSorteio} />;

  return (
    <div className="flex flex-col items-center gap-10 md:gap-14">
      <Dado
        rotulo="Sortear um novo quebra-cabeça"
        aoClicar={aoClicar}
        rolando={sortear.isPending}
        className="mt-6"
      />
      <p className="hidden max-w-130 text-center text-lg font-bold md:block">
        Você ainda não tem nenhum quebra-cabeça em andamento.
        <br />
        Clique aqui para sortear seu próximo!
      </p>
      <p className="text-center text-corpo-pequeno text-texto-secundario md:hidden">
        Toque no dado para sortear seu próximo quebra-cabeça.
      </p>
    </div>
  );
}
