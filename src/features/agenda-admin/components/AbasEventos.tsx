import Link from "next/link";
import styles from "./admin.module.css";

export type AbaEventos = "eventos" | "numeros" | "conciliacao";

const ABAS: { id: AbaEventos; rotulo: string; href: string }[] = [
  { id: "eventos", rotulo: "Eventos", href: "/admin/eventos" },
  { id: "numeros", rotulo: "Números", href: "/admin/eventos/numeros" },
  { id: "conciliacao", rotulo: "Conciliação", href: "/admin/eventos/conciliacao" },
];

export function AbasEventos({ ativa }: { ativa: AbaEventos }) {
  return (
    <nav className={styles.abas} aria-label="Seções de eventos">
      {ABAS.map((aba) => (
        <Link
          key={aba.id}
          href={aba.href}
          className={`${styles.aba} ${aba.id === ativa ? styles.abaAtiva : ""}`}
          aria-current={aba.id === ativa ? "page" : undefined}
        >
          {aba.rotulo}
        </Link>
      ))}
    </nav>
  );
}
