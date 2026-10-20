import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { Topbar } from "@/components/layout/Topbar";
import { obterAdminAtual } from "@/lib/sessao";
import { Alert } from "@/components/ui/Alert";
import { Card, CardTitulo } from "@/components/ui/Card";
import type { Pessoa } from "@/lib/pessoas";
import { formatarDataCurta } from "@/features/agenda/lib/datas";
import type { Evento, ParticipanteEvento } from "@/features/agenda/types";
import { desfazerResolucao, marcarNaoMembro, vincularParticipacao } from "@/features/agenda-admin/acoes";
import { AbasEventos } from "@/features/agenda-admin/components/AbasEventos";
import { BotaoEnviar } from "@/features/agenda-admin/components/BotaoEnviar";
import { SeletorPeriodo } from "@/features/agenda-admin/components/SeletorPeriodo";
import styles from "@/features/agenda-admin/components/admin.module.css";
import conciliacao from "@/features/agenda-admin/components/conciliacao.module.css";
import { eventosDoPeriodo, lerPeriodoAdmin, participacoesNaoVinculadas } from "@/features/agenda-admin/dados";
import { formatarDataHora } from "@/features/agenda-admin/formatacao";
import { formatarNumero } from "@/features/agenda-admin/numeros";
import {
  chaveParticipacao,
  formatarSimilaridade,
  LIMIAR_SUGESTAO,
  sugerirPessoas,
  type Sugestao,
} from "@/features/agenda-admin/vinculos";

export const metadata: Metadata = { title: "Eventos · Conciliação" };

const LIMITE_FILA = 50;
const LIMITE_RESOLVIDAS = 10;

export default async function AdminConciliacaoPage({ searchParams }: PageProps<"/admin/eventos/conciliacao">) {
  const admin = await obterAdminAtual();

  return (
    <>
      <Topbar titulo="Eventos · conciliação" usuario={admin} selo={{ texto: admin.papel, variante: "violeta" }} />
      <div className={styles.conteudo}>
        <Link href="/admin/eventos" className={styles.voltar}>
          ‹ Voltar para eventos
        </Link>
        <Suspense fallback={<p className={styles.texto}>Carregando participações não vinculadas…</p>}>
          <Conteudo searchParams={searchParams} />
        </Suspense>
      </div>
    </>
  );
}

type ItemFila = { participante: ParticipanteEvento; evento: Evento; sugestoes: Sugestao[] };

