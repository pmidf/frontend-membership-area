import Link from "next/link";

import type { FiliacaoPerfil } from "@/shared/sessao/tipos";
import { classesBotao } from "@/shared/ui/botao/Botao";

import { CAMINHO_CODIGO_PMI, CAMINHO_VINCULAR_FILIACAO } from "../lib/caminhos-filiacao";
import { BotaoAtualizarSituacao } from "./BotaoAtualizarSituacao";

type PropsAcoesFiliacao = {
  filiacao: FiliacaoPerfil | null;
  filiado: boolean;
};

const classesAcao = classesBotao({ variante: "secundario", tamanho: "sm" });

export function AcoesFiliacao({ filiacao, filiado }: PropsAcoesFiliacao) {
  const situacao = filiacao?.situacao ?? "SEM_VINCULO";

  if (situacao === "SEM_VINCULO") {
    return (
      <Link href={CAMINHO_VINCULAR_FILIACAO} className={classesAcao}>
        Informar PMI ID
      </Link>
    );
  }

  if (situacao === "AGUARDANDO_CODIGO") {
    return (
      <Link href={CAMINHO_CODIGO_PMI} className={classesAcao}>
        Digitar o código
      </Link>
    );
  }

  return (
    <>
      <BotaoAtualizarSituacao filiado={filiado} />
      {!filiado && (
        <Link
          href={CAMINHO_VINCULAR_FILIACAO}
          className={classesBotao({ variante: "link", tamanho: "sm" })}
        >
          Corrigir PMI ID
        </Link>
      )}
    </>
  );
}
