"use client";

import { Modal } from "@/shared/ui";

import type { ResgateCupom } from "../tipos/beneficio";
import { AvisoResgateRegistrado } from "./AvisoResgateRegistrado";
import { BotaoCopiar } from "./BotaoCopiar";

type PropsModalCodigoResgate = {
  resgate: ResgateCupom;
  novo: boolean;
  aoFechar: () => void;
};

const ENDERECO_EXTERNO = /^https?:\/\//i;

export function ModalCodigoResgate({ resgate, novo, aoFechar }: PropsModalCodigoResgate) {
  const { conteudo_entregue: codigo, data_resgate, site_url } = resgate;

  return (
    <Modal
      aberto
      aoFechar={aoFechar}
      titulo="Seu código está pronto"
      topo={novo && <AvisoResgateRegistrado dataResgate={data_resgate} />}
    >
      <div className="flex flex-col gap-4">
        <p className="rounded-md border-2 border-dashed border-acao-primaria bg-violeta-50 p-4 text-center text-h3 break-all text-texto-marca select-all">
          {codigo}
        </p>
        <BotaoCopiar texto={codigo} />
        <p className="text-center text-corpo-pequeno text-texto-secundario">
          Enviamos o mesmo código para o seu e-mail. Se perder, ele continua disponível em Meus
          resgates.
        </p>
        {site_url && ENDERECO_EXTERNO.test(site_url) && (
          <a
            href={site_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-center text-corpo-pequeno font-medium text-texto-marca underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-acao-destaque"
          >
            Ir para o site do parceiro
            <span className="sr-only"> (abre em nova aba)</span>
          </a>
        )}
      </div>
    </Modal>
  );
}
