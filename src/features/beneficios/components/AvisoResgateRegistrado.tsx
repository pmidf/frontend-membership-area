import { formatarDataHora } from "@/shared/lib/datas";
import { Alerta } from "@/shared/ui";

export function AvisoResgateRegistrado({ dataResgate }: { dataResgate: string }) {
  return (
    <Alerta tom="sucesso" titulo="Resgate registrado">
      Seu resgate foi salvo em {formatarDataHora(dataResgate)} e já aparece em Meus resgates.
    </Alerta>
  );
}
