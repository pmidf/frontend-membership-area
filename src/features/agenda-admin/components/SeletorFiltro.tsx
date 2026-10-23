"use client";

import styles from "./admin.module.css";

type SeletorFiltroProps = {
  /** Rótulo acessível e texto da opção "todos". */
  rotulo: string;
  valor?: string;
  aoMudar: (valor: string | undefined) => void;
  children: React.ReactNode;
};

/** Filtro local (no navegador) das tabelas do console. */
export function SeletorFiltro({ rotulo, valor, aoMudar, children }: SeletorFiltroProps) {
  return (
    <label>
      <span className="visually-hidden">{rotulo}</span>
      <select className={styles.seletor} value={valor ?? ""} onChange={(e) => aoMudar(e.target.value || undefined)}>
        <option value="">{rotulo}</option>
        {children}
      </select>
    </label>
  );
}
