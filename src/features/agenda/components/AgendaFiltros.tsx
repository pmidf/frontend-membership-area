"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import type { VisaoAgenda } from "../types";
import styles from "./AgendaFiltros.module.css";

type AgendaFiltrosProps = {
  visao: VisaoAgenda;
  categorias: string[];
};

const ESPERA_BUSCA_MS = 300;

export function AgendaFiltros({ visao, categorias }: AgendaFiltrosProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pendente, iniciarTransicao] = useTransition();
  const [busca, setBusca] = useState(searchParams.get("q") ?? "");

  function atualizar(chave: string, valor: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (valor) params.set(chave, valor);
    else params.delete(chave);
    iniciarTransicao(() => {
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    });
  }

  useEffect(() => {
    if (busca === (searchParams.get("q") ?? "")) return;
    const temporizador = setTimeout(() => atualizar("q", busca || null), ESPERA_BUSCA_MS);
    return () => clearTimeout(temporizador);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reage apenas à digitação
  }, [busca]);

  function hrefVisao(destino: VisaoAgenda) {
    const params = new URLSearchParams(searchParams.toString());
    if (destino === "calendario") params.set("visao", "calendario");
    else params.delete("visao");
    const query = params.toString();
    return query ? `${pathname}?${query}` : pathname;
  }

  return (
    <div className={styles.filtros} aria-busy={pendente}>
      <nav className={styles.alternador} aria-label="Visão da agenda">
        <Link
          href={hrefVisao("lista")}
          className={`${styles.opcaoVisao} ${visao === "lista" ? styles.ativa : ""}`}
          aria-current={visao === "lista" ? "page" : undefined}
          scroll={false}
        >
          Lista
        </Link>
        <Link
          href={hrefVisao("calendario")}
          className={`${styles.opcaoVisao} ${visao === "calendario" ? styles.ativa : ""}`}
          aria-current={visao === "calendario" ? "page" : undefined}
          scroll={false}
        >
          Calendário
        </Link>
      </nav>

      <label className={styles.busca}>
        <span className="visually-hidden">Buscar evento</span>
        <input type="search" placeholder="Buscar evento" value={busca} onChange={(e) => setBusca(e.target.value)} />
      </label>

      <div className={styles.chips}>
        <label className={styles.seletor}>
          <span className="visually-hidden">Formato</span>
          <select value={searchParams.get("formato") ?? ""} onChange={(e) => atualizar("formato", e.target.value || null)}>
            <option value="">Formato</option>
            <option value="online">Online</option>
            <option value="presencial">Presencial</option>
          </select>
        </label>

        <label className={styles.seletor}>
          <span className="visually-hidden">Categoria</span>
          <select
            value={searchParams.get("categoria") ?? ""}
            onChange={(e) => atualizar("categoria", e.target.value || null)}
          >
            <option value="">Categoria</option>
            {categorias.map((categoria) => (
              <option key={categoria} value={categoria}>
                {categoria}
              </option>
            ))}
          </select>
        </label>

        {/* No calendário o período é dado pelo mês navegado. */}
        {visao === "lista" && (
          <label className={styles.seletor}>
            <span className="visually-hidden">Período</span>
            <select value={searchParams.get("periodo") ?? ""} onChange={(e) => atualizar("periodo", e.target.value || null)}>
              <option value="">Período</option>
              <option value="30d">Próximos 30 dias</option>
              <option value="90d">Próximos 90 dias</option>
              <option value="passados">Eventos passados</option>
            </select>
          </label>
        )}
      </div>
    </div>
  );
}
