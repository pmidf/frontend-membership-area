import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { Topbar } from "@/components/layout/Topbar";
import { obterAdminAtual } from "@/lib/sessao";
import { AbasEventos } from "@/features/agenda-admin/components/AbasEventos";
import { PainelNumeros } from "@/features/agenda-admin/components/PainelNumeros";
import styles from "@/features/agenda-admin/components/admin.module.css";
import { eventosComNumeros } from "@/features/agenda-admin/api";
import { DIAS_RECENTES, lerPeriodoAdmin } from "@/features/agenda-admin/periodo";

export const metadata: Metadata = { title: "Eventos · Números" };

export default async function AdminNumerosPage({ searchParams }: PageProps<"/admin/eventos/numeros">) {
  const admin = await obterAdminAtual();

  return (
    <>
      <Topbar titulo="Eventos" usuario={admin} selo={{ texto: admin.papel, variante: "violeta" }} />
      <div className={styles.conteudo}>
        <header className={styles.cabecalhoTexto}>
          <h1 className={styles.titulo}>Eventos · Números</h1>
          <p className={styles.subtitulo}>
            Visão analítica dos eventos do Sympla: totais, participação e exportação.
          </p>
        </header>
        <AbasEventos ativa="numeros" />

        <Suspense fallback={<p className={styles.texto}>Calculando os números dos eventos…</p>}>
          <Conteudo searchParams={searchParams} />
        </Suspense>
      </div>
    </>
  );
}

async function Conteudo({ searchParams }: { searchParams: PageProps<"/admin/eventos/numeros">["searchParams"] }) {
  const params = await searchParams;
  await connection();
  const periodo = lerPeriodoAdmin(params.periodo);
  const { linhas, categorias } = await eventosComNumeros(periodo);

  return (
    <PainelNumeros
      linhas={linhas}
      categorias={categorias}
      periodo={periodo}
      rotuloPeriodo={periodo === "12m" ? "Últimos 12 meses" : `Últimos ${DIAS_RECENTES} dias e próximos`}
    />
  );
}
