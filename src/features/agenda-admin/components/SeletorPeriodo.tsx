"use client";

import { DIAS_RECENTES, type PeriodoAdmin } from "../periodo";

type SeletorAutoEnvioProps = React.SelectHTMLAttributes<HTMLSelectElement>;

/** <select> que envia o formulário ao mudar. Sem JavaScript, o botão do formulário faz o mesmo papel. */
export function SeletorAutoEnvio(props: SeletorAutoEnvioProps) {
  return <select {...props} onChange={(e) => e.currentTarget.form?.requestSubmit()} />;
}

/**
 * Janela de eventos das telas do console. Aumentar o período aumenta as consultas ao Sympla
 * (participantes de cada evento), por isso o padrão é a janela recente.
 */
export function SeletorPeriodo({ periodo, className }: { periodo: PeriodoAdmin; className?: string }) {
  return (
    <label>
      <span className="visually-hidden">Período</span>
      <SeletorAutoEnvio name="periodo" defaultValue={periodo} className={className}>
        <option value="recentes">Últimos {DIAS_RECENTES} dias e próximos</option>
        <option value="12m">Últimos 12 meses</option>
      </SeletorAutoEnvio>
    </label>
  );
}
