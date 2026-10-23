import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { Topbar } from "@/components/layout/Topbar";
import { obterAdminAtual } from "@/lib/sessao";
import { Card, CardTitulo } from "@/components/ui/Card";
import { Tag } from "@/components/ui/Tag";
import { formatarDataCurta } from "@/features/agenda/lib/datas";
import { rotuloFormato } from "@/features/agenda/lib/regras";
import type { FormatoEvento } from "@/features/agenda/types";
import { atualizarAgora } from "@/features/agenda-admin/acoes";
import { eventosComNumeros } from "@/features/agenda-admin/api";
import { AbasEventos } from "@/features/agenda-admin/components/AbasEventos";
import { BotaoEnviar } from "@/features/agenda-admin/components/BotaoEnviar";
import { SeletorAutoEnvio, SeletorPeriodo } from "@/features/agenda-admin/components/SeletorPeriodo";
import styles from "@/features/agenda-admin/components/admin.module.css";
import { filtrarLinhas, type LinhaNumeros } from "@/features/agenda-admin/linhas-numeros";
import { formatarNumero } from "@/features/agenda-admin/numeros";
import { lerPeriodoAdmin, type PeriodoAdmin } from "@/features/agenda-admin/periodo";

export const metadata: Metadata = { title: "Eventos" };

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
            O Sympla é a origem dos eventos e das inscrições. Aqui o capítulo acompanha os eventos e as participações.
          </p>
        </header>
        <AbasEventos ativa="eventos" />

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
  const periodo = lerPeriodoAdmin(params.periodo);
  const busca = typeof params.q === "string" ? params.q : undefined;
  const formato =
    params.formato === "online" || params.formato === "presencial" ? (params.formato as FormatoEvento) : undefined;
  const limite = Math.min(Math.max(Number(params.limite) || POR_PAGINA, POR_PAGINA), 500);

  const { linhas } = await eventosComNumeros(periodo);
  const filtradas = filtrarLinhas(linhas, { busca, formato });
  const pagina = filtradas.slice(0, limite);

  return (
    <>
      <CardIntegracao totalEventos={linhas.length} periodo={periodo} />

      <Card aria-label="Eventos do Sympla">
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

        <TabelaEventos linhas={pagina} />

        {filtradas.length > pagina.length && (
          <Link
            href={`/admin/eventos?${new URLSearchParams({ ...(params as Record<string, string>), limite: String(limite + POR_PAGINA) })}`}
            className={styles.link}
            scroll={false}
          >
            Ver mais eventos ({filtradas.length - pagina.length})
          </Link>
        )}
        <p className={styles.nota}>
          Eventos vêm do Sympla e são somente leitura: título, data e formato são corrigidos no Sympla e aparecem aqui
          em até 5 minutos.
        </p>
      </Card>
    </>
  );
}

/** O backend lê o Sympla na hora e guarda cada leitura por alguns minutos; "Atualizar agora" descarta esse cache. */
function CardIntegracao({ totalEventos, periodo }: { totalEventos: number; periodo: PeriodoAdmin }) {
  return (
    <Card aria-labelledby="titulo-integracao">
      <div className={styles.cardCabecalho}>
        <div className={styles.cardCabecalhoTexto}>
          <CardTitulo id="titulo-integracao">Integração com o Sympla</CardTitulo>
          <p className={styles.texto}>
            Eventos e participantes são lidos direto do Sympla, com até 5 minutos de atraso. Use “Atualizar agora” para
            ver uma mudança feita no Sympla na hora.
          </p>
        </div>
        <form action={atualizarAgora} className={styles.acoes}>
          <Tag variante="aqua">Conectado</Tag>
          <BotaoEnviar tipo="secundaria" enviando="Atualizando…">
            Atualizar agora
          </BotaoEnviar>
        </form>
      </div>

      <div className={styles.indicadores}>
        <Indicador
          valor={formatarNumero(totalEventos)}
          rotulo={`Eventos no Sympla (${periodo === "12m" ? "12 meses" : "90 dias e próximos"})`}
        />
      </div>
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

function TabelaEventos({ linhas }: { linhas: LinhaNumeros[] }) {
  if (linhas.length === 0) return <p className={styles.vazio}>Nenhum evento encontrado.</p>;

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
          {linhas.map((l) => (
            <tr key={l.id}>
              <td>
                {l.titulo}
                <span className={styles.secundario}>sympla_event_id {l.id}</span>
              </td>
              <td>{formatarDataCurta(l.inicio)}</td>
              <td>{rotuloFormato(l.formato)}</td>
              <td>
                {l.cancelado ? (
                  <Tag variante="erro">Cancelado</Tag>
                ) : l.encerrado ? (
                  <Tag variante="neutra">Encerrado</Tag>
                ) : (
                  <Tag>Ativo</Tag>
                )}
              </td>
              <td>
                {l.encerrado && !l.cancelado
                  ? `${formatarNumero(l.inscritos)} · ${formatarNumero(l.presentes)} presentes`
                  : `${formatarNumero(l.inscritos)} inscritos`}
              </td>
              <td>
                <Link href={`/admin/eventos/${l.id}/participantes`} className={styles.link}>
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
