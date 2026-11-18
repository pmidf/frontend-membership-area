"use client";

import Link from "next/link";

import { BotaoQueroSerFiliado } from "@/features/conversao/components/BotaoQueroSerFiliado";
import { useSessao } from "@/shared/sessao/useSessao";

import { AvisoVitrineBloqueada } from "./AvisoVitrineBloqueada";

const classesFaixa =
  "flex flex-col gap-3 rounded-md bg-violeta-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between md:px-5";

export function FaixaConviteVitrine() {
  const { perfil, ehFiliado } = useSessao();

  if (!perfil) return null;

  if (perfil.vitrine_bloqueada) {
    return (
      <section aria-label="Perfil ocultado da vitrine">
        <AvisoVitrineBloqueada motivo={perfil.motivo_vitrine_oculta} />
      </section>
    );
  }

  if (ehFiliado && perfil.exibindo_na_vitrine) return null;

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
      <p className="text-corpo-pequeno text-texto-secundario">
        Apareça aqui também — ative a exibição do seu perfil.
      </p>
      <Link
        href="/perfil#preferencias"
        className="text-corpo-pequeno font-medium whitespace-nowrap text-texto-marca underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-acao-destaque"
      >
        Ir para Meu perfil &gt; Preferências
      </Link>
    </section>
  );
}
