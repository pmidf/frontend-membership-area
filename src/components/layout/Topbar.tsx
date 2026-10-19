import Image from "next/image";
import Link from "next/link";
import { Tag } from "@/components/ui/Tag";
import { iniciais, type Usuario } from "@/lib/sessao";
import styles from "./Topbar.module.css";

type TopbarProps = {
  titulo: string;
  /** Título mais curto exibido no mobile (ex.: "Evento" no detalhe). */
  tituloMobile?: string;
  usuario: Usuario | null;
};

export function Topbar({ titulo, tituloMobile, usuario }: TopbarProps) {
  return (
    <header className={styles.topbar}>
      {tituloMobile ? (
        <p className={styles.titulo}>
          <span className={styles.somenteDesktop}>{titulo}</span>
          <span className={styles.somenteMobile}>{tituloMobile}</span>
        </p>
      ) : (
        <p className={styles.titulo}>{titulo}</p>
      )}

      {usuario ? (
        <div className={styles.acoes}>
          <button type="button" className={styles.notificacoes} aria-label="Notificações">
            <Image src="/icons/notificacoes.svg" alt="" width={20} height={20} />
          </button>
          <div className={styles.usuario}>
            <span className={styles.avatar} aria-hidden>
              {iniciais(usuario.nome)}
            </span>
            <div className={styles.identificacao}>
              <p className={styles.nome}>{usuario.nome}</p>
              <Tag variante={usuario.statusFiliacao === "filiado" ? "aqua" : "neutra"}>
                {usuario.statusFiliacao === "filiado" ? "Filiado ativo" : "Não filiado"}
              </Tag>
            </div>
          </div>
        </div>
      ) : (
        <Link href="#" className={styles.entrar}>
          Entrar
        </Link>
      )}
    </header>
  );
}
