"use client";

import { Plus } from "lucide-react";
import { useState, type ComponentProps } from "react";

import { Botao, CampoSelecao, CampoTexto, EstadoErro } from "@/shared/ui";

import type { Parceiro } from "../api/beneficios-admin.api";

type PropsSeletorParceiro = Omit<ComponentProps<"select">, "children" | "value"> & {
  value: string;
  parceiros: Parceiro[] | undefined;
  carregando: boolean;
  indisponivel: boolean;
  aoTentarNovamente: () => void;
  aoNovoParceiro: () => void;
  erro?: string;
};

const normalizar = (texto: string) =>
  texto
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();

export function filtrarParceiros(
  parceiros: Parceiro[],
  busca: string,
  selecionado: string,
): Parceiro[] {
  const termo = normalizar(busca);
  if (!termo) return parceiros;
  return parceiros.filter(
    ({ cod_parceiro, nome }) => cod_parceiro === selecionado || normalizar(nome).includes(termo),
  );
}

export function SeletorParceiro({
  parceiros,
  carregando,
  indisponivel,
  aoTentarNovamente,
  aoNovoParceiro,
  erro,
  value,
  disabled,
  ...props
}: PropsSeletorParceiro) {
  const [busca, setBusca] = useState("");

  if (indisponivel) {
    return (
      <div className="flex flex-col gap-2">
        <span className="text-rotulo text-texto-primario">Parceiro</span>
        <EstadoErro
          compacto
          titulo="Lista de parceiros indisponível"
          mensagem="Não foi possível carregar os parceiros. Sem eles, o benefício não pode ser salvo."
          aoTentarNovamente={aoTentarNovamente}
          className="rounded-md border border-borda-padrao"
        />
        {erro && (
          <p role="alert" className="text-legenda text-texto-erro">
            {erro}
          </p>
        )}
      </div>
    );
  }

  const visiveis = filtrarParceiros(parceiros ?? [], busca, value);
  const semResultado = busca.trim() !== "" && visiveis.length === 0;

  return (
    <div className="flex flex-col gap-3">
      <CampoTexto
        rotulo="Buscar parceiro"
        type="search"
        placeholder="Digite parte do nome"
        value={busca}
        disabled={carregando}
        onChange={(evento) => setBusca(evento.target.value)}
        onKeyDown={(evento) => {
          if (evento.key === "Enter") evento.preventDefault();
        }}
      />
      <CampoSelecao
        rotulo="Parceiro"
        textoVazio={
          carregando
            ? "Carregando parceiros…"
            : semResultado
              ? "Nenhum parceiro encontrado"
              : "Selecione o parceiro"
        }
        opcoes={visiveis.map(({ cod_parceiro, nome }) => ({
          valor: cod_parceiro,
          rotulo: nome,
        }))}
        erro={erro}
        value={value}
        {...props}
        disabled={carregando || disabled}
      />
      <Botao
        type="button"
        variante="link"
        className="self-start"
        disabled={carregando}
        onClick={aoNovoParceiro}
      >
        <Plus aria-hidden="true" className="size-4" />
        Novo parceiro
      </Botao>
    </div>
  );
}
