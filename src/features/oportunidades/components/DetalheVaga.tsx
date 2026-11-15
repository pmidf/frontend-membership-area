import { formatarData, formatarDataCivil } from "@/shared/lib/datas";
import { Cartao, Etiqueta } from "@/shared/ui";
import { HtmlSeguro } from "@/shared/ui/html-seguro/HtmlSeguro";

import { rotulosModalidade } from "../lib/rotulos";
import type { DetalheOportunidade } from "../tipos/oportunidade";
import { LogoEmpresa } from "./LogoEmpresa";

type PropsDetalheVaga = {
  oportunidade: DetalheOportunidade;
  tituloComo?: "h1" | "h2";
};

export function DetalheVaga({ oportunidade, tituloComo: Titulo = "h1" }: PropsDetalheVaga) {
  const Subtitulo = Titulo === "h1" ? "h2" : "h3";
  const { titulo, empresa, logo_empresa, modalidade, localidade, descricao } = oportunidade;
  const publicacao = oportunidade.data_publicacao && formatarData(oportunidade.data_publicacao);
  const detalhes = [
    {
      termo: "Modalidade",
      valor: modalidade ? rotulosModalidade[modalidade].rotulo : "Não informada",
    },
    { termo: "Localidade", valor: localidade ?? "Não informada" },
    { termo: "Publicada em", valor: publicacao || "Ainda não publicada" },
    {
      termo: "Encerra em",
      valor: oportunidade.data_encerramento
        ? formatarDataCivil(oportunidade.data_encerramento)
        : "60 dias após a publicação",
    },
  ];

  return (
    <article className="flex flex-col gap-6">
      <Cartao className="flex flex-col gap-4 p-6 sm:flex-row sm:items-start">
        <LogoEmpresa empresa={empresa} logo={logo_empresa} />
        <div className="flex min-w-0 flex-col gap-2">
          <Titulo className="text-h2 break-words">{titulo}</Titulo>
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
            {publicacao && <Etiqueta tom="neutro">Publicada em {publicacao}</Etiqueta>}
          </div>
        </div>
      </Cartao>
      <Cartao className="flex flex-col gap-3 p-6">
        <Subtitulo className="text-h3">Sobre a vaga</Subtitulo>
        <HtmlSeguro html={descricao} className="text-corpo text-texto-secundario" />
      </Cartao>
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
    </article>
  );
}
