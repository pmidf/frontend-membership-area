import Image from "next/image";
import Link from "next/link";
import styles from "./SidebarAdmin.module.css";

// Só "Eventos" está implementado; os demais módulos do console aparecem desabilitados até existirem.
const ITENS: { rotulo: string; href?: string; icone: string; ativo?: boolean }[] = [
  { rotulo: "Visão geral", icone: "visao-geral" },
  { rotulo: "Pessoas", icone: "pessoas" },
  { rotulo: "Voluntários e organograma", icone: "voluntarios" },
  { rotulo: "Benefícios", icone: "beneficios" },
  { rotulo: "Eventos", href: "/admin/eventos", icone: "eventos", ativo: true },
  { rotulo: "Conteúdo", icone: "conteudo" },
  { rotulo: "Vagas", icone: "vagas" },
  { rotulo: "Badges e submissões", icone: "badges" },
  { rotulo: "Auditoria", icone: "auditoria" },
];

export function SidebarAdmin() {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.topo}>
        <Link href="/admin/eventos" className={styles.logo}>
          <Image src="/brand/logo-pmi-df.png" alt="PMI Distrito Federal" width={160} height={44} priority />
        </Link>
        <p className={styles.rotulo}>CONSOLE ADMINISTRATIVO</p>
        <nav aria-label="Console administrativo">
          <ul className={styles.navegacao}>
            {ITENS.map((item) => (
              <li key={item.rotulo}>
                {item.href ? (
                  <Link
                    href={item.href}
                    className={`${styles.item} ${item.ativo ? styles.ativo : ""}`}
                    aria-current={item.ativo ? "page" : undefined}
                  >
                    <Image src={`/icons/admin/${item.icone}.svg`} alt="" width={20} height={20} />
                    <span>{item.rotulo}</span>
                  </Link>
                ) : (
                  <span className={`${styles.item} ${styles.desabilitado}`} aria-disabled="true" title="Em breve">
                    <Image src={`/icons/admin/${item.icone}.svg`} alt="" width={20} height={20} />
                    <span>{item.rotulo}</span>
                  </span>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <Link href="/agenda" className={styles.voltar}>
        <Image src="/icons/admin/voltar.svg" alt="" width={20} height={20} />
        <span>Voltar à área do membro</span>
      </Link>
    </aside>
  );
}
