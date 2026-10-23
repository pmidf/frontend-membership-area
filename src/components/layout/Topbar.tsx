import { Tag, type TagVariante } from "@/components/ui/Tag";
import { iniciais, type Usuario } from "@/lib/sessao";
import styles from "./Topbar.module.css";

type TopbarProps = {
  titulo: string;
  /** Título mais curto exibido no mobile (ex.: "Evento" no detalhe). */
  tituloMobile?: string;
  usuario: (Pick<Usuario, "nome"> & Partial<Pick<Usuario, "statusFiliacao">>) | null;
  /** Substitui o selo de filiação (ex.: "Super admin" no console). */
  selo?: { texto: string; variante: TagVariante };
};

// TODO: notificações e o acesso "Entrar" entram na barra quando os módulos de notificação e login existirem.
export function Topbar({ titulo, tituloMobile, usuario, selo }: TopbarProps) {
  const seloExibido =
    selo ??
    (usuario?.statusFiliacao === "filiado"
      ? { texto: "Filiado ativo", variante: "aqua" as const }
      : { texto: "Não filiado", variante: "neutra" as const });

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

      {usuario && (
        <div className={styles.usuario}>
          <span className={styles.avatar} aria-hidden>
            {iniciais(usuario.nome)}
          </span>
          <div className={styles.identificacao}>
            <p className={styles.nome}>{usuario.nome}</p>
            <Tag variante={seloExibido.variante}>{seloExibido.texto}</Tag>
          </div>
        </div>
      )}
    </header>
  );
}
