"use client";

import { ExternalLink } from "lucide-react";

import { ehErroApi } from "@/shared/api/erro-api";
import { Botao, useAvisos } from "@/shared/ui";

import { useAbrirMaterial } from "../api/conteudos.queries";
import { abrirAbaVazia } from "../lib/abrir-em-nova-aba";

const mensagensPorStatus: Record<number, string> = {
  403: "Material exclusivo para filiados.",
  404: "Material não encontrado.",
};

function mensagemDeFalha(erro: unknown): string {
  return (
    (ehErroApi(erro) && mensagensPorStatus[erro.status]) || "Não foi possível abrir o material."
  );
}

export function BotaoAbrirMaterial({ idConteudo }: { idConteudo: string }) {
  const abrir = useAbrirMaterial(idConteudo);
  const avisos = useAvisos();

  function aoClicar() {
    abrir.mutate(abrirAbaVazia(), { onError: (erro) => avisos.erro(mensagemDeFalha(erro)) });
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <Botao
        variante="inverso"
        carregando={abrir.isPending}
        icone={<ExternalLink aria-hidden="true" className="size-4" />}
        onClick={aoClicar}
      >
        Abrir material
      </Botao>
      <p className="text-legenda text-texto-inverso">Abre em nova aba</p>
    </div>
  );
}
