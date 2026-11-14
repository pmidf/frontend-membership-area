import { formatarData } from "@/shared/lib/datas";
import { Avatar, Cartao, Etiqueta, SeloStatus } from "@/shared/ui";

import type { PessoaDetalheAdmin } from "../api/pessoas-admin.api";

export function CabecalhoPessoaAdmin({ pessoa }: { pessoa: PessoaDetalheAdmin }) {
  const { filiado, admin } = pessoa.papeis;
  const ativa = pessoa.situacao_conta === "ATIVA";

  return (
    <Cartao className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:gap-6">
      <Avatar
        nome={pessoa.nome_completo}
        imagem={pessoa.foto_perfil}
        tamanho="lg"
        className="max-sm:size-16 max-sm:text-h3"
      />
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex flex-col gap-1">
          <h1 className="text-h3">{pessoa.nome_completo}</h1>
          {pessoa.email && (
            <p className="text-corpo-pequeno break-words text-texto-secundario">{pessoa.email}</p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <SeloStatus tom={filiado ? "aqua" : "neutro"}>
            {filiado ? "Filiado" : "Não-Filiado"}
          </SeloStatus>
          <SeloStatus tom={ativa ? "aqua" : "erro"}>
            {ativa ? "Conta ativa" : "Conta suspensa"}
          </SeloStatus>
          {admin && <SeloStatus tom="violeta">Admin</SeloStatus>}
          {pessoa.bol_voluntario && <SeloStatus tom="violeta">Voluntário(a)</SeloStatus>}
          <Etiqueta tom="neutro">Cadastrado em {formatarData(pessoa.data_cadastro)}</Etiqueta>
        </div>
      </div>
    </Cartao>
  );
}
