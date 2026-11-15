"use client";

import Link from "next/link";

import { BotaoQueroSerFiliado } from "@/features/conversao/components/BotaoQueroSerFiliado";
import { useSessao } from "@/shared/sessao/useSessao";

const classesFaixa =
  "flex flex-col gap-3 rounded-md bg-violeta-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between md:px-5";

export function FaixaConviteVitrine() {
  const { perfil, ehFiliado } = useSessao();

  if (!perfil || (ehFiliado && perfil.exibindo_na_vitrine)) return null;

  if (!ehFiliado) {
    return (
      <section aria-label="Convite para a vitrine" className={classesFaixa}>
        <p className="text-corpo-pequeno text-texto-secundario">
          Apenas filiados podem se apresentar aqui.
        </p>
        <BotaoQueroSerFiliado origem="VITRINE" variante="inverso" tamanho="sm" />
      </section>
    );
  }

  return (
    <section aria-label="Convite para a vitrine" className={classesFaixa}>
      <div className="flex flex-col gap-1">
        <p className="text-corpo-pequeno text-texto-secundario">
          Apareça aqui também — ative a exibição do seu perfil.
        </p>
        <p className="text-legenda text-texto-secundario">
          A opção de exibição chegará em breve ao seu perfil.
        </p>
      </div>
      <Link
        href="/perfil"
        className="text-corpo-pequeno font-medium whitespace-nowrap text-texto-marca underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-acao-destaque"
      >
        Ir para Meu perfil
      </Link>
    </section>
  );
}
