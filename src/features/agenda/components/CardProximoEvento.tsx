import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Tag } from "@/components/ui/Tag";
import { classesBotao } from "@/components/ui/Button";
import type { EmailUsuario } from "@/lib/sessao";
import { formatarDataLonga, formatarFaixaHorario } from "../lib/datas";
import { formatoDoEvento, rotuloFormato, rotuloParticipacao } from "../lib/regras";
import type { EventoComParticipacao } from "../types";
import { BotaoInscricaoSympla } from "./BotaoInscricaoSympla";
import { ImagemEvento } from "./ImagemEvento";
import styles from "./CardProximoEvento.module.css";

type CardProximoEventoProps = {
  evento: EventoComParticipacao;
  emails: EmailUsuario[] | null;
};

export function CardProximoEvento({ evento, emails }: CardProximoEventoProps) {
  const local = evento.endereco ? `${evento.endereco.nome}, ${evento.endereco.logradouro}` : "Online";
  const participacao = rotuloParticipacao(evento);

  return (
    <Card as="article" destaque className={styles.card} aria-labelledby={`proximo-${evento.id}`}>
      <ImagemEvento src={evento.imagemUrl} className={styles.imagem} />

      <div className={styles.texto}>
        <div className={styles.selos}>
          <Tag variante="violeta">Próximo evento</Tag>
          <Tag>{rotuloFormato(formatoDoEvento(evento))}</Tag>
          {participacao && <Tag>{participacao}</Tag>}
        </div>

        <h2 id={`proximo-${evento.id}`} className={styles.titulo}>
          <Link href={`/agenda/${evento.id}`}>{evento.titulo}</Link>
        </h2>
        <p className={styles.info}>
          {formatarDataLonga(evento.inicio)} · {formatarFaixaHorario(evento.inicio, evento.fim)} · {local}
        </p>
        <p className={`${styles.info} ${styles.descricao}`}>{evento.descricao}</p>

        <div className={styles.acoes}>
          {evento.participacao ? (
            <Link href={`/agenda/${evento.id}`} className={classesBotao()}>
              Ver detalhes
            </Link>
          ) : (
            <BotaoInscricaoSympla urlSympla={evento.urlSympla} emails={emails} />
          )}
          <a href={`/api/agenda/${evento.id}/ics`} className={classesBotao({ tipo: "link" })} download>
            Adicionar ao meu calendário
          </a>
        </div>
      </div>
    </Card>
  );
}
