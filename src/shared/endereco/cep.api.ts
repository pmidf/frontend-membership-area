import { somenteDigitos } from "@/shared/lib/mascaras";

export type Endereco = {
  logradouro: string;
  bairro: string;
  cidade: string;
  uf: string;
};

type RespostaViaCep = {
  erro?: boolean | string;
  logradouro?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
};

export const URL_VIACEP = "https://viacep.com.br/ws";

export async function buscarEndereco(cep: string): Promise<Endereco | null> {
  try {
    const resposta = await fetch(`${URL_VIACEP}/${somenteDigitos(cep)}/json/`);
    if (!resposta.ok) return null;
    const dados = (await resposta.json()) as RespostaViaCep;
    if (dados.erro) return null;
    return {
      logradouro: dados.logradouro ?? "",
      bairro: dados.bairro ?? "",
      cidade: dados.localidade ?? "",
      uf: dados.uf ?? "",
    };
  } catch {
    return null;
  }
}
