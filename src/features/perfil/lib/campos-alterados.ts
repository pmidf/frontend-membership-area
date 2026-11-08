import { mascararCep, mascararTelefone, somenteDigitos } from "@/shared/lib/mascaras";
import type { Perfil } from "@/shared/sessao/tipos";

import type { AtualizarPerfil } from "../api/perfil.api";
import type { DadosPerfil } from "../schemas/perfil.schema";

export function valoresDoPerfil(perfil: Perfil): DadosPerfil {
  return {
    nome_completo: perfil.nome_completo,
    telefone: mascararTelefone(perfil.telefone),
    data_nascimento: perfil.data_nascimento,
    genero: perfil.genero,
    escolaridade: perfil.escolaridade,
    cep: mascararCep(perfil.cep),
    logradouro: perfil.logradouro,
    numero: perfil.numero,
    complemento: perfil.complemento ?? "",
    bairro: perfil.bairro,
    cidade: perfil.cidade,
    uf: perfil.uf as DadosPerfil["uf"],
    empresa: perfil.empresa,
    cargo: perfil.cargo,
    linkedin_url: perfil.linkedin_url ?? "",
  };
}

function normalizar(dados: DadosPerfil): AtualizarPerfil {
  return {
    nome_completo: dados.nome_completo.trim(),
    telefone: somenteDigitos(dados.telefone),
    data_nascimento: dados.data_nascimento,
    genero: dados.genero,
    escolaridade: dados.escolaridade,
    cep: somenteDigitos(dados.cep),
    logradouro: dados.logradouro.trim(),
    numero: dados.numero.trim(),
    complemento: dados.complemento.trim() || null,
    bairro: dados.bairro.trim(),
    cidade: dados.cidade.trim(),
    uf: dados.uf,
    empresa: dados.empresa.trim(),
    cargo: dados.cargo.trim(),
    linkedin_url: dados.linkedin_url.trim() || null,
  };
}

export function camposAlterados(iniciais: DadosPerfil, atuais: DadosPerfil): AtualizarPerfil {
  const antes = normalizar(iniciais);
  return Object.fromEntries(
    Object.entries(normalizar(atuais)).filter(
      ([campo, valor]) => valor !== antes[campo as keyof AtualizarPerfil],
    ),
  );
}
