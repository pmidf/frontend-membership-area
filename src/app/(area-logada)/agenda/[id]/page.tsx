import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { Topbar } from "@/components/layout/Topbar";
import { Alert } from "@/components/ui/Alert";
import { classesBotao } from "@/components/ui/Button";
import { Card, CardTitulo } from "@/components/ui/Card";
import { Tag } from "@/components/ui/Tag";
import { emailsVerificados, obterUsuarioAtual, type EmailUsuario, type Usuario } from "@/lib/sessao";
import { BotaoInscricaoSympla } from "@/features/agenda/components/BotaoInscricaoSympla";
import { ComParticipacao } from "@/features/agenda/components/ComParticipacao";
import { ImagemEvento } from "@/features/agenda/components/ImagemEvento";
import { formatarDataCompleta, formatarDataCurta, formatarFaixaHorario } from "@/features/agenda/lib/datas";
import { localDoEvento } from "@/features/agenda/lib/ics";
import {
  aceitaInscricao,
  formatoDoEvento,
  jaAconteceu,
  rotuloFormato,
  rotuloParticipacao,
} from "@/features/agenda/lib/regras";
import { obterEvento } from "@/features/agenda/services/agenda-service";
import type { EventoComParticipacao } from "@/features/agenda/types";
import styles from "./page.module.css";

export async function generateMetadata({ params }: PageProps<"/agenda/[id]">): Promise<Metadata> {
  const evento = await obterEvento((await params).id);
  return { title: evento?.titulo ?? "Evento não encontrado" };
}

export default async function EventoPage({ params }: PageProps<"/agenda/[id]">) {
  const usuario = await obterUsuarioAtual();

  return (
    <>
      <Topbar titulo="Agenda de eventos" tituloMobile="Evento" usuario={usuario} />

      <div className={styles.conteudo}>
        <Link href="/agenda" className={styles.voltar}>
          ‹ Voltar para a agenda
        </Link>

        <Suspense fallback={<p className={styles.info}>Carregando evento…</p>}>
          <DetalheEvento params={params} usuario={usuario} />
        </Suspense>
      </div>
    </>
  );
}

async function DetalheEvento({
  params,
  usuario,
}: {
  params: PageProps<"/agenda/[id]">["params"];
  usuario: Usuario | null;
}) {
  const { id } = await params;
  const eventoBase = await obterEvento(id);
  if (!eventoBase) notFound();

  // A data atual define o que é "próximo" ou "encerrado": calcula na requisição, não no prerender.
  await connection();
  const agora = new Date();
  const emails = usuario ? emailsVerificados(usuario) : null;

  return (
    <ComParticipacao eventos={[eventoBase]} usuario={usuario}>
      {([evento]) => <ConteudoEvento evento={evento} emails={emails} agora={agora} />}
    </ComParticipacao>
  );
}

