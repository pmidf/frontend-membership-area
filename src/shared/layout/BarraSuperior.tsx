"use client";

import { Menu } from "lucide-react";
import Link from "next/link";

import { useSessao } from "@/shared/sessao/useSessao";
import { classesBotao } from "@/shared/ui/botao/Botao";
import { Esqueleto } from "@/shared/ui/esqueleto/Esqueleto";
import { cn } from "@/shared/ui/lib/cn";

import { MenuPessoa } from "./MenuPessoa";
import type { ItemDeNavegacao } from "./navegacao";
import { SeloSituacao } from "./SeloSituacao";

type PropsBarraSuperior = {
  titulo: string;
  aoAbrirNavegacao: () => void;
  navegacaoNoMobile?: boolean;
  itensSomenteMobile?: ItemDeNavegacao[];
};

function AreaPessoa({ itensSomenteMobile }: Pick<PropsBarraSuperior, "itensSomenteMobile">) {
  const { estado, ehFiliado } = useSessao();

  if (estado === "carregando") {
    return <Esqueleto variante="circulo" rotulo="Carregando sua conta…" />;
  }

  if (estado === "anonimo") {
    return (
      <Link href="/login" className={classesBotao({ tamanho: "sm" })}>
        Entrar
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <SeloSituacao filiado={ehFiliado} className="md:hidden" />
      <MenuPessoa itensSomenteMobile={itensSomenteMobile} />
    </div>
  );
}

export function BarraSuperior({
  titulo,
  aoAbrirNavegacao,
  navegacaoNoMobile = false,
  itensSomenteMobile,
}: PropsBarraSuperior) {
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-borda-padrao bg-fundo-superficie px-4 md:h-20 md:px-8">
      <button
        type="button"
        onClick={aoAbrirNavegacao}
        aria-label="Abrir navegação"
        className={cn(
          "-ml-2 size-10 items-center justify-center rounded-md text-texto-primario hover:bg-violeta-50 focus-visible:outline-2 focus-visible:outline-acao-destaque lg:hidden",
          navegacaoNoMobile ? "flex" : "hidden md:flex",
        )}
      >
        <Menu aria-hidden="true" className="size-6" />
      </button>
      <p className="flex-1 truncate text-corpo font-bold md:text-h3">{titulo}</p>
      <AreaPessoa itensSomenteMobile={itensSomenteMobile} />
    </header>
  );
}
