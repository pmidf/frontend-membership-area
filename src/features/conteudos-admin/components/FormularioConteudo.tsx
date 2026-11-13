"use client";

import { useFormContext, useWatch } from "react-hook-form";

import { useCategoriasConteudo } from "@/features/conteudos/api/conteudos.queries";
import { Alerta, CampoAreaTexto, CampoSelecao, CampoTexto, Cartao, Esqueleto } from "@/shared/ui";

import type { DadosConteudo } from "../schemas/conteudo.schema";
import { CampoUrlConteudo } from "./CampoUrlConteudo";

const opcoesTipo = [
  { valor: "VIDEO", rotulo: "Vídeo do YouTube" },
  { valor: "MATERIAL", rotulo: "Material / link" },
];

const opcoesAcesso = [
  { valor: "EXCLUSIVO", rotulo: "Exclusivo para filiados" },
  { valor: "PUBLICO", rotulo: "Público" },
];

export function FormularioConteudo({ tipoTravado = false }: { tipoTravado?: boolean }) {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<DadosConteudo>();
  const [tipo, acesso] = useWatch({ control, name: ["tipo", "acesso"] });
  const categorias = useCategoriasConteudo();
  const ehVideo = tipo === "VIDEO";

  return (
    <Cartao className="flex flex-col gap-5 p-6">
      <h2 className="text-h3">Informações básicas</h2>
      <CampoTexto
        rotulo="Título"
        maxLength={150}
        erro={errors.titulo?.message}
        {...register("titulo")}
      />
      {tipoTravado ? (
        <CampoTexto
          rotulo="Tipo"
          value={opcoesTipo.find(({ valor }) => valor === tipo)?.rotulo ?? ""}
          ajuda="O tipo não muda depois do cadastro."
          readOnly
        />
      ) : (
        <CampoSelecao
          rotulo="Tipo"
          opcoes={opcoesTipo}
          ajuda="Material, link do PMI Global ou vídeo."
          erro={errors.tipo?.message}
          {...register("tipo")}
        />
      )}
      <CampoUrlConteudo />
      <CampoAreaTexto
        rotulo="Descrição"
        rows={4}
        placeholder="Resumo exibido no card e na página do conteúdo."
        erro={errors.descricao?.message}
        {...register("descricao")}
      />
      <div className="grid gap-5 sm:grid-cols-2">
        {categorias.data ? (
          <CampoSelecao
            rotulo="Categoria"
            opcoes={categorias.data.map(({ cod_categoria, desc_categoria }) => ({
              valor: cod_categoria,
              rotulo: desc_categoria,
            }))}
            textoVazio="Selecione"
            erro={errors.cod_categoria?.message}
            {...register("cod_categoria")}
          />
        ) : (
          <Esqueleto variante="linha" rotulo="Carregando as categorias…" className="self-end" />
        )}
        {ehVideo && (
          <CampoTexto
            rotulo="Duração (minutos)"
            inputMode="numeric"
            ajuda="Opcional."
            erro={errors.duracao_minutos?.message}
            {...register("duracao_minutos")}
          />
        )}
      </div>
      <CampoSelecao
        rotulo="Nível de acesso"
        opcoes={opcoesAcesso}
        ajuda="Público mostra o conteúdo a qualquer pessoa logada."
        {...register("acesso")}
      />
      {ehVideo && acesso === "EXCLUSIVO" && (
        <Alerta tom="informacao" titulo="Vídeo exclusivo precisa estar como não listado">
          Confirme no canal do PMI-DF antes de publicar. Vídeo público continua acessível fora da
          plataforma.
        </Alerta>
      )}
    </Cartao>
  );
}