function ConteudoEvento({
  evento,
  emails,
  agora,
}: {
  evento: EventoComParticipacao;
  emails: EmailUsuario[] | null;
  agora: Date;
}) {
  const formato = rotuloFormato(formatoDoEvento(evento));
  const encerrado = jaAconteceu(evento, agora);
  const participacao = rotuloParticipacao(evento);

  // Desktop: dentro do card "Inscrição". Mobile: logo abaixo da descrição (protótipo M · Evento — detalhe).
  const acoesInscricao = (
    <>
      {/* RN: evento encerrado ou cancelado não exibe o botão de inscrição. */}
      {aceitaInscricao(evento, agora) && (
        <BotaoInscricaoSympla urlSympla={evento.urlSympla} emails={emails} larguraTotal />
      )}
      {evento.cancelado && <p className={styles.aviso}>Este evento foi cancelado pelo capítulo.</p>}
      {!evento.cancelado && encerrado && <p className={styles.aviso}>Este evento já aconteceu.</p>}

      {!evento.cancelado && !encerrado && (
        <a
          href={`/api/agenda/${evento.id}/ics`}
          className={classesBotao({ tipo: "link", className: styles.ics })}
          download
        >
          Adicionar ao meu calendário (.ics)
        </a>
      )}
    </>
  );

  return (
    <div className={styles.colunas}>
      <div className={styles.coluna}>
        <Card as="article" aria-labelledby="titulo-evento" className={styles.cardPrincipal}>
          <ImagemEvento src={evento.imagemUrl} className={styles.imagem} />
          <div className={styles.selos}>
            {evento.cancelado && <Tag variante="erro">Cancelado</Tag>}
            {!evento.cancelado && encerrado && <Tag variante="neutra">Encerrado</Tag>}
            <Tag>{formato}</Tag>
            <Tag variante="violeta">{evento.categoria}</Tag>
            {participacao && <Tag variante={evento.participacao === "ausente" ? "neutra" : "aqua"}>{participacao}</Tag>}
          </div>
          <h1 id="titulo-evento" className={styles.titulo}>
            {evento.titulo}
          </h1>
          <p className={styles.info}>
            {formatarDataCompleta(evento.inicio)} · {formatarFaixaHorario(evento.inicio, evento.fim)} ·{" "}
            {localDoEvento(evento)}
          </p>
          <p className={styles.descricao}>{evento.descricao}</p>
          <div className={styles.acoesMobile}>{acoesInscricao}</div>
        </Card>

        {evento.endereco && (
          <Card aria-labelledby="titulo-local">
            <CardTitulo id="titulo-local">Local</CardTitulo>
            <p className={styles.info}>{localDoEvento(evento)}</p>
            <iframe
              title={`Mapa: ${evento.endereco.nome}`}
              className={styles.mapa}
              src={`https://www.google.com/maps?q=${encodeURIComponent(localDoEvento(evento))}&output=embed`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </Card>
        )}
      </div>

      <aside className={styles.colunaLateral}>
        <Card aria-labelledby="titulo-inscricao">
          <CardTitulo id="titulo-inscricao">Inscrição</CardTitulo>
          <dl className={styles.campos}>
            <div>
              <dt>Data</dt>
              <dd>{formatarDataCurta(evento.inicio)}</dd>
            </div>
            <div>
              <dt>Horário</dt>
              <dd>{formatarFaixaHorario(evento.inicio, evento.fim)}</dd>
            </div>
            <div>
              <dt>Formato</dt>
              <dd>{formato}</dd>
            </div>
            <div>
              <dt>Local</dt>
              <dd>{evento.endereco?.nome ?? "Online"}</dd>
            </div>
          </dl>

          <div className={styles.acoesDesktop}>{acoesInscricao}</div>

          <Alert titulo="A inscrição acontece no Sympla">
            A plataforma não processa pagamento nem emite ingresso. Depois do evento, sua presença é sincronizada
            de volta para cá.
          </Alert>
        </Card>

        {emails && (
          <Card aria-labelledby="titulo-presenca">
            <CardTitulo id="titulo-presenca">Como sua presença é reconhecida</CardTitulo>
            <p className={styles.info}>
              Cruzamos o e-mail da inscrição no Sympla com os endereços verificados no seu perfil.
            </p>
            <ul className={styles.emails}>
              {emails.map((email) => (
                <li key={email.endereco}>
                  <span className={styles.endereco}>{email.endereco}</span>
                  <span className={styles.tipoEmail}>
                    {email.tipo === "principal" ? "Principal" : "Alternativo"} · verificado
                  </span>
                </li>
              ))}
            </ul>
            {/* TODO: virar link para "Meu perfil > E-mails" (ÉP-02, US-02.03) quando o módulo existir. */}
            <p className={styles.tipoEmail}>Para usar outro e-mail, cadastre e verifique o endereço no seu perfil.</p>
          </Card>
        )}
      </aside>
    </div>
  );
}
