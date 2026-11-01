import { urlApi } from "@/shared/api/url-api";

export async function verificarApiDisponivel(): Promise<boolean> {
  const resposta = await fetch(urlApi());
  return resposta.ok;
}
