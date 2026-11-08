"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import { useSessao } from "@/shared/sessao/useSessao";
import { classesBotao } from "@/shared/ui/botao/Botao";
import { cn } from "@/shared/ui/lib/cn";

import type { OrigemConversao } from "../api/conversao.api";
import { BotaoQueroSerFiliado } from "./BotaoQueroSerFiliado";

type PropsPainelExclusivoFiliados = {
  titulo?: ReactNode;
  descricao: ReactNode;
  origem?: OrigemConversao;
  rotuloCta?: string;
  mostrarJaSouFiliado?: boolean;
  className?: string;
};

export function PainelExclusivoFiliados({
  titulo = "Exclusivo para filiados",
  descricao,
  origem,
  rotuloCta,
  mostrarJaSouFiliado = true,
  className,
}: PropsPainelExclusivoFiliados) {
  const { estado } = useSessao();
  const destinoJaSouFiliado = estado === "autenticado" ? "/perfil#filiacao" : "/login";

  return (
    <section
      aria-label="Exclusivo para filiados"
      className={cn(
        "flex flex-col gap-4 rounded-lg bg-linear-to-r from-violeta-500 to-aqua-600 p-6 text-texto-inverso md:flex-row md:items-center md:justify-between",
        className,
      )}
    >
      <div className="flex flex-col gap-1">
        <h2 className="text-h3">{titulo}</h2>
        <p className="text-corpo-pequeno">{descricao}</p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        {mostrarJaSouFiliado && (
          <Link
            href={destinoJaSouFiliado}
            className={classesBotao({ variante: "inverso", tamanho: "sm" })}
          >
            Já sou filiado
          </Link>
        )}
        <BotaoQueroSerFiliado origem={origem} rotulo={rotuloCta} variante="inverso" tamanho="sm" />
      </div>
    </section>
  );
}
