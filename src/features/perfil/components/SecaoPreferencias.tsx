"use client";

import { useState } from "react";

import { AvisoVitrineBloqueada } from "@/features/profissionais/components/AvisoVitrineBloqueada";
import { mensagemDeErro } from "@/shared/api/mensagens-erro";
import { useFocoNaAncora } from "@/shared/hooks/useFocoNaAncora";
import type { Perfil } from "@/shared/sessao/tipos";
import { Botao, Cartao, EstadoErro, Esqueleto, Interruptor, Modal, useAvisos } from "@/shared/ui";

import type { AtualizarPreferencias } from "../api/preferencias.api";
import { useAtualizarPreferencias, usePreferencias } from "../api/preferencias.queries";

const ID_INTERRUPTOR_VITRINE = "preferencia-vitrine";
const ID_AVISO_VITRINE_BLOQUEADA = "aviso-vitrine-bloqueada";

function DadosExibidos({ perfil }: { perfil: Perfil }) {
  const dados = [
    ["Nome", perfil.nome_completo],
    ["Foto", perfil.foto_perfil ? "Sua foto de perfil" : "Iniciais do nome (sem foto)"],
    ["Cargo", perfil.cargo],
    ["Empresa", perfil.empresa],
    ["Cidade/UF", `${perfil.cidade}/${perfil.uf}`],
    ["Mini bio", perfil.mini_bio ?? "Não preenchida"],
    ["LinkedIn", perfil.linkedin_url ?? "Não informado"],
  ];

  return (
    <div className="flex flex-col gap-3 text-corpo-pequeno">
      <dl
        aria-label="Dados exibidos na vitrine"
        className="flex flex-col gap-2 rounded-md bg-fundo-pagina p-4"
      >
        {dados.map(([rotulo, valor]) => (
          <div key={rotulo} className="flex flex-col gap-0.5 sm:flex-row sm:gap-2">
            <dt className="font-medium sm:w-24 sm:shrink-0">{rotulo}</dt>
            <dd className="break-words text-texto-secundario">{valor}</dd>
          </div>
        ))}
      </dl>
      <p className="text-texto-secundario">
        E-mail, telefone e endereço nunca aparecem. Você pode desligar quando quiser.
      </p>
    </div>
  );
}

export function SecaoPreferencias({ perfil }: { perfil: Perfil }) {
  const titulo = useFocoNaAncora<HTMLHeadingElement>("preferencias");
  const avisos = useAvisos();
  const preferencias = usePreferencias();
  const atualizacao = useAtualizarPreferencias();
  const [confirmandoVitrine, setConfirmandoVitrine] = useState(false);
  const { filiado } = perfil.papeis;
  const vitrineBloqueada = perfil.vitrine_bloqueada;

  function salvar(alteracao: AtualizarPreferencias) {
    atualizacao.mutate(alteracao, {
      onSuccess: () => avisos.sucesso("Preferência salva"),
      onError: (erro) => avisos.erro(mensagemDeErro(erro)),
    });
  }

  function alternarVitrine(ligar: boolean) {
    if (vitrineBloqueada) return;
    if (ligar) setConfirmandoVitrine(true);
    else salvar({ exibir_vitrine: false });
  }

  function conteudo() {
    if (preferencias.isPending) {
      return <Esqueleto variante="cartao" quantidade={1} rotulo="Carregando as preferências…" />;
    }
    if (preferencias.isError) {
      return (
        <EstadoErro
          mensagem="Não foi possível carregar suas preferências."
          aoTentarNovamente={() => void preferencias.refetch()}
        />
      );
    }
    const { gamificacao, email_marketing, exibir_vitrine } = preferencias.data;
    return (
      <Cartao className="flex flex-col divide-y divide-borda-padrao px-6 py-2">
        <Interruptor
          rotulo="Gamificação"
          descricao="Conquiste peças de quebra-cabeça ao participar de eventos."
          checked={gamificacao}
          onChange={(evento) => salvar({ gamificacao: evento.target.checked })}
          className="py-4"
        />
        <Interruptor
          rotulo="E-mail marketing"
          descricao="Novidades e promoções do capítulo. E-mails transacionais continuam sendo enviados."
          checked={email_marketing}
          onChange={(evento) => salvar({ email_marketing: evento.target.checked })}
          className="py-4"
        />
        <div className="flex flex-col gap-3 py-4">
          <Interruptor
            id={ID_INTERRUPTOR_VITRINE}
            rotulo="Exibir meu perfil em “Profissionais da comunidade”"
            descricao={
              <>
                Mostra nome, foto, cargo, empresa, cidade/UF, mini bio e LinkedIn na vitrine do
                capítulo.
                {!filiado && (
                  <span className="mt-1 block font-medium">Disponível para filiados</span>
                )}
              </>
            }
            checked={filiado && exibir_vitrine && !vitrineBloqueada}
            disabled={!filiado || vitrineBloqueada}
            aria-describedby={
              vitrineBloqueada
                ? `${ID_INTERRUPTOR_VITRINE}-descricao ${ID_AVISO_VITRINE_BLOQUEADA}`
                : undefined
            }
            onChange={(evento) => alternarVitrine(evento.target.checked)}
          />
          {vitrineBloqueada && (
            <AvisoVitrineBloqueada
              id={ID_AVISO_VITRINE_BLOQUEADA}
              motivo={perfil.motivo_vitrine_oculta}
            />
          )}
        </div>
      </Cartao>
    );
  }

  return (
    <section
      id="preferencias"
      aria-labelledby="titulo-preferencias"
      className="flex flex-col gap-4"
    >
      <header className="flex flex-col gap-1">
        <h2
          ref={titulo}
          id="titulo-preferencias"
          tabIndex={-1}
          className="scroll-mt-24 text-h3 focus:outline-none"
        >
          Preferências
        </h2>
        <p className="text-corpo-pequeno text-texto-secundario">
          Controle sua exposição e o volume de mensagens que recebe.
        </p>
      </header>
      {conteudo()}
      <Modal
        aberto={confirmandoVitrine}
        aoFechar={() => setConfirmandoVitrine(false)}
        titulo="Exibir seu perfil na vitrine?"
        descricao="Estes dados ficam visíveis para todos os membros na vitrine do capítulo."
        rodape={
          <>
            <Botao variante="secundario" onClick={() => setConfirmandoVitrine(false)}>
              Cancelar
            </Botao>
            <Botao
              onClick={() => {
                setConfirmandoVitrine(false);
                salvar({ exibir_vitrine: true });
              }}
            >
              Exibir meu perfil
            </Botao>
          </>
        }
      >
        <DadosExibidos perfil={perfil} />
      </Modal>
    </section>
  );
}
