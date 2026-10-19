import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { ListaNavegacao, NavegacaoAtiva } from "./Navegacao";
import styles from "./Sidebar.module.css";

type SidebarProps = {
  statusFiliacao?: { titulo: string; descricao?: string };
};

export function Sidebar({ statusFiliacao }: SidebarProps) {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.topo}>
        <Link href="/" className={styles.logo}>
          <Image src="/brand/logo-pmi-df.png" alt="PMI Distrito Federal" width={160} height={44} priority />
        </Link>
        <nav aria-label="Navegação principal">
          {/* O item ativo depende da rota; em rotas dinâmicas ele só é conhecido na requisição. */}
          <Suspense fallback={<ListaNavegacao pathname={null} />}>
            <NavegacaoAtiva />
          </Suspense>
        </nav>
      </div>

      {statusFiliacao && (
        <div className={styles.status}>
          <p className={styles.statusTitulo}>{statusFiliacao.titulo}</p>
          {statusFiliacao.descricao && <p className={styles.statusDescricao}>{statusFiliacao.descricao}</p>}
        </div>
      )}
    </aside>
  );
}
