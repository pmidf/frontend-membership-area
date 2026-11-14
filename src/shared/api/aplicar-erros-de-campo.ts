import type { FieldValues, Path, UseFormSetError } from "react-hook-form";

import { ehErroApi } from "./erro-api";

export function aplicarErrosDeCampo<T extends FieldValues>(
  erro: unknown,
  definirErro: UseFormSetError<T>,
): Path<T>[] {
  if (!ehErroApi(erro) || !erro.campos) return [];
  const campos = Object.entries(erro.campos).filter(([, mensagens]) => mensagens.length > 0);
  campos.forEach(([campo, mensagens], indice) => {
    definirErro(
      campo as Path<T>,
      { type: "servidor", message: mensagens[0] },
      {
        shouldFocus: indice === 0,
      },
    );
  });
  return campos.map(([campo]) => campo as Path<T>);
}
