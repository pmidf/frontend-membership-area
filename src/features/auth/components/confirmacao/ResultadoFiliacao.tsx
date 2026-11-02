"use client";

import Link from "next/link";

import { URL_FILIACAO } from "@/shared/lib/links-externos";
import { useSessao } from "@/shared/sessao/useSessao";
import { Alerta, SeloStatus } from "@/shared/ui";
import { classesBotao } from "@/shared/ui/botao/Botao";

import type { ResultadoVinculacao } from "../../api/auth.api";
import { apresentacoesResultado, saudacao } from "../../lib/mensagens-resultado-filiacao";

const classesLink =
  "font-medium text-texto-marca underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-acao-destaque";

export function ResultadoFiliacao({ resultado }: { resultado: ResultadoVinculacao }) {
  const { perfil } = useSessao();
  const { titulo, descricao, filiado, tom, alerta, detalhe, linkFiliacao } =
    apresentacoesResultado[resultado];

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-3">
        <h1 className="text-h2">{titulo}</h1>
        <p className="text-texto-secundario">{descricao}</p>
        <SeloStatus tom={filiado ? "aqua" : "neutro"} className="self-start">
          {filiado ? "Filiado" : "Não filiado"}
        </SeloStatus>
      </header>

      <Alerta
        tom={tom}
        titulo={alerta ?? saudacao(perfil?.nome_completo, perfil?.genero)}
        acao={
          linkFiliacao && (
            <a
              href={URL_FILIACAO}
              target="_blank"
              rel="noopener noreferrer"
              className={classesLink}
            >
              Saiba como se filiar
              <span className="sr-only"> (abre em nova aba)</span>
            </a>
          )
        }
      >
        {detalhe}
      </Alerta>

      {filiado ? (
        <p className="text-legenda text-texto-secundario">
          Nome e PMI ID passam a vir da base do PMI e ficam somente leitura no seu perfil.
        </p>
      ) : (
        <p className="text-corpo-pequeno text-texto-secundario">
          Você pode acompanhar sua situação em{" "}
          <Link href="/perfil#filiacao" className={classesLink}>
            Meu perfil
          </Link>
          .
        </p>
      )}

      <Link href="/inicio" className={classesBotao({ larguraTotal: true })}>
        Entrar na plataforma
      </Link>
    </div>
  );
}
