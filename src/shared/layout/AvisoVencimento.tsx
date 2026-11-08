"use client";

import Link from "next/link";
import { useState } from "react";

import { diasAte, formatarDiaMes } from "@/shared/lib/datas";
import { useSessao } from "@/shared/sessao/useSessao";
import type { Perfil } from "@/shared/sessao/tipos";
import { Alerta } from "@/shared/ui/alerta/Alerta";

export const JANELA_AVISO_VENCIMENTO = 30;

type Aviso = { tipo: "vencendo" | "vencida"; dataExpiracao: string };

export function avisoDeVencimento(perfil: Perfil | null, agora?: Date): Aviso | null {
  const dataExpiracao = perfil?.filiacao?.data_expiracao;
  if (!perfil || !dataExpiracao) return null;
  if (perfil.filiacao?.situacao === "EXPIRADO") return { tipo: "vencida", dataExpiracao };

  const dias = diasAte(dataExpiracao, agora);
  if (perfil.papeis.filiado && dias >= 0 && dias <= JANELA_AVISO_VENCIMENTO) {
    return { tipo: "vencendo", dataExpiracao };
  }
  return null;
}

function chaveDispensa({ tipo, dataExpiracao }: Aviso): string {
  return `aviso-vencimento:${tipo}:${dataExpiracao.slice(0, 10)}`;
}

function foiDispensado(aviso: Aviso): boolean {
  try {
    return sessionStorage.getItem(chaveDispensa(aviso)) === "1";
  } catch {
    return false;
  }
}

function registrarDispensa(aviso: Aviso) {
  try {
    sessionStorage.setItem(chaveDispensa(aviso), "1");
  } catch {}
}

function AvisoDispensavel({ aviso }: { aviso: Aviso }) {
  const [dispensado, setDispensado] = useState(() => foiDispensado(aviso));

  if (dispensado) return null;

  function dispensar() {
    registrarDispensa(aviso);
    setDispensado(true);
  }

  const data = formatarDiaMes(aviso.dataExpiracao);

  if (aviso.tipo === "vencida") {
    return (
      <Alerta
        tom="erro"
        titulo={`Sua filiação venceu em ${data}.`}
        aoFechar={dispensar}
        acao={
          <Link
            href="/perfil#filiacao"
            className="text-corpo-pequeno font-medium text-texto-marca underline underline-offset-4"
          >
            Atualizar minha situação
          </Link>
        }
      >
        Renove no PMI e depois atualize sua situação em Meu perfil.
      </Alerta>
    );
  }

  return (
    <Alerta tom="alerta" aoFechar={dispensar}>
      Sua filiação vence em {data} — renove no PMI para não perder o acesso.
    </Alerta>
  );
}

export function AvisoVencimento() {
  const { perfil } = useSessao();
  const aviso = avisoDeVencimento(perfil);

  if (!aviso) return null;

  return (
    <div className="px-4 pt-4 md:px-8">
      <AvisoDispensavel key={chaveDispensa(aviso)} aviso={aviso} />
    </div>
  );
}
