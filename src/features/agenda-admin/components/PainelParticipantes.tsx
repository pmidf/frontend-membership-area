"use client";

import { useMemo, useState } from "react";
import { Card, CardTitulo } from "@/components/ui/Card";
import { Tag } from "@/components/ui/Tag";
import { useAvisos } from "@/shared/ui/aviso/useAvisos";
import { useExportarParticipantes } from "../api/agenda-admin.queries";
import {
  filtrarParticipantes,
  rotuloCheckIn,
  rotuloVinculo,
  type FiltrosParticipantes,
  type LinhaParticipante,
} from "../linhas-participantes";
import { formatarNumero } from "../numeros";
import { BotaoEnviar } from "./BotaoEnviar";
import { SeletorFiltro } from "./SeletorFiltro";
import styles from "./admin.module.css";

type PainelParticipantesProps = {
  eventoId: string;
  linhas: LinhaParticipante[];
  porTipo: { tipo: string; inscritos: number }[];
  encerrado: boolean;
};

export function PainelParticipantes({
  eventoId,
  linhas,
  porTipo,
  encerrado,
}: PainelParticipantesProps) {
  const [filtros, setFiltros] = useState<FiltrosParticipantes>({});
  const filtradas = useMemo(() => filtrarParticipantes(linhas, filtros), [linhas, filtros]);
  const tipos = useMemo(() => [...new Set(linhas.map((l) => l.tipoIngresso))].sort(), [linhas]);
  const ordenadosPorTipo = useMemo(
    () => [...porTipo].sort((a, b) => b.inscritos - a.inscritos || a.tipo.localeCompare(b.tipo)),
    [porTipo],
  );
  const totalInscritos = porTipo.reduce((total, { inscritos }) => total + inscritos, 0);
  const maiorInscritos = Math.max(1, ...porTipo.map(({ inscritos }) => inscritos));
  const atualizar = (mudanca: Partial<FiltrosParticipantes>) =>
    setFiltros((atual) => ({ ...atual, ...mudanca }));

  const avisos = useAvisos();
  const exportacao = useExportarParticipantes(eventoId);

  function exportar() {
    exportacao.mutate(
      {
        q: filtros.busca,
        checkin: filtros.checkIn,
        tipo: filtros.tipo,
        vinculo: filtros.vinculo,
      },
      {
        onSuccess: () => avisos.sucesso("CSV exportado"),
        onError: () => avisos.erro("Não foi possível exportar. Tente novamente."),
      },
    );
  }

  return (
    <>
      <Card aria-labelledby="titulo-tipos">
        <div className={styles.cardCabecalho}>
          <div className={styles.cardCabecalhoTexto}>
            <CardTitulo id="titulo-tipos">Por tipo de ingresso</CardTitulo>
            {porTipo.length > 0 && (
              <p className={styles.texto}>
                {formatarNumero(porTipo.length)}{" "}
                {porTipo.length === 1 ? "tipo de ingresso" : "tipos de ingresso"} ·{" "}
                {formatarNumero(totalInscritos)} inscritos no total
              </p>
            )}
          </div>
          <BotaoEnviar
            type="button"
            enviando="Exportando…"
            pendente={exportacao.isPending}
            onClick={exportar}
          >
            Exportar participantes (CSV)
          </BotaoEnviar>
        </div>
        {porTipo.length === 0 ? (
          <p className={styles.texto}>Nenhum inscrito ainda.</p>
        ) : (
          <ul className={styles.tiposIngresso}>
            {ordenadosPorTipo.map(({ tipo, inscritos }) => (
              <li key={tipo} className={styles.tipoIngresso}>
                <span className={styles.tipoIngressoNome}>{tipo}</span>
                <span className={styles.tipoIngressoValor}>
                  {formatarNumero(inscritos)} {inscritos === 1 ? "inscrito" : "inscritos"}
                </span>
                <span className={styles.tipoIngressoBarra} aria-hidden="true">
                  <span style={{ width: `${(inscritos / maiorInscritos) * 100}%` }} />
                </span>
              </li>
            ))}
          </ul>
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
        <SeletorFiltro
          rotulo="Check-in"
          valor={filtros.checkIn}
          aoMudar={(v) => atualizar({ checkIn: v as FiltrosParticipantes["checkIn"] })}
        >
          <option value="confirmado">Confirmado</option>
          <option value="pendente">{encerrado ? "Não compareceu" : "Pendente"}</option>
          <option value="cancelado">Ingresso cancelado</option>
        </SeletorFiltro>
        <SeletorFiltro
          rotulo="Tipo de ingresso"
          valor={filtros.tipo}
          aoMudar={(v) => atualizar({ tipo: v })}
        >
          {tipos.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </SeletorFiltro>
        <SeletorFiltro
          rotulo="Vínculo"
          valor={filtros.vinculo}
          aoMudar={(v) => atualizar({ vinculo: v as FiltrosParticipantes["vinculo"] })}
        >
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
                    <td className={l.checkIn && !l.cancelado ? undefined : styles.textoNormal}>
                      {rotuloCheckIn(l, encerrado)}
                    </td>
                    <td>
                      <Tag
                        variante={
                          l.vinculo.tipo === "vinculado"
                            ? "aqua"
                            : l.vinculo.tipo === "nao-membro"
                              ? "neutra"
                              : "violeta"
                        }
                      >
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
