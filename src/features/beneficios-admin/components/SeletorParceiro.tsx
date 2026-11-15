import type { ComponentProps } from "react";

import { CampoSelecao, EstadoErro } from "@/shared/ui";

import type { Parceiro } from "../api/beneficios-admin.api";

type PropsSeletorParceiro = Omit<ComponentProps<"select">, "children"> & {
  parceiros: Parceiro[] | undefined;
  carregando: boolean;
  indisponivel: boolean;
  aoTentarNovamente: () => void;
  erro?: string;
};

export function SeletorParceiro({
  parceiros,
  carregando,
  indisponivel,
  aoTentarNovamente,
  erro,
  ...props
}: PropsSeletorParceiro) {
  if (indisponivel) {
    return (
      <div className="flex flex-col gap-2">
        <span className="text-rotulo text-texto-primario">Parceiro</span>
        <EstadoErro
          compacto
          titulo="Lista de parceiros indisponível"
          mensagem="Não foi possível carregar os parceiros. Sem eles, o benefício não pode ser salvo."
          aoTentarNovamente={aoTentarNovamente}
          className="rounded-md border border-borda-padrao"
        />
        {erro && (
          <p role="alert" className="text-legenda text-texto-erro">
            {erro}
          </p>
        )}
      </div>
    );
  }

  return (
    <CampoSelecao
      rotulo="Parceiro"
      textoVazio={carregando ? "Carregando parceiros…" : "Selecione o parceiro"}
      opcoes={(parceiros ?? []).map(({ cod_parceiro, nome }) => ({
        valor: cod_parceiro,
        rotulo: nome,
      }))}
      disabled={carregando}
      erro={erro}
      {...props}
    />
  );
}
