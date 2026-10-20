import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { Topbar } from "@/components/layout/Topbar";
import { obterAdminAtual } from "@/lib/sessao";
import { lerEstado } from "@/features/agenda-admin/armazenamento";
import { AbasEventos } from "@/features/agenda-admin/components/AbasEventos";
import { PainelNumeros } from "@/features/agenda-admin/components/PainelNumeros";
import styles from "@/features/agenda-admin/components/admin.module.css";
import { eventosDoPeriodo, lerPeriodoAdmin, numerosDosEventos } from "@/features/agenda-admin/dados";
import { formatarDataHora } from "@/features/agenda-admin/formatacao";
import { montarLinhas } from "@/features/agenda-admin/linhas-numeros";
import { DIAS_RECENTES } from "@/features/agenda-admin/periodo";

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
            Visão analítica dos eventos sincronizados: totais, participação e exportação.
          </p>
        </header>
        <AbasEventos ativa="numeros" />

        {/* Sem cache, os números consultam os participantes de cada evento no Sympla: pode levar alguns segundos. */}
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
  const agora = new Date();
  const periodo = lerPeriodoAdmin(params.periodo);

  const [eventos, estado] = await Promise.all([eventosDoPeriodo(periodo, agora), lerEstado()]);
  const numeros = await numerosDosEventos(eventos, agora);
  const ultima = estado.execucoes.find((e) => e.tipo === "participantes" && e.status === "concluida");

  return (
    <PainelNumeros
      linhas={montarLinhas(eventos, numeros)}
      categorias={[...new Set(eventos.map((e) => e.categoria))].sort((a, b) => a.localeCompare(b, "pt-BR"))}
      periodo={periodo}
      rotuloPeriodo={periodo === "12m" ? "Últimos 12 meses" : `Últimos ${DIAS_RECENTES} dias e próximos`}
      ultimaSincronizacao={ultima ? formatarDataHora(ultima.inicio) : null}
    />
  );
}
