"use client";

import { useParametrosUrl } from "@/shared/hooks/useParametrosUrl";

import { useEventosComNumeros } from "../api/agenda-admin.queries";
import { DIAS_RECENTES, lerPeriodoAdmin } from "../periodo";
import { AbasEventos } from "./AbasEventos";
import { EstadoConsulta } from "./EstadoConsulta";
import { PainelNumeros } from "./PainelNumeros";
import styles from "./admin.module.css";

export function PaginaNumerosAdmin() {
  const { parametros, atualizar } = useParametrosUrl();
  const periodo = lerPeriodoAdmin(parametros.get("periodo") ?? undefined);
  const eventos = useEventosComNumeros(periodo);

  return (
    <div className={styles.conteudo}>
      <header className={styles.cabecalhoTexto}>
        <h1 className={styles.titulo}>Eventos · Números</h1>
        <p className={styles.subtitulo}>
          Visão analítica dos eventos do Sympla: totais, participação e exportação.
        </p>
      </header>
      <AbasEventos ativa="numeros" />

      <EstadoConsulta consulta={eventos} carregando="Calculando os números dos eventos…">
        {({ linhas, categorias }) => (
          <PainelNumeros
            linhas={linhas}
            categorias={categorias}
            periodo={periodo}
            rotuloPeriodo={
              periodo === "12m" ? "Últimos 12 meses" : `Últimos ${DIAS_RECENTES} dias e próximos`
            }
            aoMudarPeriodo={(novo) => atualizar({ periodo: novo === "12m" ? novo : null })}
          />
        )}
      </EstadoConsulta>
    </div>
  );
}
