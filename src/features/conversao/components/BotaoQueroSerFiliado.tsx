"use client";

import { URL_FILIACAO } from "@/shared/lib/links-externos";
import { useSessao } from "@/shared/sessao/useSessao";
import { classesBotao, type TamanhoBotao, type VarianteBotao } from "@/shared/ui/botao/Botao";
import { cn } from "@/shared/ui/lib/cn";

import type { OrigemConversao } from "../api/conversao.api";
import { useRegistrarCliqueConversao } from "../api/conversao.queries";

type PropsBotaoQueroSerFiliado = {
  origem?: OrigemConversao;
  rotulo?: string;
  variante?: VarianteBotao;
  tamanho?: TamanhoBotao;
  larguraTotal?: boolean;
  className?: string;
};

export function BotaoQueroSerFiliado({
  origem,
  rotulo = "Quero ser filiado",
  variante = "primario",
  tamanho,
  larguraTotal,
  className,
}: PropsBotaoQueroSerFiliado) {
  const { estado } = useSessao();
  const { mutate: registrar } = useRegistrarCliqueConversao();

  function aoClicar() {
    if (origem && estado === "autenticado") registrar(origem);
  }

  return (
    <a
      href={URL_FILIACAO}
      target="_blank"
      rel="noopener noreferrer"
      onClick={aoClicar}
      className={cn(classesBotao({ variante, tamanho, larguraTotal }), className)}
    >
      {rotulo}
      <span className="sr-only"> (abre em nova aba)</span>
    </a>
  );
}
