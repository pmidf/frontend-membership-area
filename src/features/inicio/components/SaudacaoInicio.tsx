import Link from "next/link";

import type { Perfil } from "@/shared/sessao/tipos";
import { formatarMesAno } from "@/shared/lib/datas";

import { primeiroNome } from "../lib/selecionar-destaques";

type PropsSaudacaoInicio = { perfil: Perfil; filiado: boolean };

export function SaudacaoInicio({ perfil, filiado }: PropsSaudacaoInicio) {
  const validade = perfil.filiacao?.data_expiracao;

  return (
    <header className="flex flex-col gap-1">
      <h1 className="text-h2 md:text-display">Olá, {primeiroNome(perfil.nome_completo)}</h1>
      {filiado ? (
        validade && (
          <p className="text-corpo text-texto-secundario">
            Sua filiação ao PMI-DF é válida até {formatarMesAno(validade)}.
          </p>
        )
      ) : (
        <p className="text-corpo text-texto-secundario">
          Já é filiado? Confira sua situação em{" "}
          <Link href="/perfil#filiacao" className="text-texto-marca underline">
            Meu perfil
          </Link>
          .
        </p>
      )}
    </header>
  );
}
