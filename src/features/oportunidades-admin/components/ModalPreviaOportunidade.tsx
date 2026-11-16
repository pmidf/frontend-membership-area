"use client";

import { DetalheVaga } from "@/features/oportunidades/components/DetalheVaga";
import { EstadoErro, Esqueleto, Modal } from "@/shared/ui";

import { usePreviewOportunidade } from "../api/oportunidades-admin.queries";

function ConteudoPrevia({ id }: { id: string }) {
  const previa = usePreviewOportunidade(id);

  if (previa.isPending) {
    return <Esqueleto variante="cartao" quantidade={2} rotulo="Carregando a pré-visualização…" />;
  }
  if (previa.isError) {
    return (
      <EstadoErro
        mensagem="Não foi possível carregar a pré-visualização."
        aoTentarNovamente={() => void previa.refetch()}
      />
    );
  }
  return <DetalheVaga oportunidade={previa.data} tituloComo="h2" />;
}

type PropsModalPreviaOportunidade = {
  id: string;
  aberto: boolean;
  aoFechar: () => void;
};

export function ModalPreviaOportunidade({ id, aberto, aoFechar }: PropsModalPreviaOportunidade) {
  return (
    <Modal
      aberto={aberto}
      aoFechar={aoFechar}
      titulo="Pré-visualização"
      descricao="É assim que a vaga aparece para o filiado."
      largura="lg"
    >
      <ConteudoPrevia id={id} />
    </Modal>
  );
}
