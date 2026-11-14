"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

import { Esqueleto } from "@/shared/ui/esqueleto/Esqueleto";

import { caminhoDeLogin } from "./destino-seguro";
import { useSessao } from "./useSessao";

export function CarregandoSessao() {
  return (
    <div className="mx-auto w-full max-w-5xl p-6">
      <Esqueleto variante="cartao" quantidade={2} rotulo="Carregando sua sessão…" />
    </div>
  );
}

export function ExigeLogin({ children }: { children: ReactNode }) {
  const { estado, saiuPorEscolha } = useSessao();
  const roteador = useRouter();

  useEffect(() => {
    if (estado !== "anonimo") return;
    roteador.replace(
      saiuPorEscolha
        ? "/login"
        : caminhoDeLogin(`${window.location.pathname}${window.location.search}`),
    );
  }, [estado, saiuPorEscolha, roteador]);

  if (estado !== "autenticado") return <CarregandoSessao />;
  return <>{children}</>;
}
