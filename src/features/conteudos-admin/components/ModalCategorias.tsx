"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import { useState, type FormEvent } from "react";

import { useCategoriasConteudo } from "@/features/conteudos/api/conteudos.queries";
import type { CategoriaConteudo } from "@/features/conteudos/tipos/conteudo";
import { ehErroApi } from "@/shared/api/erro-api";
import { mensagemDeErro } from "@/shared/api/mensagens-erro";
import { Botao, CampoTexto, EstadoErro, Esqueleto, Modal, useAvisos } from "@/shared/ui";

import {
  useCriarCategoria,
  useRenomearCategoria,
  useReordenarCategorias,
} from "../api/categorias-admin.queries";
import { moverCategoria } from "../lib/ordem-categorias";

const TAMANHO_MAXIMO_NOME = 60;

function erroDoNome(erro: unknown): string {
  if (ehErroApi(erro) && erro.status === 409) return "Já existe uma categoria com esse nome.";
  return (ehErroApi(erro) && erro.campos?.desc_categoria?.[0]) || mensagemDeErro(erro);
}

function validarNome(nome: string): string | undefined {
  return nome.trim() === "" ? "Informe o nome da categoria" : undefined;
}

type PropsBotaoOrdem = {
  direcao: "subir" | "descer";
  nome: string;
  desabilitado: boolean;
  aoClicar: () => void;
};

function BotaoOrdem({ direcao, nome, desabilitado, aoClicar }: PropsBotaoOrdem) {
  const Icone = direcao === "subir" ? ChevronUp : ChevronDown;
  return (
    <button
      type="button"
      aria-label={`${direcao === "subir" ? "Subir" : "Descer"} ${nome}`}
      disabled={desabilitado}
      onClick={aoClicar}
      className="inline-flex size-9 shrink-0 items-center justify-center rounded-pill border border-acao-primaria text-texto-marca hover:bg-violeta-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acao-destaque disabled:cursor-not-allowed disabled:opacity-35"
    >
      <Icone aria-hidden="true" className="size-4" />
    </button>
  );
}

type PropsEdicao = {
  categoria: CategoriaConteudo;
  aoTerminar: () => void;
};

function EdicaoNome({ categoria, aoTerminar }: PropsEdicao) {
  const avisos = useAvisos();
  const renomeacao = useRenomearCategoria();
  const [nome, setNome] = useState(categoria.desc_categoria);
  const [erro, setErro] = useState<string>();

  function salvar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const invalido = validarNome(nome);
    if (invalido) return setErro(invalido);
    if (nome.trim() === categoria.desc_categoria) return aoTerminar();
    renomeacao.mutate(
      { cod_categoria: categoria.cod_categoria, desc_categoria: nome.trim() },
      {
        onSuccess: () => {
          avisos.sucesso("Categoria renomeada");
          aoTerminar();
        },
        onError: (falha) => setErro(erroDoNome(falha)),
      },
    );
  }

  return (
    <form noValidate onSubmit={salvar} className="flex min-w-0 flex-1 flex-col gap-3">
      <CampoTexto
        rotulo="Nome da categoria"
        value={nome}
        maxLength={TAMANHO_MAXIMO_NOME}
        ajuda={`Até ${TAMANHO_MAXIMO_NOME} caracteres. O novo nome aparece no catálogo na hora.`}
        erro={erro}
        autoFocus
        onChange={(evento) => {
          setNome(evento.target.value);
          setErro(undefined);
        }}
      />
      <div className="flex items-center gap-4">
        <Botao type="submit" tamanho="sm" carregando={renomeacao.isPending}>
          Salvar
        </Botao>
        <Botao type="button" variante="link" onClick={aoTerminar}>
          Cancelar
        </Botao>
      </div>
    </form>
  );
}

