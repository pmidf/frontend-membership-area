"use client";

import { LogOut, ShieldCheck, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";

import { useSessao } from "@/shared/sessao/useSessao";
import { Avatar } from "@/shared/ui/avatar/Avatar";
import { cn } from "@/shared/ui/lib/cn";

import type { ItemDeNavegacao } from "./navegacao";
import { SeloSituacao } from "./SeloSituacao";

type PropsMenuPessoa = {
  itensSomenteMobile?: ItemDeNavegacao[];
};

const classesItemMenu =
  "flex w-full items-center gap-3 rounded-sm px-3 py-2.5 text-left text-corpo-pequeno text-texto-primario hover:bg-violeta-50 focus-visible:outline-2 focus-visible:outline-acao-destaque";

export function MenuPessoa({ itensSomenteMobile = [] }: PropsMenuPessoa) {
  const { perfil, ehFiliado, ehAdmin, sair } = useSessao();
  const roteador = useRouter();
  const idMenu = useId();
  const [aberto, setAberto] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const gatilhoRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!aberto) return;

    function aoPressionarFora(evento: PointerEvent) {
      if (!containerRef.current?.contains(evento.target as Node)) setAberto(false);
    }
    function aoPressionarTecla(evento: KeyboardEvent) {
      if (evento.key !== "Escape") return;
      setAberto(false);
      gatilhoRef.current?.focus();
    }

    document.addEventListener("pointerdown", aoPressionarFora);
    document.addEventListener("keydown", aoPressionarTecla);
    return () => {
      document.removeEventListener("pointerdown", aoPressionarFora);
      document.removeEventListener("keydown", aoPressionarTecla);
    };
  }, [aberto]);

  if (!perfil) return null;

  const fechar = () => setAberto(false);

  async function aoSair() {
    fechar();
    await sair();
    roteador.replace("/login");
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={gatilhoRef}
        type="button"
        aria-expanded={aberto}
        aria-controls={idMenu}
        onClick={() => setAberto((atual) => !atual)}
        className="flex items-center gap-3 rounded-pill p-0.5 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acao-destaque"
      >
        <span aria-hidden="true">
          <Avatar nome={perfil.nome_completo} imagem={perfil.foto_perfil} />
        </span>
        <span className="sr-only md:hidden">Menu de {perfil.nome_completo}</span>
        <span className="hidden flex-col items-start gap-1 md:flex">
          <span className="text-corpo-pequeno font-medium">{perfil.nome_completo}</span>
          <SeloSituacao filiado={ehFiliado} />
        </span>
      </button>

      <div
        id={idMenu}
        hidden={!aberto}
        className="absolute top-full right-0 z-30 mt-2 w-64 rounded-md border border-borda-padrao bg-fundo-superficie p-2 shadow-lg"
      >
        <ul className="flex flex-col gap-0.5">
          <li>
            <Link href="/perfil" onClick={fechar} className={classesItemMenu}>
              <User aria-hidden="true" className="size-5 text-texto-secundario" />
              Meu perfil
            </Link>
          </li>
          {itensSomenteMobile.map(({ href, rotulo, icone: Icone }) => (
            <li key={href} className="md:hidden">
              <Link href={href} onClick={fechar} className={classesItemMenu}>
                <Icone aria-hidden="true" className="size-5 text-texto-secundario" />
                {rotulo}
              </Link>
            </li>
          ))}
          {ehAdmin && (
            <li>
              <Link href="/admin" onClick={fechar} className={classesItemMenu}>
                <ShieldCheck aria-hidden="true" className="size-5 text-texto-secundario" />
                Console administrativo
              </Link>
            </li>
          )}
          <li className="mt-1 border-t border-borda-padrao pt-1">
            <button type="button" onClick={aoSair} className={cn(classesItemMenu, "text-erro-700")}>
              <LogOut aria-hidden="true" className="size-5" />
              Sair
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
}
