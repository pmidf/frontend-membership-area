import { Suspense } from "react";
import { ListaNavegacaoInferior, NavegacaoInferiorAtiva } from "./Navegacao";
import styles from "./NavegacaoInferior.module.css";

/** Navegação do mobile; substitui a sidebar abaixo de 768px. */
export function NavegacaoInferior() {
  return (
    <nav className={styles.barra} aria-label="Navegação principal (mobile)">
      <Suspense fallback={<ListaNavegacaoInferior pathname={null} />}>
        <NavegacaoInferiorAtiva />
      </Suspense>
    </nav>
  );
}
