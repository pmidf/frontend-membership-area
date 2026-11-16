export const CAMINHO_VAGAS_ADMIN = "/admin/vagas";
export const PARAMETRO_PREVIA = "previa";

export function caminhoDaVaga(id: string, consulta = ""): string {
  return `${CAMINHO_VAGAS_ADMIN}/${id}${consulta ? `?${consulta}` : ""}`;
}
