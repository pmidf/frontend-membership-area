import { SeloStatus } from "@/shared/ui/selo-status/SeloStatus";

type PropsSeloSituacao = {
  filiado: boolean;
  className?: string;
};

export function SeloSituacao({ filiado, className }: PropsSeloSituacao) {
  return (
    <SeloStatus tom={filiado ? "aqua" : "neutro"} className={className}>
      {filiado ? "Filiado ativo" : "Não filiado"}
    </SeloStatus>
  );
}
