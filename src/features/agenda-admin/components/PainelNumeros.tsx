"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Card, CardTitulo } from "@/components/ui/Card";
import { classesBotao } from "@/components/ui/Button";
import { Tag } from "@/components/ui/Tag";
import { formatarDataCurta } from "@/features/agenda/lib/datas";
import { rotuloFormato } from "@/features/agenda/lib/regras";
import { atualizarAgora } from "../acoes";
import { filtrarLinhas, type FiltrosNumeros, type LinhaNumeros } from "../linhas-numeros";
import { agregar, formatarNumero, formatarTaxa } from "../numeros";
import type { PeriodoAdmin } from "../periodo";
import { BotaoEnviar } from "./BotaoEnviar";
import { SeletorFiltro } from "./SeletorFiltro";
import styles from "./admin.module.css";

type CampoOrdenacao = "inicio" | "inscritos" | "presentes" | "ausentes" | "cancelados" | "taxa";

const COLUNAS_NUMERICAS: { campo: CampoOrdenacao; rotulo: string }[] = [
  { campo: "inscritos", rotulo: "Inscritos" },
  { campo: "presentes", rotulo: "Presentes" },
  { campo: "ausentes", rotulo: "Ausentes" },
  { campo: "cancelados", rotulo: "Cancelados" },
  { campo: "taxa", rotulo: "Taxa de presença" },
];

type PainelNumerosProps = {
  linhas: LinhaNumeros[];
  categorias: string[];
  periodo: PeriodoAdmin;
  rotuloPeriodo: string;
};

