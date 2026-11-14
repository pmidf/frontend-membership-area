import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { HtmlSeguro } from "./HtmlSeguro";

function renderizarHtml(html: string) {
  return render(<HtmlSeguro html={html} />).container.firstElementChild!;
}

describe("HtmlSeguro", () => {
  it("mantém a formatação permitida", () => {
    const html =
      "<p>Use <strong>o</strong> <em>código</em></p><ul><li>Um</li></ul><ol><li>Dois</li></ol>";

    expect(renderizarHtml(html).innerHTML).toBe(html);
  });

  it("remove scripts e atributos de evento", () => {
    const raiz = renderizarHtml('<p onclick="alert(1)">Oi</p><script>alert(1)</script>');

    expect(raiz.querySelector("script")).toBeNull();
    expect(raiz.querySelector("p")).not.toHaveAttribute("onclick");
    expect(raiz).toHaveTextContent("Oi");
  });

  it("remove elementos fora da lista, inclusive os que executam ao carregar", () => {
    const raiz = renderizarHtml(
      '<img src="x" onerror="alert(1)"><iframe src="https://exemplo.test"></iframe><svg onload="alert(1)"></svg><p>Fica</p>',
    );

    expect(raiz.querySelector("img, iframe, svg")).toBeNull();
    expect(raiz).toHaveTextContent("Fica");
  });

  it.each(["javascript:alert(1)", "data:text/html,<script>alert(1)</script>", "/caminho-relativo"])(
    "tira o endereço %s do link",
    (href) => {
      expect(renderizarHtml(`<a href="${href}">Link</a>`).querySelector("a")).not.toHaveAttribute(
        "href",
      );
    },
  );

  it("mantém links http(s) e força o rel seguro", () => {
    const link = renderizarHtml(
      '<a href="https://exemplo.test" rel="opener" target="_blank" style="color:red">Site</a>',
    ).querySelector("a");

    expect(link).toHaveAttribute("href", "https://exemplo.test");
    expect(link).toHaveAttribute("rel", "noopener noreferrer nofollow");
    expect(link).not.toHaveAttribute("target");
    expect(link).not.toHaveAttribute("style");
  });

  it("preserva as quebras de linha do texto digitado", () => {
    expect(renderizarHtml("Linha um\nLinha dois")).toHaveClass("whitespace-pre-line");
  });
});
