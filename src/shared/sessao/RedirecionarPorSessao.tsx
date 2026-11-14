"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { DESTINO_PADRAO } from "./destino-seguro";
import { CarregandoSessao } from "./ExigeLogin";
import { useSessao } from "./useSessao";

export const DESTINO_VISITANTE = "/agenda";

export function RedirecionarPorSessao() {
  const { estado } = useSessao();
  const roteador = useRouter();

  useEffect(() => {
    if (estado === "carregando") return;
    roteador.replace(estado === "autenticado" ? DESTINO_PADRAO : DESTINO_VISITANTE);
  }, [estado, roteador]);

  return <CarregandoSessao />;
}