export function PainelNumeros({ linhas, categorias, periodo, rotuloPeriodo }: PainelNumerosProps) {
  const [filtros, setFiltros] = useState<FiltrosNumeros>({});
  const [ordem, setOrdem] = useState<{ campo: CampoOrdenacao; desc: boolean }>({ campo: "inicio", desc: true });
  const [selecionados, setSelecionados] = useState<Set<string>>(new Set());

  const filtradas = useMemo(() => filtrarLinhas(linhas, filtros), [linhas, filtros]);
  const ordenadas = useMemo(() => {
    const valor = (l: LinhaNumeros) =>
      ordem.campo === "inicio" ? new Date(l.inicio).getTime() : ordem.campo === "taxa" ? (l.taxa ?? -1) : l[ordem.campo];
    return [...filtradas].sort((a, b) => (valor(a) - valor(b)) * (ordem.desc ? -1 : 1));
  }, [filtradas, ordem]);

  // A seleção vale só para o que está visível com os filtros atuais.
  const selecionadasVisiveis = filtradas.filter((l) => selecionados.has(l.id));
  const base = selecionadasVisiveis.length > 0 ? selecionadasVisiveis : filtradas;
  const totais = agregar(base);

  function alternar(id: string) {
    setSelecionados((atual) => {
      const novo = new Set(atual);
      if (novo.has(id)) novo.delete(id);
      else novo.add(id);
      return novo;
    });
  }

  function ordenarPor(campo: CampoOrdenacao) {
    setOrdem((atual) => ({ campo, desc: atual.campo === campo ? !atual.desc : true }));
  }

  const hrefExportar = useMemo(() => {
    const query = new URLSearchParams({ periodo });
    if (filtros.busca) query.set("q", filtros.busca);
    if (filtros.situacao) query.set("situacao", filtros.situacao);
    if (filtros.formato) query.set("formato", filtros.formato);
    if (filtros.categoria) query.set("categoria", filtros.categoria);
    if (selecionadasVisiveis.length > 0) query.set("ids", selecionadasVisiveis.map((l) => l.id).join(","));
    return `/admin/eventos/numeros/exportar?${query}`;
  }, [periodo, filtros, selecionadasVisiveis]);

  const atualizar = (mudanca: Partial<FiltrosNumeros>) => setFiltros((atual) => ({ ...atual, ...mudanca }));

  return (
    <>
      <Card aria-labelledby="titulo-totais">
        <div className={styles.cardCabecalho}>
          <div className={styles.cardCabecalhoTexto}>
            <CardTitulo id="titulo-totais">Totais agregados</CardTitulo>
            <p className={styles.texto} aria-live="polite">
              {selecionadasVisiveis.length > 0
                ? `${selecionadasVisiveis.length} eventos selecionados`
                : `${rotuloPeriodo} · ${filtradas.length} eventos listados`}
            </p>
          </div>
          <div className={styles.acoes}>
            <form action={atualizarAgora}>
              <BotaoEnviar tipo="secundaria" enviando="Atualizando…">
                Atualizar agora
              </BotaoEnviar>
            </form>
            {/* A exportação fica registrada na auditoria (RN-05.05.5). */}
            <a href={hrefExportar} className={classesBotao()} download>
              Exportar CSV
            </a>
          </div>
        </div>

        <div className={styles.totais}>
          <Total valor={formatarNumero(totais.eventos)} rotulo="Eventos" />
          <Total valor={formatarNumero(totais.inscritos)} rotulo="Inscritos" />
          <Total valor={formatarNumero(totais.presentes)} rotulo="Presentes" />
          <Total valor={formatarNumero(totais.ausentes)} rotulo="Ausentes" />
          <Total valor={formatarNumero(totais.cancelados)} rotulo="Cancelados" />
          <Total valor={formatarTaxa(totais.taxa)} rotulo="Taxa de presença" />
        </div>
        <p className={styles.nota}>
          Participantes lidos direto do Sympla, com até 5 minutos de atraso. A exportação fica registrada no log do
          backend.
        </p>
      </Card>

      <div className={styles.filtros} role="search">
        <label className={styles.campoBusca}>
          <span className="visually-hidden">Buscar evento</span>
          <input
            type="search"
            placeholder="Buscar evento"
            className={styles.busca}
            value={filtros.busca ?? ""}
            onChange={(e) => atualizar({ busca: e.target.value || undefined })}
          />
        </label>
        <SeletorFiltro rotulo="Situação" valor={filtros.situacao} aoMudar={(v) => atualizar({ situacao: v as FiltrosNumeros["situacao"] })}>
          <option value="ativo">Ativos</option>
          <option value="inativo">Inativos</option>
        </SeletorFiltro>
        <SeletorFiltro rotulo="Formato" valor={filtros.formato} aoMudar={(v) => atualizar({ formato: v as FiltrosNumeros["formato"] })}>
          <option value="online">Online</option>
          <option value="presencial">Presencial</option>
        </SeletorFiltro>
        <SeletorFiltro rotulo="Categoria" valor={filtros.categoria} aoMudar={(v) => atualizar({ categoria: v })}>
          {categorias.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </SeletorFiltro>
        <PeriodoLink periodo={periodo} />
      </div>

      <Card aria-label="Números por evento">
        {ordenadas.length === 0 ? (
          <p className={styles.vazio}>Nenhum evento com os filtros selecionados.</p>
        ) : (
          <div className={styles.rolagem}>
            <table className={styles.tabela}>
              <thead>
                <tr>
                  <th>
                    <span className="visually-hidden">Selecionar</span>
                  </th>
                  <th className={styles.colunaEvento}>Evento</th>
                  <th>Situação</th>
                  <th>
                    <BotaoOrdenar ativo={ordem.campo === "inicio"} desc={ordem.desc} aoClicar={() => ordenarPor("inicio")}>
                      Data
                    </BotaoOrdenar>
                  </th>
                  <th>Formato</th>
                  {COLUNAS_NUMERICAS.map(({ campo, rotulo }) => (
                    <th key={campo} className={styles.numero}>
                      <BotaoOrdenar ativo={ordem.campo === campo} desc={ordem.desc} aoClicar={() => ordenarPor(campo)}>
                        {rotulo}
                      </BotaoOrdenar>
                    </th>
                  ))}
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {ordenadas.map((l) => (
                  <tr key={l.id}>
                    <td>
                      <input
                        type="checkbox"
                        className={styles.checkbox}
                        checked={selecionados.has(l.id)}
                        onChange={() => alternar(l.id)}
                        aria-label={`Selecionar ${l.titulo}`}
                      />
                    </td>
                    <td>
                      {l.titulo}
                      <span className={styles.secundario}>sympla_event_id {l.id}</span>
                    </td>
                    <td>
                      <Tag variante={l.situacao === "ativo" ? "aqua" : "neutra"}>{l.situacao === "ativo" ? "Ativo" : "Inativo"}</Tag>
                    </td>
                    <td>{formatarDataCurta(l.inicio)}</td>
                    <td>{rotuloFormato(l.formato)}</td>
                    <td className={styles.numero}>{formatarNumero(l.inscritos)}</td>
                    <td className={styles.numero}>{formatarNumero(l.presentes)}</td>
                    <td className={styles.numero}>{formatarNumero(l.ausentes)}</td>
                    <td className={styles.numero}>{formatarNumero(l.cancelados)}</td>
                    <td className={styles.numero}>{l.situacao === "ativo" ? "—" : formatarTaxa(l.taxa)}</td>
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
        )}
      </Card>
    </>
  );
}

function Total({ valor, rotulo }: { valor: string; rotulo: string }) {
  return (
    <div className={styles.total}>
      <span className={styles.totalValor}>{valor}</span>
      <span className={styles.totalRotulo}>{rotulo}</span>
    </div>
  );
}

function BotaoOrdenar({
  ativo,
  desc,
  aoClicar,
  children,
}: {
  ativo: boolean;
  desc: boolean;
  aoClicar: () => void;
  children: React.ReactNode;
}) {
  return (
    <button type="button" className={styles.ordenar} onClick={aoClicar} aria-pressed={ativo}>
      {children}
      {ativo && <span aria-hidden>{desc ? " ↓" : " ↑"}</span>}
      {ativo && <span className="visually-hidden">{desc ? " (decrescente)" : " (crescente)"}</span>}
    </button>
  );
}

/** O período troca os dados carregados no servidor, então é uma navegação (e não um filtro local). */
function PeriodoLink({ periodo }: { periodo: PeriodoAdmin }) {
  return periodo === "12m" ? (
    <Link href="/admin/eventos/numeros" className={styles.botaoFiltro}>
      Ver só os últimos 90 dias
    </Link>
  ) : (
    <Link href="/admin/eventos/numeros?periodo=12m" className={styles.botaoFiltro}>
      Incluir últimos 12 meses
    </Link>
  );
}
