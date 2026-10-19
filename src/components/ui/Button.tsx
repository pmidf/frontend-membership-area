import styles from "./Button.module.css";

export type BotaoTipo = "primaria" | "secundaria" | "link";

type Opcoes = {
  tipo?: BotaoTipo;
  larguraTotal?: boolean;
  className?: string;
};

/** Classes do botão do design system, para aplicar em <button>, <a> ou <Link>. */
export function classesBotao({ tipo = "primaria", larguraTotal, className }: Opcoes = {}) {
  return [styles.botao, styles[tipo], larguraTotal && styles.larguraTotal, className]
    .filter(Boolean)
    .join(" ");
}

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & Opcoes;

export function Button({ tipo, larguraTotal, className, type = "button", ...props }: ButtonProps) {
  return <button type={type} className={classesBotao({ tipo, larguraTotal, className })} {...props} />;
}
