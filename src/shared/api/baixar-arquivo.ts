import { buscar, type Consulta } from "./cliente-http";

function nomeDoArquivo(disposicao: string | null, nomePadrao: string): string {
  const encontrado = disposicao?.match(/filename\*?=(?:UTF-8'')?"?([^";]+)"?/i);
  return encontrado ? decodeURIComponent(encontrado[1]) : nomePadrao;
}

export async function baixarArquivo(
  caminho: string,
  nomePadrao: string,
  consulta?: Consulta,
): Promise<string> {
  const resposta = await buscar(caminho, { consulta });
  const nome = nomeDoArquivo(resposta.headers.get("content-disposition"), nomePadrao);
  const endereco = URL.createObjectURL(await resposta.blob());
  const link = document.createElement("a");
  link.href = endereco;
  link.download = nome;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(endereco);
  return nome;
}
