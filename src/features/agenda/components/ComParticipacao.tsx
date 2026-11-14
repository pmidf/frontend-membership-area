import { Suspense } from "react";
import type { Usuario } from "@/lib/sessao";
import { comParticipacao, semParticipacao } from "../services/agenda-service";
import type { Evento, EventoComParticipacao } from "../types";

type Renderizar = (eventos: EventoComParticipacao[]) => React.ReactNode;

type ComParticipacaoProps = {
  eventos: Evento[];
  usuario: Usuario | null;
  children: Renderizar;
};

/**
 * Mostra os eventos na hora e completa com a situação da pessoa (Inscrito/Presente/Ausente) por streaming:
 * é uma consulta pessoal ao backend, sem cache, e não deve segurar a página.
 */
export function ComParticipacao({ eventos, usuario, children }: ComParticipacaoProps) {
  return (
    <Suspense fallback={children(semParticipacao(eventos))}>
      <ParticipacoesCarregadas eventos={eventos} usuario={usuario}>
        {children}
      </ParticipacoesCarregadas>
    </Suspense>
  );
}

async function ParticipacoesCarregadas({ eventos, usuario, children }: ComParticipacaoProps) {
  return children(await comParticipacao(eventos, usuario));
}
