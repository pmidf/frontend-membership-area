"use client";

import Link from "next/link";

import { Botao, Modal } from "@/shared/ui";
import { classesBotao } from "@/shared/ui/botao/Botao";

export function ModalFiliacaoNaoVigente({ aoFechar }: { aoFechar: () => void }) {
  return (
    <Modal
      aberto
      aoFechar={aoFechar}
      titulo="Sua filiação não está vigente"
      descricao="O resgate é exclusivo para filiados com filiação ativa. Confira sua situação no perfil."
      rodape={
        <>
          <Botao variante="secundario" onClick={aoFechar}>
            Fechar
          </Botao>
          <Link href="/perfil#filiacao" className={classesBotao()}>
            Ver minha filiação
          </Link>
        </>
      }
    />
  );
}
