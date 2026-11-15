import { describe, expect, it } from "vitest";

import { htmlParaTexto, textoParaHtml } from "./texto-para-html";

const descricao = [
  "A SmartKanvas procura uma pessoa analista.",
  "Início imediato.",
  "",
  "Responsabilidades:",
  "- Atualizar cronogramas",
  "- Organizar atas",
  "",
  "",
  "Salário a combinar.",
].join("\n");

describe("texto para HTML", () => {
  it("transforma linha em branco em parágrafo e linhas com hífen em lista", () => {
    expect(textoParaHtml(descricao)).toBe(
      "<p>A SmartKanvas procura uma pessoa analista.<br>Início imediato.</p>" +
        "<p>Responsabilidades:</p>" +
        "<ul><li>Atualizar cronogramas</li><li>Organizar atas</li></ul>" +
        "<p>Salário a combinar.</p>",
    );
  });

  it("aceita asterisco como marcador e quebras de linha do Windows", () => {
    expect(textoParaHtml("* um\r\n* dois")).toBe("<ul><li>um</li><li>dois</li></ul>");
  });

  it("escapa o que parece HTML para não virar marcação", () => {
    expect(textoParaHtml("R&D <script>alert(1)</script>")).toBe(
      "<p>R&amp;D &lt;script&gt;alert(1)&lt;/script&gt;</p>",
    );
  });

  it("devolve vazio para texto em branco", () => {
    expect(textoParaHtml("  \n\n ")).toBe("");
  });
});

describe("HTML para texto", () => {
  it("faz o caminho de volta do HTML gerado, separando parágrafo e lista", () => {
    expect(htmlParaTexto(textoParaHtml(descricao))).toBe(
      [
        "A SmartKanvas procura uma pessoa analista.",
        "Início imediato.",
        "",
        "Responsabilidades:",
        "",
        "- Atualizar cronogramas",
        "- Organizar atas",
        "",
        "Salário a combinar.",
      ].join("\n"),
    );
  });

  it("lê o HTML como o backend devolve depois de sanitizar", () => {
    expect(
      htmlParaTexto(
        '<p>Linha<br />outra &amp; mais</p><ol><li>Um</li><li><strong>Dois</strong></li></ol><p><a href="https://x.com" rel="noopener">link</a></p>',
      ),
    ).toBe("Linha\noutra & mais\n\n- Um\n- Dois\n\nlink");
  });

  it("mantém texto puro com quebras de linha", () => {
    expect(htmlParaTexto("Primeira linha\n\nSegunda &lt;b&gt;")).toBe(
      "Primeira linha\n\nSegunda <b>",
    );
  });

  it("ida e volta repetidas não alteram o resultado", () => {
    const html = textoParaHtml(descricao);
    expect(textoParaHtml(htmlParaTexto(html))).toBe(html);
  });
});
