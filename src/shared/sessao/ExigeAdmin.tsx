"use client";

import { ShieldAlert } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { EstadoVazio } from "@/shared/ui/estado/EstadoVazio";

import { ExigeLogin } from "./ExigeLogin";
import { useSessao } from "./useSessao";

function SomenteAdmin({ children }: { children: ReactNode }) {
  const { ehAdmin } = useSessao();

  if (!ehAdmin) {
    return (
      <EstadoVazio
        icone={ShieldAlert}
        titulo="Acesso restrito"
        descricao="Esta área é exclusiva do console administrativo do PMI-DF."
        acao={
          <Link
            href="/inicio"
            className="text-corpo-pequeno font-medium text-texto-marca underline"
          >
            Voltar para o início
          </Link>
        }
      />
    );
  }

  return <>{children}</>;
}

export function ExigeAdmin({ children }: { children: ReactNode }) {
  return (
    <ExigeLogin>
      <SomenteAdmin>{children}</SomenteAdmin>
    </ExigeLogin>
  );
}
