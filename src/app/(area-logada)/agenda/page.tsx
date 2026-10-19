import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { Topbar } from "@/components/layout/Topbar";
import { Card, CardTitulo } from "@/components/ui/Card";
import { emailsVerificados, obterUsuarioAtual, type Usuario } from "@/lib/sessao";
import { AgendaFiltros } from "@/features/agenda/components/AgendaFiltros";
import { CalendarioMensal } from "@/features/agenda/components/CalendarioMensal";
import { CardProximoEvento } from "@/features/agenda/components/CardProximoEvento";
import { ComParticipacao } from "@/features/agenda/components/ComParticipacao";
import { ItemEvento } from "@/features/agenda/components/ItemEvento";
import { chaveDia, chaveMesAtual } from "@/features/agenda/lib/datas";
import {
  PAGINA_PASSADOS,
  haFiltrosAtivos,
  lerFiltros,
  lerLimite,
  lerMes,
  lerVisao,
} from "@/features/agenda/lib/parametros";
import {
  atendeFiltros,
  eventosRecentesEncerrados,
  filtrarParaLista,
  visivelNaAgenda,
} from "@/features/agenda/lib/regras";
import { listarCategorias, listarEventos } from "@/features/agenda/services/agenda-service";
import type { Evento, EventoComParticipacao, FiltrosAgenda } from "@/features/agenda/types";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Agenda de eventos",
};

const LIMITE_ENCERRADOS = 3;

export default async function AgendaPage({ searchParams }: PageProps<"/agenda">) {
  const usuario = await obterUsuarioAtual();

  return (
    <>
      <Topbar titulo="Agenda de eventos" usuario={usuario} />

      <div className={styles.conteudo}>
        <header className={styles.cabecalho}>
          <h1 className={styles.titulo}>Agenda de eventos</h1>
          <p className={styles.subtitulo}>
            Os eventos vêm do Sympla e sua presença entra automaticamente na sua trilha.
          </p>
        </header>

        {/* Filtros e visão vêm da URL: o conteúdo é renderizado na requisição. */}
        <Suspense fallback={<p className={styles.vazio}>Carregando eventos…</p>}>
          <ConteudoAgenda searchParams={searchParams} usuario={usuario} />
        </Suspense>
      </div>
    </>
  );
}

async function ConteudoAgenda({
  searchParams,
  usuario,
}: {
  searchParams: PageProps<"/agenda">["searchParams"];
  usuario: Usuario | null;
}) {
  const params = await searchParams;
  const visao = lerVisao(params);
  const filtros = lerFiltros(params);
  // A data atual define o que é "próximo" ou "encerrado": calcula na requisição, não no prerender.
  await connection();
  const agora = new Date();

  const [eventos, categorias] = await Promise.all([listarEventos(), listarCategorias()]);
  const emails = usuario ? emailsVerificados(usuario) : null;

  if (visao === "calendario") {
    const mes = lerMes(params) ?? chaveMesAtual(agora);
    const doMes = eventos.filter(
      (e) => visivelNaAgenda(e, agora) && atendeFiltros(e, filtros) && chaveDia(e.inicio).startsWith(mes),
    );

    return (
      <>
        <AgendaFiltros visao={visao} categorias={categorias} />
        <ComParticipacao eventos={doMes} usuario={usuario} agora={agora}>
          {(comStatus) => (
            <CalendarioMensal mes={mes} eventos={comStatus} agora={agora} hrefMes={(m) => hrefCom(params, { mes: m })} />
          )}
        </ComParticipacao>
      </>
    );
  }

  const grupos = montarGrupos(eventos, filtros, agora, lerLimite(params));
  const visiveis = [
    ...(grupos.destaque ? [grupos.destaque] : []),
    ...grupos.proximos,
    ...grupos.encerrados,
    ...grupos.passados,
  ];

  return (
    <>
      <AgendaFiltros visao={visao} categorias={categorias} />
      <ComParticipacao eventos={visiveis} usuario={usuario} agora={agora}>
        {(comStatus) => (
          <VisaoLista
            grupos={grupos}
            comStatus={comStatus}
            filtrosAtivos={haFiltrosAtivos(filtros)}
            periodoPassados={filtros.periodo === "passados"}
            hrefVerMais={hrefCom(params, { limite: String(lerLimite(params) + PAGINA_PASSADOS) })}
            emails={emails}
            autenticado={Boolean(usuario)}
            agora={agora}
          />
        )}
      </ComParticipacao>
    </>
  );
}

