"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

import { EstadoVazio } from "@/shared/ui/estado/EstadoVazio";

import { eventoNaoEncontrado, useParticipantesDoEvento } from "../api/agenda-admin.queries";
import { formatarNumero } from "../numeros";
import { EstadoConsulta } from "./EstadoConsulta";
import { PainelParticipantes } from "./PainelParticipantes";
import styles from "./admin.module.css";

export function PaginaParticipantesAdmin() {
  const { id: eventoId } = useParams<{ id: string }>();
  const participantes = useParticipantesDoEvento(eventoId);

  return (
    <div className={styles.conteudo}>
      <Link href="/admin/eventos" className={styles.voltar}>
        ‹ Voltar para eventos
      </Link>
      {eventoNaoEncontrado(participantes.error) ? (
        <EstadoVazio
          titulo="Evento não encontrado"
          descricao="Este evento não existe no Sympla ou não está mais disponível."
        />
      ) : (
        <EstadoConsulta consulta={participantes} carregando="Carregando participantes…">
          {(dados) => {
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
          }}
        </EstadoConsulta>
      )}
    </div>
  );
}
