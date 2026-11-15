"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";

import { Avatar, Cartao, cn, EstadoErro, EstadoVazio, Esqueleto, LinkVoltar } from "@/shared/ui";
import { classesBotao } from "@/shared/ui/botao/Botao";

import { profissionalNaoEncontrado, useProfissional } from "../api/profissionais.queries";
import type { PerfilProfissional } from "../tipos/profissional";

const CAMINHO_PROFISSIONAIS = "/profissionais";

function CartaoPerfil({ perfil }: { perfil: PerfilProfissional }) {
  const { nome_completo, foto_perfil, cargo, empresa, cidade, uf, mini_bio, linkedin_url } = perfil;

  return (
    <Cartao className="flex flex-col gap-6 p-6 md:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
        <Avatar nome={nome_completo} imagem={foto_perfil} tamanho="lg" />
        <div className="flex min-w-0 flex-col gap-2">
          <h2 className="text-h2 break-words">{nome_completo}</h2>
          <p className="text-corpo text-texto-secundario">
            {cargo} · {empresa} · {cidade}/{uf}
          </p>
        </div>
      </div>
      {mini_bio && (
        <p className="text-corpo whitespace-pre-line text-texto-secundario">{mini_bio}</p>
      )}
      {linkedin_url && (
        <a
          href={linkedin_url}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(classesBotao({ variante: "secundario" }), "self-start")}
        >
          Ver no LinkedIn
          <span className="sr-only"> (abre em nova aba)</span>
        </a>
      )}
    </Cartao>
  );
}

export function PaginaPerfilProfissional() {
  const { id } = useParams<{ id: string }>();
  const consulta = useSearchParams().toString();
  const profissional = useProfissional(id);
  const destinoVolta = consulta ? `${CAMINHO_PROFISSIONAIS}?${consulta}` : CAMINHO_PROFISSIONAIS;

  function conteudo() {
    if (profissional.isPending) {
      return <Esqueleto variante="cartao" quantidade={1} rotulo="Carregando o perfil…" />;
    }
    if (profissionalNaoEncontrado(profissional.error)) {
      return (
        <EstadoVazio
          titulo="Profissional não encontrado ou não está mais na vitrine"
          acao={
            <Link
              href={destinoVolta}
              className={classesBotao({ variante: "secundario", tamanho: "sm" })}
            >
              Ver os profissionais
            </Link>
          }
        />
      );
    }
    if (profissional.isError) {
      return (
        <EstadoErro
          mensagem="Não foi possível carregar o perfil."
          aoTentarNovamente={() => void profissional.refetch()}
        />
      );
    }
    return <CartaoPerfil perfil={profissional.data} />;
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
      <LinkVoltar href={destinoVolta}>Voltar para profissionais</LinkVoltar>
      {conteudo()}
    </div>
  );
}
