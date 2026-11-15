"use client";

import { Card, CardTitulo } from "@/components/ui/Card";
import { useEmailsInscricao } from "../lib/useEmailsInscricao";
import styles from "./CardPresencaReconhecida.module.css";

export function CardPresencaReconhecida() {
  const emails = useEmailsInscricao();
  if (!emails) return null;

  return (
    <Card aria-labelledby="titulo-presenca">
      <CardTitulo id="titulo-presenca">Como sua presença é reconhecida</CardTitulo>
      <p className={styles.info}>
        Cruzamos o e-mail da inscrição no Sympla com o e-mail cadastrado no seu perfil.
      </p>
      <ul className={styles.emails}>
        {emails.map((email) => (
          <li key={email}>
            <span className={styles.endereco}>{email}</span>
            <span className={styles.tipoEmail}>Principal</span>
          </li>
        ))}
      </ul>
      <p className={styles.tipoEmail}>Use este mesmo e-mail ao se inscrever no Sympla.</p>
    </Card>
  );
}
