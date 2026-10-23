import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { Topbar } from "@/components/layout/Topbar";
import { obterAdminAtual } from "@/lib/sessao";
import { ErroBackend } from "@/lib/backend";
import { participantesDoEvento } from "@/features/agenda-admin/api";
import { PainelParticipantes } from "@/features/agenda-admin/components/PainelParticipantes";
import styles from "@/features/agenda-admin/components/admin.module.css";
import { formatarNumero } from "@/features/agenda-admin/numeros";

export const metadata: Metadata = { title: "Eventos · Participantes" };

export default async function AdminParticipantesPage({ params }: PageProps<"/admin/eventos/[id]/participantes">) {
  const admin = await obterAdminAtual();

  return (
    <>
      <Topbar titulo="Eventos · participantes" usuario={admin} selo={{ texto: admin.papel, variante: "violeta" }} />
      <div className={styles.conteudo}>
        <Link href="/admin/eventos" className={styles.voltar}>
          ‹ Voltar para eventos
        </Link>
        <Suspense fallback={<p className={styles.texto}>Carregando participantes…</p>}>
          <Conteudo params={params} />
        </Suspense>
      </div>
    </>
  );
}

async function Conteudo({ params }: { params: PageProps<"/admin/eventos/[id]/participantes">["params"] }) {
  const { id } = await params;
  await connection();
  const dados = await participantesDoEvento(id).catch((erro: unknown) => {
    if (erro instanceof ErroBackend && erro.status === 404) notFound();
    throw erro;
  });
  const ativos = dados.participantes.filter((p) => !p.cancelado).length;
  const cancelados = dados.participantes.length - ativos;

  return (
    <>
      <header className={styles.cabecalho}>
        <h1 className={styles.titulo}>{dados.evento.titulo} · Participantes</h1>
        <p className={styles.contador}>
          {formatarNumero(ativos)} inscritos
          {cancelados > 0 && ` · ${formatarNumero(cancelados)} cancelados`}
        </p>
      </header>
      <PainelParticipantes
        eventoId={dados.evento.id}
        linhas={dados.participantes}
        porTipo={dados.porTipo}
        encerrado={dados.encerrado}
      />
    </>
  );
}
