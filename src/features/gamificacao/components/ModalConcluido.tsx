"use client";

import { useEffect } from "react";

import { formatarData } from "@/shared/lib/datas";
import { Botao, EstadoErro, Esqueleto, Modal, useAvisos } from "@/shared/ui";

import { quebraCabecaNaoEncontrado, useConcluido } from "../api/gamificacao.queries";
import type { QuebraCabecaConcluido } from "../tipos/gamificacao";
import { ImagemQuebraCabeca } from "./ImagemQuebraCabeca";

type PropsModalConcluido = {
  concluido: QuebraCabecaConcluido | null;
  aoFechar: () => void;
};

export const MENSAGEM_NAO_ENCONTRADO = "Não encontramos este quebra-cabeça na sua coleção.";

export function ModalConcluido({ concluido, aoFechar }: PropsModalConcluido) {
  const detalhe = useConcluido(concluido?.progresso_id ?? null);
  const avisos = useAvisos();
  const naoEncontrado = quebraCabecaNaoEncontrado(detalhe.error);

  useEffect(() => {
    if (!naoEncontrado) return;
    avisos.erro(MENSAGEM_NAO_ENCONTRADO);
    aoFechar();
  }, [naoEncontrado, avisos, aoFechar]);

  if (!concluido || naoEncontrado) return null;
  const dados = detalhe.data ?? concluido;

  return (
    <Modal
      aberto
      aoFechar={aoFechar}
      titulo={dados.nome}
      descricao={`Concluído em ${formatarData(dados.concluido_em)}`}
      topo={
        <ImagemQuebraCabeca
          src={dados.imagem_original}
          className="aspect-[496/220] w-full rounded-md"
        />
      }
      rodape={
        <Botao variante="secundario" onClick={aoFechar} className="sm:mr-auto sm:w-40">
          Fechar
        </Botao>
      }
    >
      <div className="flex flex-col gap-2 text-corpo-pequeno text-texto-secundario">
        <p className="font-medium text-texto-primario">{dados.legenda}</p>
        {detalhe.data && <p className="whitespace-pre-line">{detalhe.data.historia}</p>}
        {detalhe.isPending && (
          <Esqueleto variante="linha" quantidade={2} rotulo="Carregando a história…" />
        )}
        {detalhe.isError && (
          <EstadoErro
            compacto
            mensagem="Não foi possível carregar a história deste quebra-cabeça."
            aoTentarNovamente={() => void detalhe.refetch()}
          />
        )}
      </div>
    </Modal>
  );
}
