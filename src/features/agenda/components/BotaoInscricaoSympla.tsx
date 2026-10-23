"use client";

import { useId, useRef } from "react";
import { Button, classesBotao } from "@/components/ui/Button";
import type { EmailUsuario } from "@/lib/sessao";
import styles from "./BotaoInscricaoSympla.module.css";

type BotaoInscricaoSymplaProps = {
  urlSympla: string;
  /** E-mails verificados da pessoa autenticada; `null` para visitante. */
  emails: EmailUsuario[] | null;
  larguraTotal?: boolean;
};

/**
 * Abre a página do evento no Sympla em nova aba (US-05.01 c5).
 * Autenticado: antes de sair, avisa com quais e-mails a inscrição precisa ser feita
 * para que a participação seja reconhecida (vínculo por e-mail — RN-05.01.2).
 */
export function BotaoInscricaoSympla({ urlSympla, emails, larguraTotal }: BotaoInscricaoSymplaProps) {
  const dialogo = useRef<HTMLDialogElement>(null);
  const idTitulo = useId();

  if (!emails) {
    return (
      <a href={urlSympla} target="_blank" rel="noopener noreferrer" className={classesBotao({ larguraTotal })}>
        Inscrever-se no Sympla
      </a>
    );
  }

  return (
    <>
      <Button larguraTotal={larguraTotal} onClick={() => dialogo.current?.showModal()} aria-haspopup="dialog">
        Inscrever-se no Sympla
      </Button>

      <dialog ref={dialogo} className={styles.dialogo} aria-labelledby={idTitulo}>
        <h2 id={idTitulo} className={styles.titulo}>
          Inscreva-se com um destes e-mails para que sua participação seja reconhecida
        </h2>
        <ul className={styles.emails}>
          {emails.map((email) => (
            <li key={email.endereco} className={styles.email}>
              <span className={styles.endereco}>{email.endereco}</span>
              <span className={styles.tipo}>{email.tipo === "principal" ? "Principal" : "Alternativo"} · verificado</span>
            </li>
          ))}
        </ul>
        <p className={styles.ajuda}>
          Vai usar outro e-mail no Sympla? Cadastre e verifique esse endereço no seu perfil para que a presença conte.
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
