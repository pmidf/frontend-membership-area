"use client";

import { useMemo, useState } from "react";
import { Card, CardTitulo } from "@/components/ui/Card";
import { classesBotao } from "@/components/ui/Button";
import { Tag } from "@/components/ui/Tag";
import {
  filtrarParticipantes,
  rotuloCheckIn,
  rotuloVinculo,
  type FiltrosParticipantes,
  type LinhaParticipante,
} from "../linhas-participantes";
import { formatarNumero } from "../numeros";
import { SeletorFiltro } from "./SeletorFiltro";
import styles from "./admin.module.css";

type PainelParticipantesProps = {
  eventoId: string;
  linhas: LinhaParticipante[];
  porTipo: { tipo: string; inscritos: number }[];
  encerrado: boolean;
};

export function PainelParticipantes({ eventoId, linhas, porTipo, encerrado }: PainelParticipantesProps) {
  const [filtros, setFiltros] = useState<FiltrosParticipantes>({});
  const filtradas = useMemo(() => filtrarParticipantes(linhas, filtros), [linhas, filtros]);
  const tipos = useMemo(() => [...new Set(linhas.map((l) => l.tipoIngresso))].sort(), [linhas]);
  const atualizar = (mudanca: Partial<FiltrosParticipantes>) => setFiltros((atual) => ({ ...atual, ...mudanca }));

  const hrefExportar = useMemo(() => {
    const query = new URLSearchParams();
    if (filtros.busca) query.set("q", filtros.busca);
    if (filtros.checkIn) query.set("checkin", filtros.checkIn);
    if (filtros.tipo) query.set("tipo", filtros.tipo);
    if (filtros.vinculo) query.set("vinculo", filtros.vinculo);
    return `/admin/eventos/${eventoId}/participantes/exportar?${query}`;
  }, [eventoId, filtros]);

  return (
    <>
      <Card aria-labelledby="titulo-tipos">
        <div className={styles.cardCabecalho}>
          <CardTitulo id="titulo-tipos">Por tipo de ingresso</CardTitulo>
          {/* A exportação fica registrada na auditoria (RN-05.05.5). */}
          <a href={hrefExportar} className={classesBotao()} download>
            Exportar participantes (CSV)
          </a>
        </div>
        {porTipo.length === 0 ? (
          <p className={styles.texto}>Nenhum inscrito ainda.</p>
        ) : (
          <div className={styles.totais}>
            {porTipo.map(({ tipo, inscritos }) => (
              <div key={tipo} className={styles.total}>
                <span className={styles.totalValor}>{formatarNumero(inscritos)} inscritos</span>
                <span className={styles.totalRotulo}>{tipo}</span>
              </div>
            ))}
          </div>
        )}
      </Card>

      <div className={styles.filtros} role="search">
        <label className={styles.campoBusca}>
          <span className="visually-hidden">Buscar por nome ou e-mail</span>
          <input
            type="search"
            placeholder="Buscar por nome ou e-mail"
            className={styles.busca}
            value={filtros.busca ?? ""}
            onChange={(e) => atualizar({ busca: e.target.value || undefined })}
          />
        </label>
        <SeletorFiltro rotulo="Check-in" valor={filtros.checkIn} aoMudar={(v) => atualizar({ checkIn: v as FiltrosParticipantes["checkIn"] })}>
          <option value="confirmado">Confirmado</option>
          <option value="pendente">{encerrado ? "Não compareceu" : "Pendente"}</option>
          <option value="cancelado">Ingresso cancelado</option>
        </SeletorFiltro>
        <SeletorFiltro rotulo="Tipo de ingresso" valor={filtros.tipo} aoMudar={(v) => atualizar({ tipo: v })}>
          {tipos.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </SeletorFiltro>
        <SeletorFiltro rotulo="Vínculo" valor={filtros.vinculo} aoMudar={(v) => atualizar({ vinculo: v as FiltrosParticipantes["vinculo"] })}>
          <option value="vinculado">Vinculado</option>
          <option value="nao-vinculado">Não vinculado</option>
          <option value="nao-membro">Não é membro</option>
        </SeletorFiltro>
      </div>

      <Card aria-label="Participantes">
        <p className={styles.nota} aria-live="polite">
          {filtradas.length === linhas.length
            ? `${formatarNumero(linhas.length)} participantes`
            : `${formatarNumero(filtradas.length)} de ${formatarNumero(linhas.length)} participantes`}
        </p>
        {filtradas.length === 0 ? (
          <p className={styles.vazio}>Nenhum participante com os filtros selecionados.</p>
        ) : (
          <div className={styles.rolagem}>
            <table className={styles.tabela}>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>E-mail</th>
                  <th>Tipo de ingresso</th>
                  <th>Check-in</th>
                  <th>Vínculo com conta</th>
                </tr>
              </thead>
              <tbody>
                {filtradas.map((l) => (
                  <tr key={l.id}>
                    <td>{l.nome}</td>
                    <td className={styles.textoNormal}>{l.email}</td>
                    <td>{l.tipoIngresso}</td>
                    <td className={l.checkIn && !l.cancelado ? undefined : styles.textoNormal}>{rotuloCheckIn(l, encerrado)}</td>
                    <td>
                      <Tag variante={l.vinculo.tipo === "vinculado" ? "aqua" : l.vinculo.tipo === "nao-membro" ? "neutra" : "violeta"}>
                        {rotuloVinculo(l.vinculo)}
                      </Tag>
                      {l.vinculo.tipo === "vinculado" && l.vinculo.origem === "manual" && (
                        <span className={styles.secundario}>vínculo manual</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  );
}
