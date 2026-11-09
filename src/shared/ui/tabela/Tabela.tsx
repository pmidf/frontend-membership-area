"use client";

import type { ReactNode } from "react";

import { TELA_PEQUENA, useConsultaMidia } from "@/shared/hooks/useConsultaMidia";

import { Esqueleto } from "../esqueleto/Esqueleto";
import { cn } from "../lib/cn";

export type ColunaTabela<T> = {
  id: string;
  cabecalho: ReactNode;
  celula: (item: T) => ReactNode;
  alinhamento?: "inicio" | "fim";
  largura?: string;
  ocultarNoCartao?: boolean;
  cabecalhoCartao?: ReactNode;
  ordenacao?: "ascending" | "descending" | "none";
};

type SelecaoTabela<T> = {
  selecionados: string[];
  aoMudar: (ids: string[]) => void;
  rotulo: (item: T) => string;
};

type PropsTabela<T> = {
  rotulo: string;
  colunas: ColunaTabela<T>[];
  itens: T[];
  chave: (item: T) => string;
  carregando?: boolean;
  vazio?: ReactNode;
  selecao?: SelecaoTabela<T>;
  className?: string;
};

const alinhamentos = { inicio: "text-left", fim: "text-right" };

function CaixaLinha<T>({
  item,
  chave,
  selecao,
}: {
  item: T;
  chave: string;
  selecao: SelecaoTabela<T>;
}) {
  const marcado = selecao.selecionados.includes(chave);
  return (
    <input
      type="checkbox"
      aria-label={selecao.rotulo(item)}
      checked={marcado}
      onChange={() =>
        selecao.aoMudar(
          marcado
            ? selecao.selecionados.filter((id) => id !== chave)
            : [...selecao.selecionados, chave],
        )
      }
      className="size-4 accent-acao-primaria"
    />
  );
}

export function Tabela<T>({
  rotulo,
  colunas,
  itens,
  chave,
  carregando = false,
  vazio,
  selecao,
  className,
}: PropsTabela<T>) {
  const telaPequena = useConsultaMidia(TELA_PEQUENA);

  if (carregando) return <Esqueleto variante="tabela" quantidade={5} className={className} />;
  if (itens.length === 0) return <>{vazio}</>;

  if (telaPequena) {
    return (
      <ul aria-label={rotulo} className={cn("flex flex-col gap-3", className)}>
        {itens.map((item) => (
          <li
            key={chave(item)}
            className="flex gap-3 rounded-md border border-borda-padrao bg-fundo-superficie p-4"
          >
            {selecao && <CaixaLinha item={item} chave={chave(item)} selecao={selecao} />}
            <dl className="grid flex-1 gap-2">
              {colunas
                .filter((coluna) => !coluna.ocultarNoCartao)
                .map((coluna) => (
                  <div key={coluna.id} className="flex justify-between gap-4">
                    <dt className="text-legenda text-texto-secundario">
                      {coluna.cabecalhoCartao ?? coluna.cabecalho}
                    </dt>
                    <dd className="text-right text-corpo-pequeno">{coluna.celula(item)}</dd>
                  </div>
                ))}
            </dl>
          </li>
        ))}
      </ul>
    );
  }

  const todosMarcados =
    selecao !== undefined && itens.every((item) => selecao.selecionados.includes(chave(item)));

  return (
    <div className={cn("overflow-x-auto", className)}>
      <table aria-label={rotulo} className="w-full border-collapse text-corpo-pequeno">
        <thead>
          <tr className="border-b border-borda-padrao text-legenda text-texto-secundario">
            {selecao && (
              <th scope="col" className="w-10 py-3">
                <input
                  type="checkbox"
                  aria-label="Selecionar todos"
                  checked={todosMarcados}
                  onChange={() => selecao.aoMudar(todosMarcados ? [] : itens.map(chave))}
                  className="size-4 accent-acao-primaria"
                />
              </th>
            )}
            {colunas.map((coluna) => (
              <th
                key={coluna.id}
                scope="col"
                aria-sort={coluna.ordenacao}
                style={coluna.largura ? { width: coluna.largura } : undefined}
                className={cn(
                  "px-3 py-3 font-medium",
                  alinhamentos[coluna.alinhamento ?? "inicio"],
                )}
              >
                {coluna.cabecalho}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {itens.map((item) => (
            <tr key={chave(item)} className="border-b border-borda-padrao last:border-0">
              {selecao && (
                <td className="py-4">
                  <CaixaLinha item={item} chave={chave(item)} selecao={selecao} />
                </td>
              )}
              {colunas.map((coluna) => (
                <td
                  key={coluna.id}
                  className={cn(
                    "px-3 py-4 align-middle",
                    alinhamentos[coluna.alinhamento ?? "inicio"],
                  )}
                >
                  {coluna.celula(item)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
