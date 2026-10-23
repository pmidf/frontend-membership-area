import styles from "./Card.module.css";

type CardProps = React.HTMLAttributes<HTMLElement> & {
  as?: "section" | "article" | "div" | "aside";
  destaque?: boolean;
};

export function Card({ as: Elemento = "section", destaque, className, ...props }: CardProps) {
  const classes = [styles.card, destaque && styles.destaque, className].filter(Boolean).join(" ");
  return <Elemento className={classes} {...props} />;
}

export function CardTitulo({ children, id }: { children: React.ReactNode; id?: string }) {
  return (
    <h2 id={id} className={styles.titulo}>
      {children}
    </h2>
  );
}
