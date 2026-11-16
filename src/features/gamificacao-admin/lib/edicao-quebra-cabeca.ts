import type { DadosQuebraCabeca, QuebraCabecaValidado } from "../schemas/quebra-cabeca.schema";
import type { EditarQuebraCabeca, QuebraCabecaAdmin } from "../tipos/quebra-cabeca-admin";

export function valoresDoQuebraCabeca(quebraCabeca: QuebraCabecaAdmin): DadosQuebraCabeca {
  const recortes = [...quebraCabeca.pecas]
    .sort((a, b) => a.indice - b.indice)
    .map(({ recorte }) => recorte);
  return {
    nome: quebraCabeca.nome,
    legenda: quebraCabeca.legenda,
    historia: quebraCabeca.historia,
    imagem_original: quebraCabeca.imagem_original,
    recortes,
  };
}

export type ResultadoEdicao =
  { tipo: "ok"; alteracoes: EditarQuebraCabeca } | { tipo: "imagem-sem-recortes" };

const CAMPOS_DE_TEXTO = ["nome", "legenda", "historia"] as const;

export function alteracoesDoQuebraCabeca(
  original: DadosQuebraCabeca,
  editado: QuebraCabecaValidado,
): ResultadoEdicao {
  const alteracoes: EditarQuebraCabeca = {};
  for (const campo of CAMPOS_DE_TEXTO) {
    if (editado[campo] !== original[campo].trim()) alteracoes[campo] = editado[campo];
  }

  const imagemMudou = editado.imagem_original !== original.imagem_original.trim();
  const recortesMudaram = editado.recortes.some(
    (recorte, indice) => recorte !== original.recortes[indice]?.trim(),
  );
  if (imagemMudou && !recortesMudaram) return { tipo: "imagem-sem-recortes" };
  if (recortesMudaram) {
    alteracoes.imagem_original = editado.imagem_original;
    alteracoes.recortes = editado.recortes;
  }
  return { tipo: "ok", alteracoes };
}
