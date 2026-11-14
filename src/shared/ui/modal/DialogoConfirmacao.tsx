"use client";

import { useState, type ReactNode } from "react";

import { Botao } from "../botao/Botao";
import { CampoAreaTexto } from "../campo-area-texto/CampoAreaTexto";
import { Modal } from "./Modal";

type ConfiguracaoMotivo = {
  rotulo: string;
  obrigatorio?: boolean;
  tamanhoMinimo?: number;
  tamanhoMaximo?: number;
};

type PropsDialogoConfirmacao = {
  aberto: boolean;
  aoFechar: () => void;
  aoConfirmar: (motivo: string | undefined) => void;
  titulo: ReactNode;
  descricao?: ReactNode;
  rotuloConfirmar: string;
  rotuloCancelar?: string;
  tom?: "primario" | "perigo";
  motivo?: ConfiguracaoMotivo;
  carregando?: boolean;
  erro?: string;
};

function motivoValido(texto: string, configuracao: ConfiguracaoMotivo | undefined): boolean {
  if (!configuracao?.obrigatorio) return true;
  return texto.trim().length >= (configuracao.tamanhoMinimo ?? 1);
}

function ConteudoDialogo({
  aoFechar,
  aoConfirmar,
  titulo,
  descricao,
  rotuloConfirmar,
  rotuloCancelar = "Cancelar",
  tom = "primario",
  motivo,
  carregando = false,
  erro,
}: Omit<PropsDialogoConfirmacao, "aberto">) {
  const [texto, setTexto] = useState("");

  return (
    <Modal
      aberto
      aoFechar={aoFechar}
      titulo={titulo}
      descricao={descricao}
      rodape={
        <>
          <Botao variante="secundario" onClick={aoFechar} disabled={carregando}>
            {rotuloCancelar}
          </Botao>
          <Botao
            variante={tom === "perigo" ? "perigo" : "primario"}
            carregando={carregando}
            disabled={!motivoValido(texto, motivo)}
            onClick={() => aoConfirmar(motivo ? texto.trim() || undefined : undefined)}
          >
            {rotuloConfirmar}
          </Botao>
        </>
      }
    >
      {(motivo || erro) && (
        <div className="flex flex-col gap-4">
          {motivo && (
            <CampoAreaTexto
              rotulo={motivo.obrigatorio ? motivo.rotulo : `${motivo.rotulo} (opcional)`}
              value={texto}
              maxLength={motivo.tamanhoMaximo}
              onChange={(evento) => setTexto(evento.target.value)}
              rows={3}
            />
          )}
          {erro && (
            <p role="alert" className="text-corpo-pequeno text-texto-erro">
              {erro}
            </p>
          )}
        </div>
      )}
    </Modal>
  );
}

export function DialogoConfirmacao({ aberto, ...props }: PropsDialogoConfirmacao) {
  if (!aberto) return null;
  return <ConteudoDialogo {...props} />;
}