async function Conteudo({ searchParams }: { searchParams: PageProps<"/admin/eventos/conciliacao">["searchParams"] }) {
  const params = await searchParams;
  await connection();
  const agora = new Date();
  const periodo = lerPeriodoAdmin(params.periodo);

  const eventos = await eventosDoPeriodo(periodo, agora);
  const { pendentes, todos, pessoas, estado, falhas } = await participacoesNaoVinculadas(eventos, agora);
  const eventosPorId = new Map(eventos.map((e) => [e.id, e]));

  // Ordenada pela similaridade de nome: do caso mais provável para o menos provável.
  const fila: ItemFila[] = pendentes
    .map((participante) => ({
      participante,
      evento: eventosPorId.get(participante.eventoId)!,
      sugestoes: sugerirPessoas(participante.nome, pessoas),
    }))
    .sort((a, b) => (b.sugestoes[0]?.similaridade ?? 0) - (a.sugestoes[0]?.similaridade ?? 0));

  const analisar = typeof params.analisar === "string" ? params.analisar : undefined;
  const emAnalise = fila.find((i) => chaveParticipacao(i.participante) === analisar) ?? fila[0];
  const chaveEmAnalise = emAnalise && chaveParticipacao(emAnalise.participante);

  const participantesPorChave = new Map(todos.map((p) => [chaveParticipacao(p), p]));
  const pessoasPorId = new Map(pessoas.map((p) => [p.id, p]));
  const resolvidas = Object.entries(estado.resolucoes)
    .filter(([chave]) => participantesPorChave.has(chave))
    .sort(([, a], [, b]) => b.em.localeCompare(a.em))
    .slice(0, LIMITE_RESOLVIDAS);

  const hrefAnalisar = (chave: string) =>
    `/admin/eventos/conciliacao?${new URLSearchParams({ periodo, analisar: chave })}`;

  return (
    <>
      <header className={styles.cabecalho}>
        <h1 className={styles.titulo}>Participações não vinculadas</h1>
        <p className={styles.contador}>{formatarNumero(fila.length)} na fila</p>
      </header>
      <AbasEventos ativa="conciliacao" />

      <Alert titulo="Nada aqui é descartado">
        Participação sem dono fica guardada. Se a pessoa se cadastrar depois e verificar esse e-mail, o vínculo acontece
        sozinho. Esta fila é para os casos que não se resolvem sozinhos.
      </Alert>

      <form className={styles.filtros}>
        <SeletorPeriodo periodo={periodo} className={styles.seletor} />
        <noscript>
          <button type="submit" className={styles.botaoFiltro}>
            Aplicar
          </button>
        </noscript>
        {falhas > 0 && (
          <p className={styles.erro}>
            O Sympla não respondeu para {falhas} evento(s); as participações deles não aparecem agora.
          </p>
        )}
      </form>

      {emAnalise && <EmAnalise item={emAnalise} pessoas={pessoas} />}

      <Card aria-labelledby="titulo-fila">
        <form action={marcarNaoMembro} className={conciliacao.fila}>
          <div className={styles.cardCabecalho}>
            <div className={styles.cardCabecalhoTexto}>
              <CardTitulo id="titulo-fila">Fila de conciliação</CardTitulo>
              <p className={styles.texto}>Ordenada pela similaridade de nome, do caso mais provável para o menos provável.</p>
            </div>
            {fila.length > 0 && (
              <BotaoEnviar tipo="secundaria" enviando="Marcando…">
                Marcar selecionados como não membros
              </BotaoEnviar>
            )}
          </div>

          {fila.length === 0 ? (
            <p className={styles.vazio}>Nenhuma participação aguardando conciliação neste período.</p>
          ) : (
            <ul className={conciliacao.lista}>
              {fila.slice(0, LIMITE_FILA).map(({ participante, evento, sugestoes }) => {
                const chave = chaveParticipacao(participante);
                const melhor = sugestoes[0];
                return (
                  <li key={chave} className={`${conciliacao.item} ${chave === chaveEmAnalise ? conciliacao.itemAtivo : ""}`}>
                    <input
                      type="checkbox"
                      name="chave"
                      value={chave}
                      className={styles.checkbox}
                      aria-label={`Selecionar ${participante.email}`}
                    />
                    <div className={conciliacao.itemTexto}>
                      <span className={conciliacao.email}>{participante.email}</span>
                      <span className={styles.secundario}>
                        {participante.nome} · {evento.titulo} · {formatarDataCurta(evento.inicio)}
                      </span>
                    </div>
                    <div className={conciliacao.sugestao}>
                      {melhor ? (
                        <>
                          <span className={conciliacao.email}>{melhor.pessoa.nome}</span>
                          <span className={styles.secundario}>similaridade {formatarSimilaridade(melhor.similaridade)}</span>
                        </>
                      ) : (
                        <>
                          <span className={conciliacao.semSugestao}>Nenhuma sugestão</span>
                          <span className={styles.secundario}>abaixo do limiar de {formatarSimilaridade(LIMIAR_SUGESTAO)}</span>
                        </>
                      )}
                    </div>
                    <Link href={hrefAnalisar(chave)} className={styles.link} scroll={false}>
                      Analisar
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
          {fila.length > LIMITE_FILA && (
            <p className={styles.nota}>Mostrando as {LIMITE_FILA} participações mais prováveis de {fila.length}.</p>
          )}
        </form>
      </Card>

      {resolvidas.length > 0 && (
        <Card aria-labelledby="titulo-resolvidas">
          <CardTitulo id="titulo-resolvidas">Resolvidas recentemente</CardTitulo>
          <p className={styles.texto}>Vinculou por engano? Desfazer devolve a participação para a fila.</p>
          <ul className={conciliacao.lista}>
            {resolvidas.map(([chave, resolucao]) => {
              const participante = participantesPorChave.get(chave)!;
              const evento = eventosPorId.get(participante.eventoId);
              return (
                <li key={chave} className={conciliacao.item}>
                  <div className={conciliacao.itemTexto}>
                    <span className={conciliacao.email}>{participante.email}</span>
                    <span className={styles.secundario}>
                      {participante.nome}
                      {evento && ` · ${evento.titulo}`}
                    </span>
                  </div>
                  <div className={conciliacao.sugestao}>
                    <span className={conciliacao.email}>
                      {resolucao.tipo === "vinculo"
                        ? `Vinculada a ${pessoasPorId.get(resolucao.pessoaId)?.nome ?? "pessoa removida"}`
                        : "Não é membro"}
                    </span>
                    <span className={styles.secundario}>
                      {formatarDataHora(resolucao.em)} · {resolucao.por}
                    </span>
                  </div>
                  <form action={desfazerResolucao}>
                    <input type="hidden" name="chave" value={chave} />
                    <BotaoEnviar tipo="link" enviando="Desfazendo…">
                      Desfazer
                    </BotaoEnviar>
                  </form>
                </li>
              );
            })}
          </ul>
        </Card>
      )}
    </>
  );
}

function EmAnalise({ item, pessoas }: { item: ItemFila; pessoas: Pessoa[] }) {
  const { participante, evento, sugestoes } = item;
  const chave = chaveParticipacao(participante);

  return (
    <Card destaque aria-labelledby="titulo-analise" className={conciliacao.analise}>
      <CardTitulo id="titulo-analise">Em análise</CardTitulo>
      <dl className={conciliacao.dados}>
        <div>
          <dt>Evento</dt>
          <dd>
            {evento.titulo} · {formatarDataCurta(evento.inicio)}
          </dd>
        </div>
        <div>
          <dt>E-mail no Sympla</dt>
          <dd>{participante.email}</dd>
        </div>
        <div>
          <dt>Nome informado</dt>
          <dd>{participante.nome || "—"}</dd>
        </div>
        <div>
          <dt>Status</dt>
          <dd>{participante.checkIn ? "Check-in confirmado" : "Sem check-in"}</dd>
        </div>
      </dl>

      <form action={vincularParticipacao} className={conciliacao.formulario}>
        <input type="hidden" name="chave" value={chave} />
        <input type="hidden" name="descricao" value={`${participante.email} · ${evento.titulo}`} />

        {pessoas.length === 0 ? (
          <p className={styles.texto}>
            A base de pessoas da plataforma ainda não está disponível, então não há com quem vincular. Por enquanto
            só é possível marcar como não membro.
          </p>
        ) : sugestoes.length > 0 ? (
          <fieldset className={conciliacao.sugestoes}>
            <legend className={styles.subtituloCard}>Pessoas com nome parecido na base</legend>
            {sugestoes.map(({ pessoa, similaridade }, i) => (
              <label key={pessoa.id} className={conciliacao.opcao}>
                <input type="radio" name="pessoaId" value={pessoa.id} defaultChecked={i === 0} />
                <span>
                  <span className={conciliacao.opcaoTitulo}>
                    {pessoa.nome} · Similaridade {formatarSimilaridade(similaridade)}
                  </span>
                  <span className={styles.secundario}>
                    {[
                      pessoa.emailsVerificados[0],
                      pessoa.pmiId && `PMI ID ${pessoa.pmiId}`,
                      `${pessoa.statusFiliacao === "filiado" ? "filiação" : "cadastro"} desde ${pessoa.desde}`,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </span>
                </span>
              </label>
            ))}
          </fieldset>
        ) : (
          <p className={styles.texto}>Nenhuma pessoa com nome parecido. Busque manualmente abaixo, se souber quem é.</p>
        )}

        {pessoas.length > 0 && (
          <details className={conciliacao.manual} open={sugestoes.length === 0}>
            <summary className={styles.link}>Buscar outra pessoa manualmente</summary>
            <label>
              <span className="visually-hidden">Pessoa</span>
              <select name="pessoaManual" className={styles.seletor} defaultValue="">
                <option value="">Selecione uma pessoa</option>
                {pessoas.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nome} · {p.emailsVerificados[0]}
                  </option>
                ))}
              </select>
            </label>
          </details>
        )}

        <div className={styles.acoes}>
          {pessoas.length > 0 && <BotaoEnviar enviando="Vinculando…">Vincular participação</BotaoEnviar>}
          <BotaoEnviar tipo="secundaria" enviando="Marcando…" formAction={marcarNaoMembro}>
            Não é membro do capítulo
          </BotaoEnviar>
        </div>
        <p className={styles.nota}>
          O vínculo fica registrado na auditoria. Ele não cadastra este e-mail no perfil da pessoa: para os próximos
          eventos serem reconhecidos sozinhos, ela precisa cadastrar e verificar o e-mail.
        </p>
      </form>
    </Card>
  );
}
