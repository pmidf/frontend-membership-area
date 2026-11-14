"use client";

import { Modal } from "@/shared/ui";
import { HtmlSeguro } from "@/shared/ui/html-seguro/HtmlSeguro";

import { AvisoResgateRegistrado } from "./AvisoResgateRegistrado";

type PropsModalInstrucaoResgate = {
  conteudo: string;
  dataRegistro?: string;
  aoFechar: () => void;
};

export function ModalInstrucaoResgate({
  conteudo,
  dataRegistro,
  aoFechar,
}: PropsModalInstrucaoResgate) {
  return (
    <Modal
      aberto
      aoFechar={aoFechar}
      titulo="Siga as instruções"
      topo={dataRegistro && <AvisoResgateRegistrado dataResgate={dataRegistro} />}
    >
      <HtmlSeguro html={conteudo} className="text-corpo-pequeno" />
    </Modal>
  );
}
