"use client";

import { useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";

import { EmbedYoutube } from "@/features/conteudos/components/EmbedYoutube";
import { ehErroApi } from "@/shared/api/erro-api";
import { mensagemDeErro } from "@/shared/api/mensagens-erro";
import { CampoTexto } from "@/shared/ui";

import { usePreviaYoutube } from "../api/conteudos-admin.queries";
import { ehEnderecoHttp, type DadosConteudo } from "../schemas/conteudo.schema";

function mensagemDaPrevia(erro: unknown): string {
  return (ehErroApi(erro) && erro.campos?.url?.[0]) || mensagemDeErro(erro);
}

export function CampoUrlConteudo() {
  const {
    register,
    control,
    getValues,
    formState: { errors },
  } = useFormContext<DadosConteudo>();
  const [tipo, url] = useWatch({ control, name: ["tipo", "url"] });
  const [conferida, setConferida] = useState(() => getValues("url").trim());
  const ehVideo = tipo === "VIDEO";
  const previa = usePreviaYoutube(ehVideo && ehEnderecoHttp(conferida) ? conferida : "");
  const atual = url.trim() === conferida;
  const erroPrevia = atual && previa.isError ? mensagemDaPrevia(previa.error) : undefined;

  function ajuda() {
    if (!ehVideo) return "Link do material ou da página do PMI Global.";
    if (atual && previa.data) return `ID extraído automaticamente: ${previa.data.video_id}`;
    return "Link do YouTube: youtube.com/watch?v=, youtu.be/ ou youtube.com/embed/.";
  }

  return (
    <div className="flex flex-col gap-3">
      <CampoTexto
        rotulo="URL"
        type="url"
        inputMode="url"
        placeholder="https://"
        ajuda={ajuda()}
        erro={errors.url?.message ?? erroPrevia}
        {...register("url", {
          onBlur: (evento: { target: { value: string } }) =>
            setConferida(evento.target.value.trim()),
        })}
      />
      {ehVideo && atual && previa.data && (
        <EmbedYoutube
          src={previa.data.embed_url}
          titulo="Prévia do vídeo"
          className="aspect-video w-full max-w-sm rounded-md border border-borda-padrao"
        />
      )}
    </div>
  );
}
