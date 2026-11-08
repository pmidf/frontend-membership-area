"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";

import { EmConstrucao } from "@/shared/layout/EmConstrucao";
import { Esqueleto } from "@/shared/ui";

import { filiacaoNecessaria, useBeneficio } from "../api/beneficios.queries";

export function PaginaDetalheBeneficio() {
  const { id } = useParams<{ id: string }>();
  const roteador = useRouter();
  const beneficio = useBeneficio(id);
  const semFiliacao = filiacaoNecessaria(beneficio.error);

  useEffect(() => {
    if (semFiliacao) roteador.replace("/beneficios");
  }, [semFiliacao, roteador]);

  if (beneficio.isPending || semFiliacao) {
    return <Esqueleto variante="cartao" rotulo="Carregando o benefício…" />;
  }
  return <EmConstrucao titulo="Benefício" />;
}