function NovaCategoria() {
  const avisos = useAvisos();
  const criacao = useCriarCategoria();
  const [nome, setNome] = useState("");
  const [erro, setErro] = useState<string>();

  function adicionar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const invalido = validarNome(nome);
    if (invalido) return setErro(invalido);
    criacao.mutate(nome.trim(), {
      onSuccess: ({ desc_categoria }) => {
        avisos.sucesso(`Categoria ${desc_categoria} criada`);
        setNome("");
      },
      onError: (falha) => setErro(erroDoNome(falha)),
    });
  }

  return (
    <form
      noValidate
      onSubmit={adicionar}
      className="flex flex-col gap-3 border-t border-borda-padrao pt-5 sm:flex-row sm:items-start"
    >
      <CampoTexto
        rotulo="Nova categoria"
        placeholder="Ex.: Gestão de riscos"
        value={nome}
        maxLength={TAMANHO_MAXIMO_NOME}
        ajuda="Entra no fim da lista."
        erro={erro}
        className="sm:flex-1"
        onChange={(evento) => {
          setNome(evento.target.value);
          setErro(undefined);
        }}
      />
      <Botao type="submit" variante="secundario" carregando={criacao.isPending} className="sm:mt-7">
        + Adicionar
      </Botao>
    </form>
  );
}

function ListaCategorias() {
  const avisos = useAvisos();
  const categorias = useCategoriasConteudo();
  const reordenacao = useReordenarCategorias();
  const [editando, setEditando] = useState<string | null>(null);

  if (categorias.isPending) {
    return <Esqueleto variante="linha" quantidade={4} rotulo="Carregando as categorias…" />;
  }
  if (categorias.isError) {
    return (
      <EstadoErro
        compacto
        mensagem="Não foi possível carregar as categorias."
        aoTentarNovamente={() => void categorias.refetch()}
      />
    );
  }

  const lista = categorias.data;

  function mover(indice: number, deslocamento: -1 | 1) {
    const novas = moverCategoria(lista, indice, deslocamento);
    if (novas.length === 0) return;
    reordenacao.mutate(novas, {
      onError: () => avisos.erro("Não foi possível mudar a ordem. Tente novamente."),
    });
  }

  return (
    <ol aria-label="Categorias na ordem do catálogo" className="flex flex-col">
      {lista.map((categoria, indice) => (
        <li
          key={categoria.cod_categoria}
          className="flex items-start gap-3 border-b border-borda-padrao py-3"
        >
          <span aria-hidden="true" className="w-5 pt-2 text-corpo-pequeno text-texto-secundario">
            {indice + 1}
          </span>
          {editando === categoria.cod_categoria ? (
            <EdicaoNome categoria={categoria} aoTerminar={() => setEditando(null)} />
          ) : (
            <>
              <span className="min-w-0 flex-1 pt-2 font-medium break-words">
                {categoria.desc_categoria}
              </span>
              <BotaoOrdem
                direcao="subir"
                nome={categoria.desc_categoria}
                desabilitado={indice === 0 || reordenacao.isPending}
                aoClicar={() => mover(indice, -1)}
              />
              <BotaoOrdem
                direcao="descer"
                nome={categoria.desc_categoria}
                desabilitado={indice === lista.length - 1 || reordenacao.isPending}
                aoClicar={() => mover(indice, 1)}
              />
              <Botao
                variante="link"
                aria-label={`Renomear ${categoria.desc_categoria}`}
                onClick={() => setEditando(categoria.cod_categoria)}
                className="min-h-9"
              >
                Renomear
              </Botao>
            </>
          )}
        </li>
      ))}
    </ol>
  );
}

export function ModalCategorias({ aberto, aoFechar }: { aberto: boolean; aoFechar: () => void }) {
  return (
    <Modal
      aberto={aberto}
      aoFechar={aoFechar}
      titulo="Categorias"
      descricao="As categorias viram as seções do catálogo, nesta ordem. Não é possível apagar uma categoria: renomeie quando precisar."
      rodape={<Botao onClick={aoFechar}>Concluir</Botao>}
    >
      <div className="flex flex-col gap-5">
        <ListaCategorias />
        <NovaCategoria />
      </div>
    </Modal>
  );
}
