import { Suspense } from "react";
import type { Usuario } from "@/lib/sessao";
import { comParticipacao, semParticipacao } from "../services/agenda-service";
import type { Evento, EventoComParticipacao } from "../types";

type Renderizar = (eventos: EventoComParticipacao[]) => React.ReactNode;

type ComParticipacaoProps = {
  eventos: Evento[];
  usuario: Usuario | null;
  agora: Date;
  children: Renderizar;
};

/**
 * Mostra os eventos na hora e completa com a situação da pessoa (Inscrito/Presente/Ausente) por streaming:
 * sem cache, a consulta ao Sympla leva alguns segundos e não deve segurar a página.
 */
export function ComParticipacao({ eventos, usuario, agora, children }: ComParticipacaoProps) {
  return (
    <Suspense fallback={children(semParticipacao(eventos))}>
      <ParticipacoesCarregadas eventos={eventos} usuario={usuario} agora={agora}>
        {children}
      </ParticipacoesCarregadas>
    </Suspense>
  );
}

async function ParticipacoesCarregadas({ eventos, usuario, agora, children }: ComParticipacaoProps) {
  return children(await comParticipacao(eventos, usuario, agora));
}
