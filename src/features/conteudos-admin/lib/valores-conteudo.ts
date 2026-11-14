import { camposDiferentes } from "@/shared/lib/campos-diferentes";

import type { DadosConteudo } from "../schemas/conteudo.schema";
import type { AtualizarConteudo, ConteudoAdmin, CriarConteudo } from "../tipos/conteudo-admin";

export const VALORES_NOVO_CONTEUDO: DadosConteudo = {
  titulo: "",
  tipo: "VIDEO",
  url: "",
  descricao: "",
  cod_categoria: "",
  acesso: "EXCLUSIVO",
  duracao_minutos: "",
};

export function valoresDoConteudo(conteudo: ConteudoAdmin): DadosConteudo {
  return {
    titulo: conteudo.titulo,
    tipo: conteudo.tipo,
    url: conteudo.url,
    descricao: conteudo.descricao,
    cod_categoria: conteudo.cod_categoria,
    acesso: conteudo.bol_exclusivo ? "EXCLUSIVO" : "PUBLICO",
    duracao_minutos:
      conteudo.duracao_segundos === null ? "" : String(Math.round(conteudo.duracao_segundos / 60)),
  };
}

function duracaoEmSegundos({ tipo, duracao_minutos }: DadosConteudo): number | null {
  const minutos = duracao_minutos.trim();
  return tipo === "VIDEO" && minutos !== "" ? Number(minutos) * 60 : null;
}

function normalizar(dados: DadosConteudo): Required<AtualizarConteudo> {
  return {
    titulo: dados.titulo.trim(),
    descricao: dados.descricao.trim(),
    url: dados.url.trim(),
    cod_categoria: dados.cod_categoria,
    bol_exclusivo: dados.acesso === "EXCLUSIVO",
    duracao_segundos: duracaoEmSegundos(dados),
  };
}

export function dadosParaCriar(dados: DadosConteudo): CriarConteudo {
  const { duracao_segundos, ...campos } = normalizar(dados);
  return {
    ...campos,
    tipo: dados.tipo,
    ...(duracao_segundos !== null && { duracao_segundos }),
  };
}

export function camposAlteradosDoConteudo(
  iniciais: DadosConteudo,
  atuais: DadosConteudo,
): AtualizarConteudo {
  return camposDiferentes(normalizar(iniciais), normalizar(atuais));
}
