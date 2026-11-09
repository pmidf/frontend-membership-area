"use client";

import { Alerta, Botao } from "@/shared/ui";

import { acoesPorSituacao } from "../lib/acoes-por-situacao";
import type { SituacaoBeneficio } from "../tipos/beneficio-admin";

type PropsAcoesBeneficio = {
  idFormulario: string;
  situacao: SituacaoBeneficio;
  semAlteracoes: boolean;
  salvando: boolean;
  publicando: boolean;
  duplicando: boolean;
  aoPublicar: () => void;
  aoDespublicar: () => void;
  aoArquivar: () => void;
  aoDuplicar: () => void;
};

export function AcoesBeneficio({
  idFormulario,
  situacao,
  semAlteracoes,
  salvando,
  publicando,
  duplicando,
  aoPublicar,
  aoDespublicar,
  aoArquivar,
  aoDuplicar,
}: PropsAcoesBeneficio) {
  const acoes = acoesPorSituacao(situacao);
  const ocupado = salvando || publicando;

  if (acoes.includes("duplicar")) {
    return (
      <>
        <Alerta tom="alerta" titulo="Benefício arquivado.">
          Para renovar a parceria, duplique-o como um novo rascunho.
        </Alerta>
        <Botao larguraTotal carregando={duplicando} onClick={aoDuplicar}>
          Duplicar como rascunho
        </Botao>
      </>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {acoes.includes("publicar") && (
        <Botao larguraTotal carregando={publicando} disabled={salvando} onClick={aoPublicar}>
          Publicar benefício
        </Botao>
      )}
      <Botao
        type="submit"
        form={idFormulario}
        larguraTotal
        variante={acoes.includes("publicar") ? "secundario" : "primario"}
        disabled={semAlteracoes || publicando}
        carregando={salvando}
      >
        Salvar alterações
      </Botao>
      {acoes.includes("despublicar") && (
        <Botao variante="secundario" larguraTotal disabled={ocupado} onClick={aoDespublicar}>
          Despublicar
        </Botao>
      )}
      <Botao variante="perigoContorno" larguraTotal disabled={ocupado} onClick={aoArquivar}>
        Arquivar
      </Botao>
    </div>
  );
}
