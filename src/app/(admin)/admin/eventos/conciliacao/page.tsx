import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { Topbar } from "@/components/layout/Topbar";
import { Alert } from "@/components/ui/Alert";
import { Card, CardTitulo } from "@/components/ui/Card";
import { obterAdminAtual } from "@/lib/sessao";
import { formatarDataCurta } from "@/features/agenda/lib/datas";
import { desfazerResolucao, marcarNaoMembro, vincularParticipacao } from "@/features/agenda-admin/acoes";
import { conciliacao, type ItemFila, type PessoaResumo } from "@/features/agenda-admin/api";
import { AbasEventos } from "@/features/agenda-admin/components/AbasEventos";
import { BotaoEnviar } from "@/features/agenda-admin/components/BotaoEnviar";
import { SeletorPeriodo } from "@/features/agenda-admin/components/SeletorPeriodo";
import styles from "@/features/agenda-admin/components/admin.module.css";
import estilosConciliacao from "@/features/agenda-admin/components/conciliacao.module.css";
import { formatarDataHora } from "@/features/agenda-admin/formatacao";
import { formatarNumero, formatarSimilaridade } from "@/features/agenda-admin/numeros";
import { lerPeriodoAdmin } from "@/features/agenda-admin/periodo";

export const metadata: Metadata = { title: "Eventos · Conciliação" };

/** Sugestões abaixo deste valor não aparecem (o backend aplica o mesmo limiar). */
const LIMIAR_SUGESTAO = 0.4;

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

