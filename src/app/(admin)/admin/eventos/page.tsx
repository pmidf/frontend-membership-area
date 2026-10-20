import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { Topbar } from "@/components/layout/Topbar";
import { obterAdminAtual } from "@/lib/sessao";
import { Card, CardTitulo } from "@/components/ui/Card";
import { Tag } from "@/components/ui/Tag";
import { formatarDataCurta } from "@/features/agenda/lib/datas";
import { atendeFiltros, formatoDoEvento, jaAconteceu, rotuloFormato } from "@/features/agenda/lib/regras";
import { symplaConfigurado } from "@/features/agenda/services/sympla/cliente";
import type { Evento, FormatoEvento } from "@/features/agenda/types";
import { lerEstado, type Execucao } from "@/features/agenda-admin/armazenamento";
import { sincronizarAgora } from "@/features/agenda-admin/acoes";
import { AbasEventos } from "@/features/agenda-admin/components/AbasEventos";
import { BotaoEnviar } from "@/features/agenda-admin/components/BotaoEnviar";
import { SeletorAutoEnvio, SeletorPeriodo } from "@/features/agenda-admin/components/SeletorPeriodo";
import styles from "@/features/agenda-admin/components/admin.module.css";
import {
  eventosDoPeriodo,
  lerPeriodoAdmin,
  numerosDosEventos,
  type PeriodoAdmin,
} from "@/features/agenda-admin/dados";
import { formatarNumero, type NumerosEvento } from "@/features/agenda-admin/numeros";
import { formatarDataHora } from "@/features/agenda-admin/formatacao";

export const metadata: Metadata = { title: "Eventos e sincronização" };

const POR_PAGINA = 30;

export default async function AdminEventosPage({ searchParams }: PageProps<"/admin/eventos">) {
  const admin = await obterAdminAtual();

  return (
    <>
      <Topbar titulo="Eventos" usuario={admin} selo={{ texto: admin.papel, variante: "violeta" }} />
      <div className={styles.conteudo}>
        <header className={styles.cabecalhoTexto}>
          <h1 className={styles.titulo}>Eventos</h1>
          <p className={styles.subtitulo}>
            O Sympla continua sendo a origem dos eventos e das inscrições. Aqui o capítulo acompanha a sincronização.
          </p>
        </header>
        <AbasEventos ativa="sincronizacao" />

        <Suspense fallback={<p className={styles.texto}>Carregando…</p>}>
          <Conteudo searchParams={searchParams} />
        </Suspense>
      </div>
    </>
  );
}

async function Conteudo({ searchParams }: { searchParams: PageProps<"/admin/eventos">["searchParams"] }) {
  const params = await searchParams;
  await connection();
  const agora = new Date();
  const periodo = lerPeriodoAdmin(params.periodo);
  const busca = typeof params.q === "string" ? params.q : undefined;
  const formato = params.formato === "online" || params.formato === "presencial" ? (params.formato as FormatoEvento) : undefined;
  const limite = Math.min(Math.max(Number(params.limite) || POR_PAGINA, POR_PAGINA), 500);

  const [estado, eventosPeriodo] = await Promise.all([lerEstado(), eventosDoPeriodo(periodo, agora)]);
  const filtrados = eventosPeriodo.filter((e) => atendeFiltros(e, { busca, formato }));
  const pagina = filtrados.slice(0, limite);

  return (
    <>
      <CardIntegracao execucoes={estado.execucoes} totalEventos={eventosPeriodo.length} periodo={periodo} />

      <Card aria-label="Eventos sincronizados">
        {/* Filtros na URL (GET): funcionam sem JavaScript e podem ser compartilhados. */}
        <form className={styles.filtros} role="search">
          <label className={styles.campoBusca}>
            <span className="visually-hidden">Buscar evento</span>
            <input name="q" type="search" placeholder="Buscar evento" defaultValue={busca} className={styles.busca} />
          </label>
          <label>
            <span className="visually-hidden">Formato</span>
            <SeletorAutoEnvio name="formato" defaultValue={formato ?? ""} className={styles.seletor}>
              <option value="">Formato</option>
              <option value="online">Online</option>
              <option value="presencial">Presencial</option>
            </SeletorAutoEnvio>
          </label>
          <SeletorPeriodo periodo={periodo} className={styles.seletor} />
          <button type="submit" className={styles.botaoFiltro}>
            Buscar
          </button>
        </form>

        <Suspense fallback={<TabelaEventos eventos={pagina} numeros={null} agora={agora} />}>
          <TabelaComNumeros eventos={pagina} agora={agora} />
        </Suspense>

        {filtrados.length > pagina.length && (
          <Link
            href={`/admin/eventos?${new URLSearchParams({ ...(params as Record<string, string>), limite: String(limite + POR_PAGINA) })}`}
            className={styles.link}
            scroll={false}
          >
            Ver mais eventos ({filtrados.length - pagina.length})
          </Link>
        )}
        <p className={styles.nota}>
          Eventos vêm do Sympla e são somente leitura: título, data e formato são corrigidos no Sympla e refletidos na
          próxima sincronização.
        </p>
      </Card>
    </>
  );
}

