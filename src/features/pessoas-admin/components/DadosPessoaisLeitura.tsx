import type { ReactNode } from "react";

import { rotulosEscolaridade, rotulosGenero } from "@/features/auth/lib/opcoes-cadastro";
import { formatarDataCivil } from "@/shared/lib/datas";
import { mascararCep, mascararTelefone } from "@/shared/lib/mascaras";
import { Cartao, cn } from "@/shared/ui";

import type { PessoaDetalheAdmin } from "../api/pessoas-admin.api";

const NOTA_PMI = "Dado sincronizado da base do PMI";
const SEM_VALOR = "—";

type PropsDado = {
  rotulo: string;
  nota?: string;
  largo?: boolean;
  children: ReactNode;
};

function Dado({ rotulo, nota, largo = false, children }: PropsDado) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-0.5", largo && "sm:col-span-2")}>
      <dt className="text-legenda text-texto-secundario">{rotulo}</dt>
      <dd className="text-corpo-pequeno break-words whitespace-pre-line">{children}</dd>
      {nota && <dd className="text-legenda text-texto-secundario">{nota}</dd>}
    </div>
  );
}

function enderecoEmUmaLinha(pessoa: PessoaDetalheAdmin): string {
  const { logradouro, numero, complemento, bairro, cidade, uf, cep } = pessoa;
  const rua = [logradouro, numero, complemento].filter(Boolean).join(", ");
  return `${rua} — ${bairro}, ${cidade}/${uf} — CEP ${mascararCep(cep)}`;
}

export function DadosPessoaisLeitura({ pessoa }: { pessoa: PessoaDetalheAdmin }) {
  const nota = pessoa.filiacao?.situacao === "APROVADO" ? NOTA_PMI : undefined;

  return (
    <Cartao className="p-6">
      <dl className="grid gap-5 sm:grid-cols-2">
        <Dado rotulo="Nome completo" nota={nota}>
          {pessoa.nome_completo}
        </Dado>
        <Dado rotulo="PMI ID" nota={nota}>
          {pessoa.filiacao?.pmi_id ?? SEM_VALOR}
        </Dado>
        <Dado rotulo="E-mail principal">{pessoa.email ?? SEM_VALOR}</Dado>
        <Dado rotulo="Telefone">{mascararTelefone(pessoa.telefone)}</Dado>
        <Dado rotulo="Data de nascimento">{formatarDataCivil(pessoa.data_nascimento)}</Dado>
        <Dado rotulo="Gênero">{rotulosGenero[pessoa.genero]}</Dado>
        <Dado rotulo="Escolaridade">{rotulosEscolaridade[pessoa.escolaridade]}</Dado>
        <Dado rotulo="Empresa">{pessoa.empresa}</Dado>
        <Dado rotulo="Cargo">{pessoa.cargo}</Dado>
        <Dado rotulo="LinkedIn">
          {pessoa.linkedin_url ? (
            <a
              href={pessoa.linkedin_url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-texto-marca underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-acao-destaque"
            >
              {pessoa.linkedin_url}
              <span className="sr-only"> (abre em nova aba)</span>
            </a>
          ) : (
            SEM_VALOR
          )}
        </Dado>
        <Dado rotulo="Mini bio" largo>
          {pessoa.mini_bio ?? SEM_VALOR}
        </Dado>
        <Dado rotulo="Endereço" largo>
          {enderecoEmUmaLinha(pessoa)}
        </Dado>
      </dl>
    </Cartao>
  );
}
