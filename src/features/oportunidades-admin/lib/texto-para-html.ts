const MARCADOR_LISTA = /^[-*]\s+/;

function escapar(texto: string): string {
  return texto.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function desescapar(texto: string): string {
  return texto
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&");
}

type Grupo = { lista: boolean; linhas: string[] };

function agruparLinhas(bloco: string): Grupo[] {
  return bloco
    .split("\n")
    .map((linha) => linha.trim())
    .filter(Boolean)
    .reduce<Grupo[]>((grupos, linha) => {
      const lista = MARCADOR_LISTA.test(linha);
      const conteudo = lista ? linha.replace(MARCADOR_LISTA, "") : linha;
      const ultimo = grupos.at(-1);
      if (ultimo && ultimo.lista === lista) ultimo.linhas.push(conteudo);
      else grupos.push({ lista, linhas: [conteudo] });
      return grupos;
    }, []);
}

function grupoParaHtml({ lista, linhas }: Grupo): string {
  const escapadas = linhas.map(escapar);
  return lista
    ? `<ul>${escapadas.map((linha) => `<li>${linha}</li>`).join("")}</ul>`
    : `<p>${escapadas.join("<br>")}</p>`;
}

export function textoParaHtml(texto: string): string {
  return texto
    .replace(/\r\n?/g, "\n")
    .split(/\n\s*\n/)
    .flatMap(agruparLinhas)
    .map(grupoParaHtml)
    .join("");
}

export function htmlParaTexto(html: string): string {
  const texto = html
    .replace(/\r\n?/g, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<li[^>]*>/gi, "- ")
    .replace(/<\/li>/gi, "\n")
    .replace(/<\/(p|ul|ol)>/gi, "\n\n")
    .replace(/<[^>]*>/g, "");
  return desescapar(texto)
    .split("\n")
    .map((linha) => linha.trim())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
