import type { ReactNode } from "react";

import { formatarData, formatarDataCivil } from "@/shared/lib/datas";
import { Cartao, Etiqueta } from "@/shared/ui";
import { HtmlSeguro } from "@/shared/ui/html-seguro/HtmlSeguro";

import { textoPublicacao } from "../lib/prazo";
import { rotulosModalidade } from "../lib/rotulos";
import type { DetalheOportunidade } from "../tipos/oportunidade";
import { LogoEmpresa } from "./LogoEmpresa";

type PropsDetalheVaga = {
  oportunidade: DetalheOportunidade;
  tituloComo?: "h1" | "h2";
  lateral?: ReactNode;
};

export function DetalheVaga({
  oportunidade,
  tituloComo: Titulo = "h1",
  lateral,
}: PropsDetalheVaga) {
  const Subtitulo = Titulo === "h1" ? "h2" : "h3";
  const { titulo, empresa, logo_empresa, modalidade, localidade, descricao } = oportunidade;
  const { data_publicacao, data_encerramento } = oportunidade;
  const detalhes = [
    {
      termo: "Modalidade",
      valor: modalidade ? rotulosModalidade[modalidade].rotulo : "Não informada",
    },
    { termo: "Localidade", valor: localidade ?? "Não informada" },
    {
      termo: "Publicada em",
      valor: data_publicacao ? formatarData(data_publicacao) : "Ainda não publicada",
    },
    {
      termo: "Expira em",
      valor: data_encerramento ? formatarDataCivil(data_encerramento) : "60 dias após a publicação",
    },
  ];

  const principal = (
    <>
      <Cartao className="flex flex-col gap-4 p-6 sm:flex-row sm:items-start">
        <LogoEmpresa empresa={empresa} logo={logo_empresa} />
        <div className="flex min-w-0 flex-col gap-2">
          <Titulo
            className={
              Titulo === "h1" ? "text-h2 break-words md:text-display" : "text-h2 break-words"
            }
          >
            {titulo}
          </Titulo>
          <p className="text-corpo text-texto-secundario">
            <span className="font-medium text-texto-primario">{empresa}</span>
            {localidade && ` · ${localidade}`}
          </p>
          <div className="flex flex-wrap gap-2">
            {modalidade && (
              <Etiqueta tom={rotulosModalidade[modalidade].tom}>
                {rotulosModalidade[modalidade].rotulo}
              </Etiqueta>
            )}
            {data_publicacao && (
              <Etiqueta tom="neutro">{textoPublicacao(data_publicacao)}</Etiqueta>
            )}
          </div>
        </div>
      </Cartao>
      <Cartao className="flex flex-col gap-3 p-6">
        <Subtitulo className="text-h3">Sobre a vaga</Subtitulo>
        <HtmlSeguro html={descricao} className="text-corpo text-texto-secundario" />
      </Cartao>
    </>
  );

  const cartaoDetalhes = (
    <Cartao className="flex flex-col gap-3 p-6">
      <Subtitulo className="text-h3">Detalhes</Subtitulo>
      <dl className="flex flex-col gap-2 text-corpo-pequeno">
        {detalhes.map(({ termo, valor }) => (
          <div key={termo} className="flex items-center justify-between gap-3">
            <dt className="text-texto-secundario">{termo}</dt>
            <dd className="text-right font-medium">{valor}</dd>
          </div>
        ))}
      </dl>
    </Cartao>
  );

  if (!lateral) {
    return (
      <article className="flex flex-col gap-6">
        {principal}
        {cartaoDetalhes}
      </article>
    );
  }

  return (
    <article className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="flex min-w-0 flex-col gap-6">{principal}</div>
      <div className="flex flex-col gap-6">
        {lateral}
        {cartaoDetalhes}
      </div>
    </article>
  );
}
