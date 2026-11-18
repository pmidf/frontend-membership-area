import { Alerta, cn } from "@/shared/ui";

export const TITULO_VITRINE_BLOQUEADA = "Seu perfil foi ocultado da vitrine pelo PMI-DF.";

type PropsAvisoVitrineBloqueada = {
  motivo: string | null;
  id?: string;
  className?: string;
};

export function AvisoVitrineBloqueada({ motivo, id, className }: PropsAvisoVitrineBloqueada) {
  return (
    <div id={id} className={cn(className)}>
      <Alerta tom="erro" papel="status" titulo={TITULO_VITRINE_BLOQUEADA}>
        <p>
          <span className="font-medium">Motivo:</span> {motivo ?? "não informado"}
        </p>
        <p>Para resolver, fale com a diretoria do PMI-DF.</p>
      </Alerta>
    </div>
  );
}
