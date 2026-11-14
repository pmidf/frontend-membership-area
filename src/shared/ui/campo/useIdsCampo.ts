import { useId } from "react";

type IdsCampo = {
  idCampo: string;
  idAjuda: string;
  idErro: string;
  descricao: string | undefined;
};

export function useIdsCampo(id: string | undefined, temAjuda: boolean, temErro: boolean): IdsCampo {
  const gerado = useId();
  const idCampo = id ?? gerado;
  const idAjuda = `${idCampo}-ajuda`;
  const idErro = `${idCampo}-erro`;
  const descricao = temErro ? idErro : temAjuda ? idAjuda : undefined;

  return { idCampo, idAjuda, idErro, descricao };
}
