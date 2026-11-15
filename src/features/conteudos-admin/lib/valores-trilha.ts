import type { UseFormSetError } from "react-hook-form";

import { rotulosTipo } from "@/features/conteudos/lib/tipo-conteudo";
import { aplicarErrosDeCampo } from "@/shared/api/aplicar-erros-de-campo";
import { ehErroApi } from "@/shared/api/erro-api";
import { mensagemDeErro } from "@/shared/api/mensagens-erro";

import type { DadosTrilha } from "../schemas/trilha.schema";
import type { ConteudoAdmin } from "../tipos/conteudo-admin";
import type {
  AtualizarTrilha,
  CriarTrilha,
  ItemTrilhaAdmin,
  TrilhaAdmin,
} from "../tipos/trilha-admin";

export const CAMINHO_LISTA_TRILHAS = "/admin/conteudos?aba=trilhas";
export const caminhoTrilha = (id: string, consulta = "") =>
  `/admin/conteudos/trilhas/${encodeURIComponent(id)}${consulta ? `?${consulta}` : ""}`;

export function destinoVoltaTrilhas(consulta: string): string {
  return new URLSearchParams(consulta).get("aba") === "trilhas"
    ? `/admin/conteudos?${consulta}`
    : CAMINHO_LISTA_TRILHAS;
}

export const VALORES_NOVA_TRILHA: DadosTrilha = { titulo: "", descricao: "", itens: [] };

export function valoresDaTrilha({ titulo, descricao, itens }: TrilhaAdmin): DadosTrilha {
  return { titulo, descricao, itens };
}

export function itemDoConteudo({
  id_conteudo,
  titulo,
  tipo,
  situacao,
  bol_exclusivo,
}: ConteudoAdmin): ItemTrilhaAdmin {
  return { id_conteudo, titulo, tipo, situacao, bol_exclusivo };
}

export function legendaItemTrilha({ tipo, situacao, bol_exclusivo }: ItemTrilhaAdmin): string {
  return [
    rotulosTipo[tipo],
    bol_exclusivo ? "Exclusivo para filiados" : "Público",
    situacao === "RASCUNHO" && "Rascunho",
  ]
    .filter(Boolean)
    .join(" · ");
}

export function dadosParaCriarTrilha({ titulo, descricao, itens }: DadosTrilha): CriarTrilha {
  return {
    titulo: titulo.trim(),
    descricao: descricao.trim(),
    ids_conteudos: itens.map(({ id_conteudo }) => id_conteudo),
  };
}

export function camposAlteradosDaTrilha(
  iniciais: DadosTrilha,
  atuais: DadosTrilha,
): AtualizarTrilha {
  const antes = dadosParaCriarTrilha(iniciais);
  const depois = dadosParaCriarTrilha(atuais);
  return {
    ...(antes.titulo !== depois.titulo && { titulo: depois.titulo }),
    ...(antes.descricao !== depois.descricao && { descricao: depois.descricao }),
    ...(antes.ids_conteudos.join() !== depois.ids_conteudos.join() && {
      ids_conteudos: depois.ids_conteudos,
    }),
  };
}

export const MENSAGEM_SEM_PUBLICADO = "A trilha precisa de ao menos um conteúdo publicado";

export function temConteudoPublicado(itens: DadosTrilha["itens"]): boolean {
  return itens.some(({ situacao }) => situacao === "PUBLICADO");
}

export function motivoDaFalhaAoPublicar(erro: unknown): string {
  const campo = ehErroApi(erro) ? erro.campos?.ids_conteudos?.[0] : undefined;
  return campo ? `${campo}.` : mensagemDeErro(erro);
}

export function aplicarErrosDaTrilha(
  erro: unknown,
  definirErro: UseFormSetError<DadosTrilha>,
): boolean {
  const mensagemItens = ehErroApi(erro) ? erro.campos?.ids_conteudos?.[0] : undefined;
  const aplicados = aplicarErrosDeCampo(erro, definirErro);
  if (mensagemItens) definirErro("itens", { type: "servidor", message: mensagemItens });
  return aplicados.length > 0;
}
