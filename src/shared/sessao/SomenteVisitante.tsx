"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

import { destinoDaUrlAtual } from "./destino-seguro";
import { CarregandoSessao } from "./ExigeLogin";
import { useSessao } from "./useSessao";

export function SomenteVisitante({ children }: { children: ReactNode }) {
  const { estado } = useSessao();
  const roteador = useRouter();

  useEffect(() => {
    if (estado !== "autenticado") return;
    roteador.replace(destinoDaUrlAtual());
  }, [estado, roteador]);

  if (estado !== "anonimo") return <CarregandoSessao />;
  return <>{children}</>;
}