type Eventos = EventoComParticipacao[];
/** Link para a própria agenda trocando alguns parâmetros e mantendo os demais filtros. */
function hrefCom(params: Record<string, string | string[] | undefined>, mudancas: Record<string, string>) {
  const query = new URLSearchParams();
  for (const [chave, valor] of Object.entries(params)) {
    if (typeof valor === "string") query.set(chave, valor);
  }
  for (const [chave, valor] of Object.entries(mudancas)) query.set(chave, valor);
  return `/agenda?${query.toString()}`;
}

type Grupos = {
  destaque?: Evento;
  proximos: Evento[];
  encerrados: Evento[];
  passados: Evento[];
  haMaisPassados: boolean;
};

/** Separa o que cada seção da lista exibe — e, portanto, os únicos eventos cuja participação é consultada. */
function montarGrupos(eventos: Evento[], filtros: FiltrosAgenda, agora: Date, limite: number): Grupos {
  const filtrados = filtrarParaLista(eventos, filtros, agora);

  if (filtros.periodo === "passados") {
    return {
      proximos: [],
      encerrados: [],
      passados: filtrados.slice(0, limite),
      haMaisPassados: filtrados.length > limite,
    };
  }

  const filtrosAtivos = haFiltrosAtivos(filtros);
  // O destaque é o próximo evento ativo; cancelados ficam só na lista com a marca "Cancelado".
  const destaque = filtrosAtivos ? undefined : filtrados.find((e) => !e.cancelado);
  return {
    destaque,
    proximos: filtrados.filter((e) => e !== destaque),
    encerrados: filtrosAtivos ? [] : eventosRecentesEncerrados(eventos, LIMITE_ENCERRADOS, agora),
    passados: [],
    haMaisPassados: false,
  };
}

function VisaoLista({
  grupos,
  comStatus,
  filtrosAtivos,
  periodoPassados,
  hrefVerMais,
  emails,
  autenticado,
  agora,
}: {
  grupos: Grupos;
  comStatus: Eventos;
  filtrosAtivos: boolean;
  periodoPassados: boolean;
  hrefVerMais: string;
  emails: ReturnType<typeof emailsVerificados> | null;
  autenticado: boolean;
  agora: Date;
}) {
  const porId = new Map(comStatus.map((e) => [e.id, e]));
  const status = (eventos: Evento[]) => eventos.map((e) => porId.get(e.id) ?? { ...e, participacao: null });

  if (periodoPassados) {
    return (
      <Card aria-labelledby="titulo-passados" className={styles.secao}>
        <CardTitulo id="titulo-passados">Eventos passados</CardTitulo>
        <ListaOuVazio
          eventos={status(grupos.passados)}
          agora={agora}
          vazio="Nenhum evento encerrado com os filtros selecionados."
        />
        {grupos.haMaisPassados && (
          <Link href={hrefVerMais} className={styles.verTodos} scroll={false}>
            Ver mais eventos passados
          </Link>
        )}
      </Card>
    );
  }

  const [destaque] = grupos.destaque ? status([grupos.destaque]) : [];

  return (
    <>
      {destaque && <CardProximoEvento evento={destaque} emails={emails} />}

      <Card aria-labelledby="titulo-proximos" className={styles.secao}>
        <CardTitulo id="titulo-proximos">{filtrosAtivos ? "Eventos encontrados" : "Próximos eventos"}</CardTitulo>
        <ListaOuVazio
          eventos={status(grupos.proximos)}
          agora={agora}
          vazio={filtrosAtivos ? "Nenhum evento encontrado com os filtros selecionados." : "Nenhum outro evento agendado por enquanto."}
        />
      </Card>

      {grupos.encerrados.length > 0 && (
        <Card aria-labelledby="titulo-encerrados" className={styles.secao}>
          <CardTitulo id="titulo-encerrados">Eventos que já aconteceram</CardTitulo>
          {autenticado && (
            <p className={styles.descricaoCard}>
              Sua presença confirmada aparece aqui e conta pontos no ranking de engajamento.
            </p>
          )}
          <ListaOuVazio eventos={status(grupos.encerrados)} agora={agora} vazio="" />
          <Link href="/agenda?periodo=passados" className={styles.verTodos}>
            Ver todos os eventos passados
          </Link>
        </Card>
      )}
    </>
  );
}

function ListaOuVazio({ eventos, agora, vazio }: { eventos: Eventos; agora: Date; vazio: string }) {
  if (eventos.length === 0) return <p className={styles.vazio}>{vazio}</p>;
  return (
    <ul className={styles.lista}>
      {eventos.map((evento) => (
        <ItemEvento key={evento.id} evento={evento} agora={agora} />
      ))}
    </ul>
  );
}
