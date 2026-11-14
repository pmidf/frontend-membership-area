"use client";

import { useCallback, useState } from "react";

import type { PainelGamificacao } from "../tipos/gamificacao";
import { TextoCatalogo, classesCartaoCatalogo, classesMidiaCatalogo } from "./CartaoCatalogo";
import { CartaoConcluido } from "./CartaoConcluido";
import { CartaoSurpresa } from "./CartaoSurpresa";
import { ModalConcluido } from "./ModalConcluido";
import { TabuleiroQuebraCabeca } from "./TabuleiroQuebraCabeca";

function CartaoEmAndamento({
  pecas,
}: {
  pecas: NonNullable<PainelGamificacao["em_andamento"]>["pecas"];
}) {
  return (
    <div className={classesCartaoCatalogo}>
      <span
        className={`${classesMidiaCatalogo} flex items-center bg-neutro-200 md:h-auto md:bg-transparent`}
      >
        <TabuleiroQuebraCabeca pecas={pecas} />
      </span>
      <TextoCatalogo
        titulo="Quebra-cabeça atual"
        detalhe="Em andamento"
        classeDetalhe="text-alerta-700"
      />
    </div>
  );
}

export function CatalogoQuebraCabecas({ painel }: { painel: PainelGamificacao }) {
  const [aberto, setAberto] = useState<string | null>(null);
  const fechar = useCallback(() => setAberto(null), []);
  const concluidoAberto = painel.concluidos.find((item) => item.progresso_id === aberto) ?? null;

  return (
    <section aria-labelledby="titulo-catalogo" className="flex flex-col gap-4 md:gap-7">
      <header className="flex flex-col gap-1">
        <h2 id="titulo-catalogo" className="text-corpo font-bold md:text-h3">
          Catálogo de quebra-cabeças
        </h2>
        <p className="hidden text-corpo-pequeno text-texto-secundario md:block">
          Quebra-cabeças completos ou em andamento.
        </p>
      </header>
      <ul className="grid gap-3 md:grid-cols-3 md:gap-5">
        {painel.em_andamento && (
          <li>
            <CartaoEmAndamento pecas={painel.em_andamento.pecas} />
          </li>
        )}
        {painel.concluidos.map((concluido) => (
          <li key={concluido.progresso_id}>
            <CartaoConcluido concluido={concluido} aoAbrir={setAberto} />
          </li>
        ))}
        <li>
          <CartaoSurpresa
            titulo="Mais quebra-cabeças para descobrir"
            detalhe="Continue colecionando peças"
          />
        </li>
      </ul>
      <ModalConcluido concluido={concluidoAberto} aoFechar={fechar} />
    </section>
  );
}
