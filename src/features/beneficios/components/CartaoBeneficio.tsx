import Link from "next/link";

import { Cartao, cn, Etiqueta } from "@/shared/ui";

import { rotulosCategoria } from "../lib/rotulos-beneficio";
import { situacaoValidade } from "../lib/situacao-validade";
import type { ItemBeneficio } from "../tipos/beneficio";
import { ImagemBeneficio } from "./ImagemBeneficio";

type DadosCartao = Pick<
  ItemBeneficio,
  "titulo" | "imagem" | "parceiro" | "categoria" | "vigencia_fim" | "resgatado"
>;

type PropsCartaoBeneficio = {
  beneficio: DadosCartao;
  href?: string;
};

export function CartaoBeneficio({ beneficio, href }: PropsCartaoBeneficio) {
  const { titulo, imagem, parceiro, categoria, vigencia_fim, resgatado } = beneficio;
  const { rotulo, tom } = rotulosCategoria[categoria];
  const validade = situacaoValidade(vigencia_fim);

  return (
    <Cartao interativo={Boolean(href)} className="relative flex h-full flex-col gap-3 p-4">
      <ImagemBeneficio key={imagem} src={imagem} />
      <div>
        <Etiqueta tom={tom}>{rotulo}</Etiqueta>
      </div>
      <h3 className="line-clamp-2 text-corpo font-bold">
        {href ? (
          <Link href={href} className="after:absolute after:inset-0 focus-visible:outline-none">
            {titulo}
          </Link>
        ) : (
          titulo
        )}
      </h3>
      <p className="text-legenda text-texto-secundario">Parceiro: {parceiro}</p>
      <div className="mt-auto flex items-center justify-between gap-3 text-legenda">
        <span
          className={cn(
            !resgatado && validade.urgente ? "text-texto-erro" : "text-texto-secundario",
          )}
        >
          {resgatado ? "Você já resgatou" : validade.texto}
        </span>
        <span className="font-medium whitespace-nowrap text-texto-marca">
          {resgatado ? "Ver código" : "Resgatar"}
        </span>
      </div>
    </Cartao>
  );
}
