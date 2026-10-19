import Link from "next/link";
import { Card, CardTitulo } from "@/components/ui/Card";
import styles from "./page.module.css";

export default function EventoNaoEncontrado() {
  return (
    <div className={styles.conteudo}>
      <Card>
        <CardTitulo>Evento não encontrado</CardTitulo>
        <p className={styles.info}>O evento pode ter sido removido do Sympla ou o endereço está incorreto.</p>
        <Link href="/agenda" className={styles.voltar}>
          ‹ Voltar para a agenda
        </Link>
      </Card>
    </div>
  );
}
