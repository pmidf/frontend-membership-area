import { Check } from "lucide-react";
import Link from "next/link";

import { Modal } from "@/shared/ui";
import { classesBotao } from "@/shared/ui/botao/Botao";

type PropsModalAlteracoesSalvas = {
  nome: string | null;
  imagemBloqueada: boolean;
  aoFechar: () => void;
};

export function ModalAlteracoesSalvas({
  nome,
  imagemBloqueada,
  aoFechar,
}: PropsModalAlteracoesSalvas) {
  return (
    <Modal
      aberto={nome !== null}
      aoFechar={aoFechar}
      topo={
        <span className="mx-auto flex size-16 items-center justify-center rounded-pill bg-sucesso-50">
          <Check aria-hidden="true" className="size-7 text-texto-primario" />
        </span>
      }
      titulo={<span className="block text-center">Alterações salvas com sucesso!</span>}
      descricao={
        <span className="block text-center">
          As alterações de &quot;{nome}&quot; foram salvas.
          {imagemBloqueada &&
            " A imagem continua a mesma, já que este quebra-cabeça já tem progresso."}
        </span>
      }
    >
      <div className="flex justify-center pb-2">
        <Link
          href="/admin/quebra-cabecas"
          data-foco-inicial
          className={classesBotao({ variante: "secundario", larguraTotal: true })}
        >
          Voltar para a lista
        </Link>
      </div>
    </Modal>
  );
}
