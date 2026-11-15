"use client";

import { useFormContext, useWatch } from "react-hook-form";

import { CartaoBeneficio } from "@/features/beneficios/components/CartaoBeneficio";
import { Cartao } from "@/shared/ui";

import { ehImagemValida, type DadosBeneficio } from "../schemas/beneficio.schema";

type PropsPreviaCardBeneficio = {
  parceiro: string;
  semMoldura?: boolean;
};

export function PreviaCardBeneficio({ parceiro, semMoldura = false }: PropsPreviaCardBeneficio) {
  const { control } = useFormContext<DadosBeneficio>();
  const [titulo, imagem, categoria, vigenciaFim] = useWatch({
    control,
    name: ["titulo", "imagem", "categoria", "vigencia_fim"],
  });
  const enderecoImagem = imagem.trim();
  const cartao = (
    <CartaoBeneficio
      beneficio={{
        titulo: titulo.trim() || "Título da vantagem",
        imagem: ehImagemValida(enderecoImagem) ? enderecoImagem : "",
        parceiro,
        categoria,
        vigencia_fim: vigenciaFim || null,
        resgatado: false,
      }}
    />
  );

  if (semMoldura) return cartao;

  return (
    <Cartao className="flex flex-col gap-4 p-6">
      <h2 className="text-h3">Prévia do card</h2>
      {cartao}
    </Cartao>
  );
}
