import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { Topbar } from "@/components/layout/Topbar";
import { obterAdminAtual } from "@/lib/sessao";
import { jaAconteceu } from "@/features/agenda/lib/regras";
import { obterEvento } from "@/features/agenda/services/agenda-service";
import { PainelParticipantes } from "@/features/agenda-admin/components/PainelParticipantes";
import styles from "@/features/agenda-admin/components/admin.module.css";
import { participantesComVinculo } from "@/features/agenda-admin/dados";
import { montarLinhasParticipantes } from "@/features/agenda-admin/linhas-participantes";
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
  const agora = new Date();
  const evento = await obterEvento(id);
  if (!evento) notFound();

  const participantes = await participantesComVinculo(evento, agora);
  const ativos = participantes.filter((p) => !p.cancelado);
  const porTipo = new Map<string, number>();
  for (const p of ativos) porTipo.set(p.tipoIngresso, (porTipo.get(p.tipoIngresso) ?? 0) + 1);

  return (
    <>
      <header className={styles.cabecalho}>
        <h1 className={styles.titulo}>{evento.titulo} · Participantes</h1>
        <p className={styles.contador}>
          {formatarNumero(ativos.length)} inscritos
          {participantes.length > ativos.length && ` · ${participantes.length - ativos.length} cancelados`}
        </p>
      </header>
      <PainelParticipantes
        eventoId={evento.id}
        linhas={montarLinhasParticipantes(participantes)}
        porTipo={[...porTipo].map(([tipo, inscritos]) => ({ tipo, inscritos })).sort((a, b) => b.inscritos - a.inscritos)}
        encerrado={jaAconteceu(evento, agora)}
      />
    </>
  );
}
