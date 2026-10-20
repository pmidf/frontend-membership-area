// Geração de CSV compatível com o Excel em português (separador ";" e BOM UTF-8).

/**
 * Escapa uma célula. Valores que começam com = + - @ recebem um apóstrofo para não serem interpretados
 * como fórmula ao abrir a planilha (CSV injection): nomes e e-mails vêm do Sympla, digitados por terceiros.
 */
function celula(valor: string | number) {
  let texto = String(valor);
  if (/^[=+\-@\t\r]/.test(texto)) texto = `'${texto}`;
  return /[";\n\r]/.test(texto) ? `"${texto.replace(/"/g, '""')}"` : texto;
}

export function gerarCsv(linhas: (string | number)[][]) {
  return "﻿" + linhas.map((linha) => linha.map(celula).join(";")).join("\r\n") + "\r\n";
}

export function respostaCsv(conteudo: string, arquivo: string) {
  return new Response(conteudo, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${arquivo}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
