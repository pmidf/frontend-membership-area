"use client";

import Link from "next/link";
import type { FormEvent } from "react";

import { Alert } from "@/components/ui/Alert";
import { Card, CardTitulo } from "@/components/ui/Card";
import { formatarDataCurta } from "@/features/agenda/lib/datas";
import { useParametrosUrl } from "@/shared/hooks/useParametrosUrl";
import { useAvisos } from "@/shared/ui/aviso/useAvisos";

import type { Inscricao, ItemFila, PessoaResumo, Resolvida } from "../api/agenda-admin.api";
import {
  useConciliacao,
  useDesfazerResolucao,
  useMarcarNaoMembros,
  useVincularParticipacao,
} from "../api/agenda-admin.queries";
import { formatarDataHora } from "../formatacao";
import { formatarNumero, formatarSimilaridade } from "../numeros";
import { lerPeriodoAdmin, type PeriodoAdmin } from "../periodo";
import { AbasEventos } from "./AbasEventos";
import { BotaoEnviar } from "./BotaoEnviar";
import { EstadoConsulta } from "./EstadoConsulta";
import { SeletorPeriodo } from "./SeletorPeriodo";
import styles from "./admin.module.css";
import estilosConciliacao from "./conciliacao.module.css";

const LIMIAR_SUGESTAO = 0.4;
const ERRO_ACAO = "Não foi possível concluir a ação. Tente novamente.";

function chave(item: ItemFila) {
  return `${item.participacao.eventoId}:${item.participacao.id}`;
}

function inscricaoDe(valor: string): Inscricao | null {
  const [eventoId, participanteId] = valor.split(":");
  return eventoId && participanteId ? { eventoId, participanteId } : null;
}

function inscricaoDoItem(item: ItemFila): Inscricao {
  return { eventoId: item.participacao.eventoId, participanteId: item.participacao.id };
}

export function PaginaConciliacaoAdmin() {
  const { parametros, atualizar } = useParametrosUrl();
  const periodo = lerPeriodoAdmin(parametros.get("periodo") ?? undefined);
  const analisar = parametros.get("analisar");
  const conciliacao = useConciliacao(periodo);

  return (
    <div className={styles.conteudo}>
      <Link href="/admin/eventos" className={styles.voltar}>
        ‹ Voltar para eventos
      </Link>
      <EstadoConsulta consulta={conciliacao} carregando="Carregando participações não vinculadas…">
        {({ total, fila, resolvidas, pessoas }) => {
          const emAnalise = fila.find((i) => chave(i) === analisar) ?? fila[0];
          return (
            <>
              <header className={styles.cabecalho}>
                <h1 className={styles.titulo}>Participações não vinculadas</h1>
                <p className={styles.contador}>{formatarNumero(total)} na fila</p>
              </header>
              <AbasEventos ativa="conciliacao" />

              <Alert titulo="Nada aqui é descartado">
                Participação sem dono fica guardada. Se a pessoa se cadastrar depois e verificar
                esse e-mail, o vínculo acontece sozinho. Esta fila é para os casos que não se
                resolvem sozinhos.
              </Alert>

              <div className={styles.filtros}>
                <SeletorPeriodo
                  periodo={periodo}
                  aoMudar={(novo) =>
                    atualizar({ periodo: novo === "12m" ? novo : null, analisar: null })
                  }
                  className={styles.seletor}
                />
              </div>

              {emAnalise && <EmAnalise key={chave(emAnalise)} item={emAnalise} pessoas={pessoas} />}

              <FilaConciliacao fila={fila} total={total} periodo={periodo} emAnalise={emAnalise} />

              {resolvidas.length > 0 && <ResolvidasRecentemente resolvidas={resolvidas} />}
            </>
          );
        }}
      </EstadoConsulta>
    </div>
  );
}

