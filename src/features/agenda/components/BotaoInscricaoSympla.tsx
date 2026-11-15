"use client";

import { useId, useRef } from "react";
import { Button, classesBotao } from "@/components/ui/Button";
import { useEmailsInscricao } from "../lib/useEmailsInscricao";
import styles from "./BotaoInscricaoSympla.module.css";

type BotaoInscricaoSymplaProps = {
  urlSympla: string;
  larguraTotal?: boolean;
};

export function BotaoInscricaoSympla({ urlSympla, larguraTotal }: BotaoInscricaoSymplaProps) {
  const dialogo = useRef<HTMLDialogElement>(null);
  const idTitulo = useId();
  const emails = useEmailsInscricao();

  if (!emails) {
    return (
      <a
        href={urlSympla}
        target="_blank"
        rel="noopener noreferrer"
        className={classesBotao({ larguraTotal })}
      >
        Inscrever-se no Sympla
      </a>
    );
  }

  return (
    <>
      <Button
        larguraTotal={larguraTotal}
        onClick={() => dialogo.current?.showModal()}
        aria-haspopup="dialog"
      >
        Inscrever-se no Sympla
      </Button>

      <dialog ref={dialogo} className={styles.dialogo} aria-labelledby={idTitulo}>
        <h2 id={idTitulo} className={styles.titulo}>
          Inscreva-se com o e-mail cadastrado na plataforma para que sua participação seja
          reconhecida
        </h2>
        <ul className={styles.emails}>
          {emails.map((email) => (
            <li key={email} className={styles.email}>
              <span className={styles.endereco}>{email}</span>
              <span className={styles.tipo}>Principal</span>
            </li>
          ))}
        </ul>
        <p className={styles.ajuda}>
          Vai usar outro e-mail no Sympla? Sua presença só é reconhecida pelo e-mail cadastrado no
          seu perfil.
        </p>
        <div className={styles.acoes}>
          <Button tipo="secundaria" onClick={() => dialogo.current?.close()}>
            Cancelar
          </Button>
          <a
            href={urlSympla}
            target="_blank"
            rel="noopener noreferrer"
            className={classesBotao()}
            onClick={() => dialogo.current?.close()}
          >
            Continuar para o Sympla
          </a>
        </div>
      </dialog>
    </>
  );
}
