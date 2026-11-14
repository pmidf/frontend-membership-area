import Image from "next/image";
import styles from "./Alert.module.css";

type AlertProps = {
  titulo: string;
  children: React.ReactNode;
};

/** Alerta do tipo Info (processos assíncronos), conforme o componente Alert do Figma. */
export function Alert({ titulo, children }: AlertProps) {
  return (
    <div className={styles.alerta} role="note">
      <Image src="/icons/info.svg" alt="" width={18} height={18} className={styles.icone} />
      <div className={styles.conteudo}>
        <p className={styles.titulo}>{titulo}</p>
        <p className={styles.texto}>{children}</p>
      </div>
    </div>
  );
}