function FilaConciliacao({
  fila,
  total,
  periodo,
  emAnalise,
}: {
  fila: ItemFila[];
  total: number;
  periodo: PeriodoAdmin;
  emAnalise: ItemFila | undefined;
}) {
  const avisos = useAvisos();
  const marcacao = useMarcarNaoMembros();

  const hrefAnalisar = (item: ItemFila) =>
    `/admin/eventos/conciliacao?${new URLSearchParams({ periodo, analisar: chave(item) })}`;

  function marcarSelecionados(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const inscricoes = new FormData(evento.currentTarget)
      .getAll("inscricao")
      .map((valor) => inscricaoDe(String(valor)))
      .filter((i): i is Inscricao => i !== null);
    if (inscricoes.length === 0) {
      avisos.erro("Selecione ao menos uma participação.");
      return;
    }
    marcacao.mutate(inscricoes, {
      onSuccess: () => avisos.sucesso("Participações marcadas como não membros"),
      onError: () => avisos.erro(ERRO_ACAO),
    });
  }

  return (
    <Card aria-labelledby="titulo-fila">
      <form onSubmit={marcarSelecionados} className={estilosConciliacao.fila}>
        <div className={styles.cardCabecalho}>
          <div className={styles.cardCabecalhoTexto}>
            <CardTitulo id="titulo-fila">Fila de conciliação</CardTitulo>
            <p className={styles.texto}>
              Ordenada pela similaridade de nome, do caso mais provável para o menos provável.
            </p>
          </div>
          {fila.length > 0 && (
            <BotaoEnviar tipo="secundaria" enviando="Marcando…" pendente={marcacao.isPending}>
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
              const ativo = emAnalise !== undefined && chave(item) === chave(emAnalise);
              return (
                <li
                  key={chave(item)}
                  className={`${estilosConciliacao.item} ${ativo ? estilosConciliacao.itemAtivo : ""}`}
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
                        <span className={styles.secundario}>
                          similaridade {formatarSimilaridade(melhor.similaridade)}
                        </span>
                      </>
                    ) : (
                      <>
                        <span className={estilosConciliacao.semSugestao}>Nenhuma sugestão</span>
                        <span className={styles.secundario}>
                          abaixo do limiar de {formatarSimilaridade(LIMIAR_SUGESTAO)}
                        </span>
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
  );
}

function ResolvidasRecentemente({ resolvidas }: { resolvidas: Resolvida[] }) {
  const avisos = useAvisos();
  const desfazimento = useDesfazerResolucao();

  function desfazer(r: Resolvida) {
    desfazimento.mutate(
      { eventoId: r.participacao.eventoId, participanteId: r.participacao.id },
      {
        onSuccess: () => avisos.sucesso("A participação voltou para a fila"),
        onError: () => avisos.erro(ERRO_ACAO),
      },
    );
  }

  const desfazendo = (r: Resolvida) =>
    desfazimento.isPending &&
    desfazimento.variables.eventoId === r.participacao.eventoId &&
    desfazimento.variables.participanteId === r.participacao.id;

  return (
    <Card aria-labelledby="titulo-resolvidas">
      <CardTitulo id="titulo-resolvidas">Resolvidas recentemente</CardTitulo>
      <p className={styles.texto}>
        Vinculou por engano? Desfazer devolve a participação para a fila.
      </p>
      <ul className={estilosConciliacao.lista}>
        {resolvidas.map((r) => (
          <li
            key={`${r.participacao.eventoId}:${r.participacao.id}`}
            className={estilosConciliacao.item}
          >
            <div className={estilosConciliacao.itemTexto}>
              <span className={estilosConciliacao.email}>
                {r.participacao.email || "Inscrição não encontrada no Sympla"}
              </span>
              <span className={styles.secundario}>
                {r.participacao.nome && `${r.participacao.nome} · `}
                {r.evento.titulo}
              </span>
            </div>
            <div className={estilosConciliacao.sugestao}>
              <span className={estilosConciliacao.email}>
                {r.tipo === "vinculo"
                  ? `Vinculada a ${r.pessoa?.nome ?? "pessoa removida"}`
                  : "Não é membro"}
              </span>
              <span className={styles.secundario}>
                {formatarDataHora(r.em)} · {r.por}
              </span>
            </div>
            <BotaoEnviar
              type="button"
              tipo="link"
              enviando="Desfazendo…"
              pendente={desfazendo(r)}
              disabled={desfazimento.isPending}
              onClick={() => desfazer(r)}
            >
              Desfazer
            </BotaoEnviar>
          </li>
        ))}
      </ul>
    </Card>
  );
}

function EmAnalise({ item, pessoas }: { item: ItemFila; pessoas: PessoaResumo[] }) {
  const { participacao, evento, sugestoes } = item;
  const avisos = useAvisos();
  const vinculo = useVincularParticipacao();
  const marcacao = useMarcarNaoMembros();
  const ocupado = vinculo.isPending || marcacao.isPending;

  function vincular(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const dados = new FormData(evento.currentTarget);
    const pessoaId = String(dados.get("pessoaManual") || dados.get("pessoaId") || "");
    if (!pessoaId) {
      avisos.erro("Selecione a pessoa para vincular.");
      return;
    }
    vinculo.mutate(
      { ...inscricaoDoItem(item), pessoaId },
      {
        onSuccess: () => avisos.sucesso("Participação vinculada"),
        onError: () => avisos.erro(ERRO_ACAO),
      },
    );
  }

  function marcarNaoMembro() {
    marcacao.mutate([inscricaoDoItem(item)], {
      onSuccess: () => avisos.sucesso("Participação marcada como não membro"),
      onError: () => avisos.erro(ERRO_ACAO),
    });
  }

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

      <form onSubmit={vincular} className={estilosConciliacao.formulario}>
        {pessoas.length === 0 ? (
          <p className={styles.texto}>
            Ainda não há pessoas cadastradas na plataforma, então não há com quem vincular. Por
            enquanto só é possível marcar como não membro.
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
          <p className={styles.texto}>
            Nenhuma pessoa com nome parecido. Busque manualmente abaixo, se souber quem é.
          </p>
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
          {pessoas.length > 0 && (
            <BotaoEnviar enviando="Vinculando…" pendente={vinculo.isPending} disabled={ocupado}>
              Vincular participação
            </BotaoEnviar>
          )}
          <BotaoEnviar
            type="button"
            tipo="secundaria"
            enviando="Marcando…"
            pendente={marcacao.isPending}
            disabled={ocupado}
            onClick={marcarNaoMembro}
          >
            Não é membro do capítulo
          </BotaoEnviar>
        </div>
        <p className={styles.nota}>
          A decisão fica registrada na auditoria. O vínculo não cadastra este e-mail no perfil da
          pessoa: para os próximos eventos serem reconhecidos sozinhos, ela precisa cadastrar e
          verificar o e-mail.
        </p>
      </form>
    </Card>
  );
}

function descreverPessoa(p: PessoaResumo) {
  return [
    p.email,
    p.pmiId && `PMI ID ${p.pmiId}`,
    `${p.statusFiliacao === "filiado" ? "filiação" : "cadastro"} desde ${p.desde}`,
  ]
    .filter(Boolean)
    .join(" · ");
}
