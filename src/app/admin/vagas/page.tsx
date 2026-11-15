import type { Metadata } from "next";
import Link from "next/link";

import { CabecalhoPagina } from "@/shared/ui";
import { classesBotao } from "@/shared/ui/botao/Botao";

export const metadata: Metadata = { title: "Vagas" };

export default function PaginaAdminVagas() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <CabecalhoPagina
        titulo="Vagas"
        subtitulo="Oportunidades de trabalho divulgadas aos filiados."
        acoes={
          <Link href="/admin/vagas/nova" className={classesBotao()}>
            Cadastrar oportunidade
          </Link>
        }
      />
    </div>
  );
}
