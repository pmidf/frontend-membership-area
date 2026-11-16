"use client";

import { DIAS_RECENTES, type PeriodoAdmin } from "../periodo";

export function SeletorPeriodo({
  periodo,
  aoMudar,
  className,
}: {
  periodo: PeriodoAdmin;
  aoMudar: (periodo: PeriodoAdmin) => void;
  className?: string;
}) {
  return (
    <label>
      <span className="visually-hidden">Período</span>
      <select
        value={periodo}
        onChange={(e) => aoMudar(e.target.value === "12m" ? "12m" : "recentes")}
        className={className}
      >
        <option value="recentes">Últimos {DIAS_RECENTES} dias e próximos</option>
        <option value="12m">Últimos 12 meses</option>
      </select>
    </label>
  );
}
