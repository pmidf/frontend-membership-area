"use client";

import type { ReactNode } from "react";

import { EstadoErro } from "@/shared/ui/estado/EstadoErro";

import styles from "./admin.module.css";

type EstadoConsultaProps<T> = {
  consulta: { data: T | undefined; isError: boolean; refetch: () => unknown };
  carregando: string;
  children: (dados: T) => ReactNode;
};

export function EstadoConsulta<T>({ consulta, carregando, children }: EstadoConsultaProps<T>) {
  if (consulta.isError && consulta.data === undefined) {
    return (
      <EstadoErro
        titulo="Não foi possível carregar o console"
        mensagem="O backend da plataforma não respondeu. Tente novamente em alguns instantes."
        aoTentarNovamente={() => consulta.refetch()}
      />
    );
  }
  if (consulta.data === undefined) return <p className={styles.texto}>{carregando}</p>;
  return <>{children(consulta.data)}</>;
}
