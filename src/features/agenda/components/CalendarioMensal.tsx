import Link from "next/link";
import { chaveDia } from "../lib/datas";
import type { EventoComParticipacao } from "../types";
import { ItemEvento } from "./ItemEvento";
import styles from "./CalendarioMensal.module.css";

type CalendarioMensalProps = {
  /** Mês exibido, "AAAA-MM". */
  mes: string;
  eventos: EventoComParticipacao[];
  agora: Date;
  /** Monta o link para outro mês preservando os filtros da URL. */
  hrefMes: (mes: string) => string;
};

const DIAS_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const DIAS_SEMANA_MOBILE = ["D", "S", "T", "Q", "Q", "S", "S"];
const NOMES_MESES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

type Celula = { chave: string; dia: number; doMes: boolean };

function deslocarMes(ano: number, mes: number, delta: number) {
  const data = new Date(Date.UTC(ano, mes - 1 + delta, 1));
  return `${data.getUTCFullYear()}-${String(data.getUTCMonth() + 1).padStart(2, "0")}`;
}

function chave(data: Date) {
  return data.toISOString().slice(0, 10);
}

/** Semanas (domingo a sábado) que cobrem o mês, completando com dias dos meses vizinhos. */
function montarSemanas(ano: number, mes: number): Celula[][] {
  const primeiro = new Date(Date.UTC(ano, mes - 1, 1));
  const inicio = new Date(primeiro);
  inicio.setUTCDate(1 - primeiro.getUTCDay());

  const ultimo = new Date(Date.UTC(ano, mes, 0));
  const fim = new Date(ultimo);
  fim.setUTCDate(ultimo.getUTCDate() + (6 - ultimo.getUTCDay()));

  const semanas: Celula[][] = [];
  for (const cursor = inicio; cursor <= fim; cursor.setUTCDate(cursor.getUTCDate() + 1)) {
    if (cursor.getUTCDay() === 0) semanas.push([]);
    semanas[semanas.length - 1].push({
      chave: chave(cursor),
      dia: cursor.getUTCDate(),
      doMes: cursor.getUTCMonth() === mes - 1,
    });
  }
  return semanas;
}

export function CalendarioMensal({ mes, eventos, agora, hrefMes }: CalendarioMensalProps) {
  const [ano, numeroMes] = mes.split("-").map(Number);
  const semanas = montarSemanas(ano, numeroMes);
  const titulo = `${NOMES_MESES[numeroMes - 1]} ${ano}`;

  const doMes = [...eventos].sort((a, b) => new Date(a.inicio).getTime() - new Date(b.inicio).getTime());
  const eventosPorDia = new Map<string, EventoComParticipacao[]>();
  for (const evento of doMes) {
    const dia = chaveDia(evento.inicio);
    eventosPorDia.set(dia, [...(eventosPorDia.get(dia) ?? []), evento]);
  }

  return (
    <section className={styles.calendario} aria-labelledby="titulo-mes">
      <div className={styles.navegacao}>
        <Link href={hrefMes(deslocarMes(ano, numeroMes, -1))} className={styles.botaoMes} scroll={false} aria-label="Mês anterior">
          ‹
        </Link>
        <h2 id="titulo-mes" className={styles.tituloMes} aria-live="polite">
          {titulo}
        </h2>
        <Link href={hrefMes(deslocarMes(ano, numeroMes, 1))} className={styles.botaoMes} scroll={false} aria-label="Próximo mês">
          ›
        </Link>
      </div>

      {/* Desktop: grade com o título de cada evento no dia. */}
      <div className={styles.rolagem}>
        <table className={styles.grade}>
          <thead>
            <tr>
              {DIAS_SEMANA.map((dia) => (
                <th key={dia} scope="col">
                  {dia}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {semanas.map((semana) => (
              <tr key={semana[0].chave}>
                {semana.map((celula) => {
                  const doDia = celula.doMes ? (eventosPorDia.get(celula.chave) ?? []) : [];
                  const classesDia = [
                    styles.numeroDia,
                    !celula.doMes && styles.foraDoMes,
                    doDia.length > 0 && styles.comEvento,
                  ]
                    .filter(Boolean)
                    .join(" ");
                  return (
                    <td key={celula.chave}>
                      <span className={classesDia}>{celula.dia}</span>
                      {doDia.map((evento) => (
                        <Link
                          key={evento.id}
                          href={`/agenda/${evento.id}`}
                          className={`${styles.pilula} ${evento.cancelado ? styles.cancelado : ""}`}
                          title={evento.cancelado ? `${evento.titulo} (cancelado)` : evento.titulo}
                        >
                          {evento.cancelado && <span className="visually-hidden">Cancelado: </span>}
                          <span className={styles.tituloPilula}>{evento.titulo}</span>
                        </Link>
                      ))}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile: grade compacta com um ponto nos dias com evento e a lista do mês logo abaixo. */}
      <div className={styles.gradeMobile}>
        <div className={styles.linhaMobile}>
          {DIAS_SEMANA_MOBILE.map((dia, i) => (
            <span key={i} aria-hidden className={styles.diaSemanaMobile}>
              {dia}
            </span>
          ))}
        </div>
        {semanas.map((semana) => (
          <div key={semana[0].chave} className={styles.linhaMobile}>
            {semana.map((celula) => {
              const doDia = celula.doMes ? (eventosPorDia.get(celula.chave) ?? []) : [];
              const classes = [styles.celulaMobile, !celula.doMes && styles.foraDoMesMobile].filter(Boolean).join(" ");
              if (doDia.length === 0) {
                return (
                  <span key={celula.chave} className={classes}>
                    {celula.dia}
                  </span>
                );
              }
              // Um evento no dia abre o detalhe; mais de um leva à lista do mês.
              const destino = doDia.length === 1 ? `/agenda/${doDia[0].id}` : "#eventos-do-mes";
              return (
                <Link
                  key={celula.chave}
                  href={destino}
                 
                  className={`${classes} ${styles.comEventoMobile}`}
                  aria-label={`${celula.dia}: ${doDia.map((e) => e.titulo).join(", ")}`}
                >
                  {celula.dia}
                  <span className={styles.ponto} aria-hidden />
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      <div className={styles.listaMobile} id="eventos-do-mes">
        <h3 className={styles.tituloLista}>Eventos em {NOMES_MESES[numeroMes - 1].toLowerCase()}</h3>
        {eventos.length > 0 && (
          <ul className={styles.lista}>
            {doMes.map((evento) => (
              <ItemEvento key={evento.id} evento={evento} agora={agora} />
            ))}
          </ul>
        )}
      </div>

      {eventos.length === 0 && <p className={styles.vazio}>Nenhum evento neste mês com os filtros selecionados.</p>}
    </section>
  );
}