async function Conteudo({ searchParams }: { searchParams: PageProps<"/admin/eventos/conciliacao">["searchParams"] }) {
  const params = await searchParams;
  await connection();
  const periodo = lerPeriodoAdmin(params.periodo);
  const { total, fila, resolvidas, pessoas } = await conciliacao(periodo);

  const analisar = typeof params.analisar === "string" ? params.analisar : undefined;
  const emAnalise = fila.find((i) => chave(i) === analisar) ?? fila[0];
  const hrefAnalisar = (item: ItemFila) =>
    `/admin/eventos/conciliacao?${new URLSearchParams({ periodo, analisar: chave(item) })}`;

  return (
    <>
      <header className={styles.cabecalho}>
        <h1 className={styles.titulo}>Participações não vinculadas</h1>
        <p className={styles.contador}>{formatarNumero(total)} na fila</p>
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
      </form>

      {emAnalise && <EmAnalise item={emAnalise} pessoas={pessoas} />}

      <Card aria-labelledby="titulo-fila">
        <form action={marcarNaoMembro} className={estilosConciliacao.fila}>
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
            <ul className={estilosConciliacao.lista}>
              {fila.map((item) => {
                const { participacao, evento, sugestoes } = item;
                const melhor = sugestoes[0];
                return (
                  <li
                    key={chave(item)}
                    className={`${estilosConciliacao.item} ${emAnalise && chave(item) === chave(emAnalise) ? estilosConciliacao.itemAtivo : ""}`}
                  >
                    <input
                      type="checkbox"
                      name="inscricao"
                      value={chave(item)}
                      className={styles.checkbox}
                      aria-label={`Selecionar ${participacao.email}`}
                    />
                    <div className={estilosConciliacao.itemTexto}>
                      <span className={estilosConciliacao.email}>{participacao.email}</span>
                      <span className={styles.secundario}>
                        {participacao.nome} · {evento.titulo} · {formatarDataCurta(evento.inicio)}
                      </span>
                    </div>
                    <div className={estilosConciliacao.sugestao}>
                      {melhor ? (
                        <>
                          <span className={estilosConciliacao.email}>{melhor.pessoa.nome}</span>
                          <span className={styles.secundario}>similaridade {formatarSimilaridade(melhor.similaridade)}</span>
                        </>
                      ) : (
                        <>
                          <span className={estilosConciliacao.semSugestao}>Nenhuma sugestão</span>
                          <span className={styles.secundario}>abaixo do limiar de {formatarSimilaridade(LIMIAR_SUGESTAO)}</span>
                        </>
                      )}
                    </div>
                    <Link href={hrefAnalisar(item)} className={styles.link} scroll={false}>
                      Analisar
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
          {total > fila.length && (
            <p className={styles.nota}>
              Mostrando as {fila.length} participações mais prováveis de {formatarNumero(total)}.
            </p>
          )}
        </form>
      </Card>

      {resolvidas.length > 0 && (
        <Card aria-labelledby="titulo-resolvidas">
          <CardTitulo id="titulo-resolvidas">Resolvidas recentemente</CardTitulo>
          <p className={styles.texto}>Vinculou por engano? Desfazer devolve a participação para a fila.</p>
          <ul className={estilosConciliacao.lista}>
            {resolvidas.map((r) => (
              <li key={`${r.participacao.eventoId}:${r.participacao.id}`} className={estilosConciliacao.item}>
                <div className={estilosConciliacao.itemTexto}>
                  <span className={estilosConciliacao.email}>{r.participacao.email || "Inscrição não encontrada no Sympla"}</span>
                  <span className={styles.secundario}>
                    {r.participacao.nome && `${r.participacao.nome} · `}
                    {r.evento.titulo}
                  </span>
                </div>
                <div className={estilosConciliacao.sugestao}>
                  <span className={estilosConciliacao.email}>
                    {r.tipo === "vinculo" ? `Vinculada a ${r.pessoa?.nome ?? "pessoa removida"}` : "Não é membro"}
                  </span>
                  <span className={styles.secundario}>
                    {formatarDataHora(r.em)} · {r.por}
                  </span>
                </div>
                <form action={desfazerResolucao}>
                  <input type="hidden" name="eventoId" value={r.participacao.eventoId} />
                  <input type="hidden" name="participanteId" value={r.participacao.id} />
                  <BotaoEnviar tipo="link" enviando="Desfazendo…">
                    Desfazer
                  </BotaoEnviar>
                </form>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </>
  );
}

function EmAnalise({ item, pessoas }: { item: ItemFila; pessoas: PessoaResumo[] }) {
  const { participacao, evento, sugestoes } = item;

  return (
    <Card destaque aria-labelledby="titulo-analise" className={estilosConciliacao.analise}>
      <CardTitulo id="titulo-analise">Em análise</CardTitulo>
      <dl className={estilosConciliacao.dados}>
        <div>
          <dt>Evento</dt>
          <dd>
            {evento.titulo} · {formatarDataCurta(evento.inicio)}
          </dd>
        </div>
        <div>
          <dt>E-mail no Sympla</dt>
          <dd>{participacao.email}</dd>
        </div>
        <div>
          <dt>Nome informado</dt>
          <dd>{participacao.nome || "—"}</dd>
        </div>
        <div>
          <dt>Status</dt>
          <dd>{participacao.checkIn ? "Check-in confirmado" : "Sem check-in"}</dd>
        </div>
      </dl>

      <form action={vincularParticipacao} className={estilosConciliacao.formulario}>
        <input type="hidden" name="eventoId" value={participacao.eventoId} />
        <input type="hidden" name="participanteId" value={participacao.id} />

        {pessoas.length === 0 ? (
          <p className={styles.texto}>
            Ainda não há pessoas cadastradas na plataforma, então não há com quem vincular. Por enquanto só é possível
            marcar como não membro.
          </p>
        ) : sugestoes.length > 0 ? (
          <fieldset className={estilosConciliacao.sugestoes}>
            <legend className={styles.subtituloCard}>Pessoas com nome parecido na base</legend>
            {sugestoes.map(({ pessoa, similaridade }, i) => (
              <label key={pessoa.id} className={estilosConciliacao.opcao}>
                <input type="radio" name="pessoaId" value={pessoa.id} defaultChecked={i === 0} />
                <span>
                  <span className={estilosConciliacao.opcaoTitulo}>
                    {pessoa.nome} · Similaridade {formatarSimilaridade(similaridade)}
                  </span>
                  <span className={styles.secundario}>{descreverPessoa(pessoa)}</span>
                </span>
              </label>
            ))}
          </fieldset>
        ) : (
          <p className={styles.texto}>Nenhuma pessoa com nome parecido. Busque manualmente abaixo, se souber quem é.</p>
        )}

        {pessoas.length > 0 && (
          <details className={estilosConciliacao.manual} open={sugestoes.length === 0}>
            <summary className={styles.link}>Buscar outra pessoa manualmente</summary>
            <label>
              <span className="visually-hidden">Pessoa</span>
              <select name="pessoaManual" className={styles.seletor} defaultValue="">
                <option value="">Selecione uma pessoa</option>
                {pessoas.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nome}
                    {p.email ? ` · ${p.email}` : ""}
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
          A decisão fica registrada na auditoria. O vínculo não cadastra este e-mail no perfil da pessoa: para os
          próximos eventos serem reconhecidos sozinhos, ela precisa cadastrar e verificar o e-mail.
        </p>
      </form>
    </Card>
  );
}

/** Uma inscrição no Sympla é identificada pelo evento e pelo participante. */
function chave(item: ItemFila) {
  return `${item.participacao.eventoId}:${item.participacao.id}`;
}

function descreverPessoa(p: PessoaResumo) {
  return [p.email, p.pmiId && `PMI ID ${p.pmiId}`, `${p.statusFiliacao === "filiado" ? "filiação" : "cadastro"} desde ${p.desde}`]
    .filter(Boolean)
    .join(" · ");
}
