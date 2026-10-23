import Link from "next/link";
import { Tag } from "@/components/ui/Tag";
import { formatarDiaSemana, formatarFaixaHorario, seloData } from "../lib/datas";
import { aceitaInscricao, formatoDoEvento, jaAconteceu, rotuloFormato, rotuloParticipacao } from "../lib/regras";
import type { EventoComParticipacao, StatusParticipacao } from "../types";
import styles from "./ItemEvento.module.css";

const CLASSE_STATUS: Record<StatusParticipacao, string> = {
  inscrito: styles.statusMarca,
  presente: styles.statusAqua,
  ausente: styles.statusNeutro,
};

type ItemEventoProps = {
  evento: EventoComParticipacao;
  agora: Date;
};

export function ItemEvento({ evento, agora }: ItemEventoProps) {
  const { dia, mes } = seloData(evento.inicio);
  const encerrado = jaAconteceu(evento, agora);
  const formato = rotuloFormato(formatoDoEvento(evento));
  const participacao = rotuloParticipacao(evento);

  const subtitulo = encerrado
    ? [formato, evento.endereco?.nome].filter(Boolean).join(" · ")
    : `${formatarDiaSemana(evento.inicio)}, ${formatarFaixaHorario(evento.inicio, evento.fim)} · ${formato}`;

  const acao = encerrado ? null : aceitaInscricao(evento, agora) && !evento.participacao ? "Inscrever-se" : "Ver detalhes";

  // No mobile, selo e ação viram uma única linha de texto sob o título.
  const statusMobile = evento.cancelado
    ? { texto: "Cancelado", classe: styles.statusErro }
    : participacao && evento.participacao
      ? { texto: participacao, classe: CLASSE_STATUS[evento.participacao] }
      : acao
        ? { texto: acao, classe: styles.statusMarca }
        : null;

  return (
    <li>
      <Link href={`/agenda/${evento.id}`} className={styles.item}>
        <span className={`${styles.data} ${encerrado || evento.cancelado ? styles.dataApagada : ""}`}>
          <span className={styles.dia}>{dia}</span>
          <span className={styles.mes}>{mes}</span>
        </span>

        <span className={styles.texto}>
          <span className={styles.titulo}>{evento.titulo}</span>
          <span className={styles.subtitulo}>{subtitulo}</span>
          {statusMobile && <span className={`${styles.statusMobile} ${statusMobile.classe}`}>{statusMobile.texto}</span>}
        </span>

        <span className={styles.acoes}>
          {evento.cancelado && <Tag variante="erro">Cancelado</Tag>}
          {!evento.cancelado && participacao && (
            <Tag variante={evento.participacao === "ausente" ? "neutra" : "aqua"}>{participacao}</Tag>
          )}
          {acao && <span className={styles.acao}>{acao}</span>}
        </span>
      </Link>
    </li>
  );
}