function CardIntegracao({
  execucoes,
  totalEventos,
  periodo,
}: {
  execucoes: Execucao[];
  totalEventos: number;
  periodo: PeriodoAdmin;
}) {
  const ultima = execucoes[0];
  const ultimaEventos = execucoes.find((e) => e.tipo === "eventos");
  const conectado = symplaConfigurado();
  const status = !conectado
    ? { texto: "Token não configurado", variante: "erro" as const }
    : ultimaEventos?.status === "falhou"
      ? { texto: "Com falha", variante: "erro" as const }
      : { texto: "Conectado", variante: "aqua" as const };

  return (
    <Card aria-labelledby="titulo-integracao">
      <div className={styles.cardCabecalho}>
        <div className={styles.cardCabecalhoTexto}>
          <CardTitulo id="titulo-integracao">Integração com o Sympla</CardTitulo>
          <p className={styles.texto}>
            Eventos e participantes se atualizam sozinhos a cada 1 hora · eventos encerrados há mais de 7 dias, a cada
            dia.
          </p>
        </div>
        <form action={sincronizarAgora} className={styles.acoes}>
          <Tag variante={status.variante}>{status.texto}</Tag>
          <BotaoEnviar tipo="secundaria" enviando="Sincronizando…">
            Sincronizar agora
          </BotaoEnviar>
        </form>
      </div>

      <div className={styles.indicadores}>
        <Indicador valor={ultima ? formatarDataHora(ultima.inicio) : "—"} rotulo="Última sincronização manual" />
        <Indicador valor="A cada 1 h" rotulo="Atualização automática" />
        <Indicador valor={formatarNumero(totalEventos)} rotulo={`Eventos sincronizados (${periodo === "12m" ? "12 meses" : "90 dias e próximos"})`} />
        <Indicador
          valor={ultimaEventos?.detalhe ? `${ultimaEventos.detalhe.criados} · ${ultimaEventos.detalhe.atualizados} · ${ultimaEventos.detalhe.cancelados}` : "—"}
          rotulo="Criados · atualizados · cancelados"
        />
      </div>

      <h3 className={styles.subtituloCard}>Últimas execuções</h3>
      {execucoes.length === 0 ? (
        <p className={styles.texto}>Nenhuma sincronização manual registrada ainda.</p>
      ) : (
        <div className={styles.rolagem}>
          <table className={styles.tabela}>
            <thead>
              <tr>
                <th>Execução</th>
                <th>Tipo</th>
                <th className={styles.numero}>Registros lidos</th>
                <th className={styles.numero}>Novos ou alterados</th>
                <th className={styles.numero}>Erros</th>
                <th>Duração</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {execucoes.slice(0, 8).map((execucao) => (
                <tr key={execucao.id}>
                  <td>{formatarDataHora(execucao.inicio, true)}</td>
                  <td>{execucao.tipo === "eventos" ? "Eventos" : "Participantes"}</td>
                  <td className={styles.numero}>{formatarNumero(execucao.lidos)}</td>
                  <td className={styles.numero}>{formatarNumero(execucao.novosOuAlterados)}</td>
                  <td className={styles.numero}>
                    {execucao.erros}
                    {execucao.mensagemErro && <span className={styles.secundario}>{execucao.mensagemErro}</span>}
                  </td>
                  <td>{(execucao.duracaoMs / 1000).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} s</td>
                  <td>
                    <Tag variante={execucao.status === "concluida" ? "aqua" : "erro"}>
                      {execucao.status === "concluida" ? "Concluída" : "Falhou"}
                    </Tag>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}

function Indicador({ valor, rotulo }: { valor: string; rotulo: string }) {
  return (
    <div className={styles.indicador}>
      <span className={styles.indicadorValor}>{valor}</span>
      <span className={styles.indicadorRotulo}>{rotulo}</span>
    </div>
  );
}

async function TabelaComNumeros({ eventos, agora }: { eventos: Evento[]; agora: Date }) {
  return <TabelaEventos eventos={eventos} numeros={await numerosDosEventos(eventos, agora)} agora={agora} />;
}

function TabelaEventos({
  eventos,
  numeros,
  agora,
}: {
  eventos: Evento[];
  numeros: Map<string, NumerosEvento> | null;
  agora: Date;
}) {
  if (eventos.length === 0) return <p className={styles.vazio}>Nenhum evento encontrado.</p>;

  return (
    <div className={styles.rolagem}>
      <table className={styles.tabela}>
        <thead>
          <tr>
            <th className={styles.colunaEvento}>Evento</th>
            <th>Data</th>
            <th>Formato</th>
            <th>Situação</th>
            <th>Participações</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {eventos.map((evento) => (
            <tr key={evento.id}>
              <td>
                {evento.titulo}
                <span className={styles.secundario}>sympla_event_id {evento.id}</span>
              </td>
              <td>{formatarDataCurta(evento.inicio)}</td>
              <td>{rotuloFormato(formatoDoEvento(evento))}</td>
              <td>
                {evento.cancelado ? (
                  <Tag variante="erro">Cancelado</Tag>
                ) : jaAconteceu(evento, agora) ? (
                  <Tag variante="neutra">Encerrado</Tag>
                ) : (
                  <Tag>Ativo</Tag>
                )}
              </td>
              <td>
                <Participacoes
                  numeros={numeros?.get(evento.id)}
                  carregando={numeros === null}
                  encerrado={jaAconteceu(evento, agora) && !evento.cancelado}
                />
              </td>
              <td>
                <Link href={`/admin/eventos/${evento.id}/participantes`} className={styles.link}>
                  Ver participantes
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Participacoes({
  numeros,
  carregando,
  encerrado,
}: {
  numeros?: NumerosEvento;
  carregando: boolean;
  encerrado: boolean;
}) {
  if (carregando) return <span className={styles.carregando}>…</span>;
  if (!numeros || numeros.indisponivel) return <span className={styles.erro}>Indisponível</span>;
  return encerrado ? (
    <>
      {formatarNumero(numeros.inscritos)} · {formatarNumero(numeros.presentes)} presentes
    </>
  ) : (
    <>{formatarNumero(numeros.inscritos)} inscritos</>
  );
}
