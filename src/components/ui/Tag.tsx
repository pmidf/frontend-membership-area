import styles from "./Tag.module.css";

export type TagVariante = "aqua" | "violeta" | "neutra" | "erro";

type TagProps = {
  children: React.ReactNode;
  variante?: TagVariante;
};

export function Tag({ children, variante = "aqua" }: TagProps) {
  return <span className={`${styles.tag} ${styles[variante]}`}>{children}</span>;
}
