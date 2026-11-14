"use client";

import Link from "next/link";

import { mensagemDeErro } from "@/shared/api/mensagens-erro";
import { CabecalhoPagina, Cartao, EstadoErro, EstadoVazio, useAvisos } from "@/shared/ui";
import { classesBotao } from "@/shared/ui/botao/Botao";

import {
  transicaoInvalida,
  usePublicarQuebraCabeca,
  useQuebraCabecasAdmin,
} from "../api/quebra-cabecas.queries";
import type { ItemQuebraCabecaAdmin } from "../tipos/quebra-cabeca-admin";
import { MENSAGEM_SITUACAO_MUDOU } from "./AcoesSituacaoQuebraCabeca";
import { TabelaQuebraCabecas } from "./TabelaQuebraCabecas";

export function PaginaQuebraCabecasAdmin() {
  const lista = useQuebraCabecasAdmin();
  const publicacao = usePublicarQuebraCabeca();
  const avisos = useAvisos();

  function publicar(item: ItemQuebraCabecaAdmin) {
    publicacao.mutate(item.id_quebra_cabeca, {
      onSuccess: () => avisos.sucesso(`"${item.nome}" publicado. Ele já entra no sorteio.`),
      onError: (erro) =>
        transicaoInvalida(erro)
          ? avisos.informacao(MENSAGEM_SITUACAO_MUDOU)
          : avisos.erro(mensagemDeErro(erro)),
    });
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <CabecalhoPagina
        titulo="Quebra-cabeças"
        subtitulo="Catálogo completo, com status e progresso dos filiados."
      />
      <div className="flex flex-col gap-3 sm:flex-row">
        <Link href="/admin/quebra-cabecas/novo" className={classesBotao()}>
          + Novo quebra-cabeça
        </Link>
        <Link
          href="/admin/quebra-cabecas/estatisticas"
          className={classesBotao({ variante: "secundario" })}
        >
          📊 Ver estatísticas
        </Link>
      </div>
      <Cartao className="p-0 md:p-2">
        {lista.isError && !lista.data ? (
          <EstadoErro
            compacto
            mensagem="Não foi possível carregar os quebra-cabeças."
            aoTentarNovamente={() => void lista.refetch()}
          />
        ) : (
          <TabelaQuebraCabecas
            quebraCabecas={lista.data ?? []}
            carregando={lista.isPending}
            publicando={publicacao.isPending ? (publicacao.variables ?? null) : null}
            aoPublicar={publicar}
            vazio={
              <EstadoVazio
                titulo="Nenhum quebra-cabeça cadastrado"
                descricao="Cadastre o primeiro para que os filiados possam começar a colecionar."
              />
            }
          />
        )}
      </Cartao>
    </div>
  );
}
