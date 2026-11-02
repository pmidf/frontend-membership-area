import { somenteDigitos } from "@/shared/lib/mascaras";

import type { Cadastro } from "../api/auth.api";
import type { DadosCadastro } from "../schemas/cadastro.schema";

function semVazio(valor: string): string | undefined {
  const aparado = valor.trim();
  return aparado ? aparado : undefined;
}

export function montarCadastro(dados: DadosCadastro): Cadastro {
  return {
    nome_completo: dados.nome_completo.trim(),
    email: dados.email.trim(),
    senha: dados.senha,
    pmi_id: dados.filiado_pmi === "sim" ? dados.pmi_id.trim() : undefined,
    aceite_termos: true,
    telefone: somenteDigitos(dados.telefone),
    data_nascimento: dados.data_nascimento,
    genero: dados.genero,
    escolaridade: dados.escolaridade,
    cep: somenteDigitos(dados.cep),
    logradouro: dados.logradouro.trim(),
    numero: dados.numero.trim(),
    complemento: semVazio(dados.complemento),
    bairro: dados.bairro.trim(),
    cidade: dados.cidade.trim(),
    uf: dados.uf,
    empresa: dados.empresa.trim(),
    cargo: dados.cargo.trim(),
    linkedin_url: semVazio(dados.linkedin_url),
  };
}
