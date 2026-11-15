import styles from "./ImagemEvento.module.css";

type ImagemEventoProps = {
  src?: string;
  className?: string;
};

/** Imagem do evento vinda do Sympla; sem imagem, usa o gradiente da marca do protótipo. */
export function ImagemEvento({ src, className }: ImagemEventoProps) {
  const classes = [styles.imagem, className].filter(Boolean).join(" ");
  if (!src) return <div className={classes} aria-hidden />;
  // A imagem é servida pelo CDN do Sympla, cujo domínio não controlamos: <img> evita depender de remotePatterns.
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt="" className={classes} />;
}
