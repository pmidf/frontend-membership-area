"use client";

import { ExternalLink, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { mensagemDeErro } from "@/shared/api/mensagens-erro";
import { Alerta, Botao, Cartao } from "@/shared/ui";
import { classesBotao } from "@/shared/ui/botao/Botao";

import {
  filiacaoNecessaria,
  muitasTentativas,
  oportunidadeEncerrada,
  useCandidatura,
} from "../api/oportunidades.queries";
import { montarMailto } from "../lib/mailto";
import type { Candidatura } from "../tipos/oportunidade";
import { BotaoCopiarEndereco } from "./BotaoCopiarEndereco";

function MeioRevelado({ candidatura }: { candidatura: Candidatura }) {
  if (candidatura.meio_candidatura === "LINK") {
    return (
      <a
        href={candidatura.url_candidatura}
        target="_blank"
        rel="noopener noreferrer"
        className={classesBotao({ larguraTotal: true })}
      >
        <ExternalLink aria-hidden="true" className="size-4" />
        Candidatar-se no site da empresa
        <span className="sr-only"> (abre em nova aba)</span>
      </a>
    );
  }

  const { email_recrutador, assunto } = candidatura;
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1 rounded-md border border-acao-primaria bg-violeta-50 p-4">
        <span className="text-legenda text-texto-secundario">E-mail do recrutador</span>
        <span className="text-corpo-pequeno font-medium break-all text-texto-marca">
          {email_recrutador}
        </span>
      </div>
      <a
        href={montarMailto(email_recrutador, assunto)}
        className={classesBotao({ larguraTotal: true })}
      >
        <Mail aria-hidden="true" className="size-4" />
        Abrir e-mail para candidatura
      </a>
      <BotaoCopiarEndereco endereco={email_recrutador} />
    </div>
  );
}

export function CartaoCandidatura({ id }: { id: string }) {
  const roteador = useRouter();
  const candidatura = useCandidatura(id);
  const { data, error } = candidatura;
  const semFiliacao = filiacaoNecessaria(error);

  useEffect(() => {
    if (semFiliacao) roteador.replace("/vagas");
  }, [semFiliacao, roteador]);

  function conteudo() {
    if (oportunidadeEncerrada(error)) {
      return (
        <Alerta tom="alerta" titulo="Esta vaga foi encerrada">
          Ela não recebe mais candidaturas. Veja as outras vagas abertas.
        </Alerta>
      );
    }
    if (data) return <MeioRevelado candidatura={data} />;
    return (
      <>
        <p className="text-corpo-pequeno text-texto-secundario">
          O meio de candidatura é exibido só para filiados, quando você pedir.
        </p>
        {error && !semFiliacao && (
          <p role="alert" className="text-corpo-pequeno text-texto-erro">
            {muitasTentativas(error)
              ? "Muitas consultas em pouco tempo. Tente de novo em um minuto."
              : mensagemDeErro(error)}
          </p>
        )}
        <Botao
          larguraTotal
          carregando={candidatura.isPending || semFiliacao}
          onClick={() => candidatura.mutate()}
        >
          Ver como me candidatar
        </Botao>
      </>
    );
  }

  return (
    <Cartao className="flex flex-col gap-4 p-6">
      <h2 className="text-h3">Como se candidatar</h2>
      {conteudo()}
      <p className="text-legenda text-texto-secundario">
        A candidatura acontece direto com a empresa, fora da plataforma. O PMI-DF não recebe
        currículos.
      </p>
    </Cartao>
  );
}
