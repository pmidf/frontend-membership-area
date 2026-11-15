import { describe, expect, it } from "vitest";

import { ErroApi } from "@/shared/api/erro-api";

import {
  conteudoRascunho,
  conteudoVideo,
  itemTrilhaDe,
  trilhaRascunho,
} from "../mocks/conteudos-admin.handlers";
import {
  camposAlteradosDaTrilha,
  dadosParaCriarTrilha,
  legendaItemTrilha,
  motivoDaFalhaAoPublicar,
  temConteudoPublicado,
  valoresDaTrilha,
} from "./valores-trilha";

const video = itemTrilhaDe(conteudoVideo);
const rascunho = itemTrilhaDe(conteudoRascunho);

describe("valores da trilha", () => {
  it("apara os textos e envia os ids na ordem", () => {
    expect(
      dadosParaCriarTrilha({ titulo: "  Riscos ", descricao: " Base. ", itens: [rascunho, video] }),
    ).toEqual({
      titulo: "Riscos",
      descricao: "Base.",
      ids_conteudos: [rascunho.id_conteudo, video.id_conteudo],
    });
  });

  it("devolve só os campos alterados, comparando a ordem dos itens", () => {
    const iniciais = valoresDaTrilha(trilhaRascunho);

    expect(
      camposAlteradosDaTrilha(iniciais, { ...iniciais, titulo: ` ${iniciais.titulo} ` }),
    ).toEqual({});
    expect(camposAlteradosDaTrilha(iniciais, { ...iniciais, itens: [rascunho, video] })).toEqual({
      ids_conteudos: [rascunho.id_conteudo, video.id_conteudo],
    });
    expect(
      camposAlteradosDaTrilha(iniciais, { ...iniciais, descricao: "Nova", itens: [video] }),
    ).toEqual({ descricao: "Nova", ids_conteudos: [video.id_conteudo] });
  });

  it("descreve tipo, acesso e rascunho de cada item", () => {
    expect(legendaItemTrilha(video)).toBe("Vídeo · Exclusivo para filiados");
    expect(legendaItemTrilha(rascunho)).toBe("Vídeo · Público · Rascunho");
  });

  it("só permite publicar com ao menos um conteúdo publicado", () => {
    expect(temConteudoPublicado([rascunho])).toBe(false);
    expect(temConteudoPublicado([rascunho, video])).toBe(true);
  });

  it("explica por que a publicação falhou", () => {
    const semPublicado = new ErroApi({
      status: 422,
      codigo: "DADOS_INVALIDOS",
      campos: { ids_conteudos: ["A trilha precisa de ao menos um conteúdo publicado"] },
    });
    expect(motivoDaFalhaAoPublicar(semPublicado)).toBe(
      "A trilha precisa de ao menos um conteúdo publicado.",
    );
    expect(motivoDaFalhaAoPublicar(new Error("rede"))).toBe(
      "Não foi possível concluir a ação. Tente novamente.",
    );
  });
});
