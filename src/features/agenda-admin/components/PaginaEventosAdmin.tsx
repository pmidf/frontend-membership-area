"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";

import { Card, CardTitulo } from "@/components/ui/Card";
import { Tag } from "@/components/ui/Tag";
import { formatarDataCurta } from "@/features/agenda/lib/datas";
import { rotuloFormato } from "@/features/agenda/lib/regras";
import type { FormatoEvento } from "@/features/agenda/types";
import { useParametrosUrl } from "@/shared/hooks/useParametrosUrl";
import { useAvisos } from "@/shared/ui/aviso/useAvisos";

import { useAtualizarAgenda, useEventosComNumeros } from "../api/agenda-admin.queries";
import { filtrarLinhas, type LinhaNumeros } from "../linhas-numeros";
import { formatarNumero } from "../numeros";
import { lerPeriodoAdmin, type PeriodoAdmin } from "../periodo";
import { AbasEventos } from "./AbasEventos";
import { BotaoEnviar } from "./BotaoEnviar";
import { EstadoConsulta } from "./EstadoConsulta";
import { SeletorPeriodo } from "./SeletorPeriodo";
import styles from "./admin.module.css";

const POR_PAGINA = 30;

function lerFormato(valor: string | null): FormatoEvento | undefined {
  return valor === "online" || valor === "presencial" ? valor : undefined;
}

export function PaginaEventosAdmin() {
  const { parametros, atualizar } = useParametrosUrl();
  const periodo = lerPeriodoAdmin(parametros.get("periodo") ?? undefined);
  const busca = parametros.get("q") ?? "";
  const formato = lerFormato(parametros.get("formato"));
  const limite = Math.min(
    Math.max(Number(parametros.get("limite")) || POR_PAGINA, POR_PAGINA),
    500,
  );
  const eventos = useEventosComNumeros(periodo);
  const [buscaDigitada, setBuscaDigitada] = useState(busca);

  function buscar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    atualizar({ q: buscaDigitada.trim(), limite: null });
  }

  return (
    <div className={styles.conteudo}>
      <header className={styles.cabecalhoTexto}>
        <h1 className={styles.titulo}>Eventos</h1>
        <p className={styles.subtitulo}>
          O Sympla é a origem dos eventos e das inscrições. Aqui o capítulo acompanha os eventos e
          as participações.
        </p>
      </header>
      <AbasEventos ativa="eventos" />

      <EstadoConsulta consulta={eventos} carregando="Carregando…">
        {({ linhas }) => {
          const filtradas = filtrarLinhas(linhas, { busca: busca || undefined, formato });
          const pagina = filtradas.slice(0, limite);
          return (
            <>
              <CardIntegracao totalEventos={linhas.length} periodo={periodo} />

              <Card aria-label="Eventos do Sympla">
                <form className={styles.filtros} role="search" onSubmit={buscar}>
                  <label className={styles.campoBusca}>
                    <span className="visually-hidden">Buscar evento</span>
                    <input
                      type="search"
                      placeholder="Buscar evento"
                      value={buscaDigitada}
                      onChange={(e) => setBuscaDigitada(e.target.value)}
                      className={styles.busca}
                    />
                  </label>
                  <label>
                    <span className="visually-hidden">Formato</span>
                    <select
                      value={formato ?? ""}
                      onChange={(e) => atualizar({ formato: e.target.value, limite: null })}
                      className={styles.seletor}
                    >
                      <option value="">Formato</option>
                      <option value="online">Online</option>
                      <option value="presencial">Presencial</option>
                    </select>
                  </label>
                  <SeletorPeriodo
                    periodo={periodo}
                    aoMudar={(novo) =>
                      atualizar({ periodo: novo === "12m" ? novo : null, limite: null })
                    }
                    className={styles.seletor}
                  />
                  <button type="submit" className={styles.botaoFiltro}>
                    Buscar
                  </button>
                </form>

                <TabelaEventos linhas={pagina} />

                {filtradas.length > pagina.length && (
                  <button
                    type="button"
                    className={styles.link}
                    onClick={() => atualizar({ limite: limite + POR_PAGINA })}
                  >
                    Ver mais eventos ({filtradas.length - pagina.length})
                  </button>
                )}
                <p className={styles.nota}>
                  Eventos vêm do Sympla e são somente leitura: título, data e formato são corrigidos
                  no Sympla e aparecem aqui em até 5 minutos.
                </p>
              </Card>
            </>
          );
        }}
      </EstadoConsulta>
    </div>
  );
}

function CardIntegracao({
  totalEventos,
  periodo,
}: {
  totalEventos: number;
  periodo: PeriodoAdmin;
}) {
  const atualizacao = useAtualizarAgenda();
  const avisos = useAvisos();

  function atualizarAgora() {
    atualizacao.mutate(undefined, {
      onError: () => avisos.erro("Não foi possível atualizar agora. Tente novamente."),
    });
  }

  return (
    <Card aria-labelledby="titulo-integracao">
      <div className={styles.cardCabecalho}>
        <div className={styles.cardCabecalhoTexto}>
          <CardTitulo id="titulo-integracao">Integração com o Sympla</CardTitulo>
          <p className={styles.texto}>
            Eventos e participantes são lidos direto do Sympla, com até 5 minutos de atraso. Use
            “Atualizar agora” para ver uma mudança feita no Sympla na hora.
          </p>
        </div>
        <div className={styles.acoes}>
          <Tag variante="aqua">Conectado</Tag>
          <BotaoEnviar
            type="button"
            tipo="secundaria"
            enviando="Atualizando…"
            pendente={atualizacao.isPending}
            onClick={atualizarAgora}
          >
            Atualizar agora
          </BotaoEnviar>
        </div>
      </div>

      <div className={styles.indicadores}>
        <div className={styles.indicador}>
          <span className={styles.indicadorValor}>{formatarNumero(totalEventos)}</span>
          <span className={styles.indicadorRotulo}>
            {`Eventos no Sympla (${periodo === "12m" ? "12 meses" : "90 dias e próximos"})`}
          </span>
        </div>
      </div>
    </Card>
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
