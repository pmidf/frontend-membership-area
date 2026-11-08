import { ItemSessao } from "@/features/seguranca/components/ItemSessao";
import { Cartao } from "@/shared/ui";

import type { SessaoPessoa } from "../api/pessoas-admin.api";

export function SessoesPessoa({ sessoes }: { sessoes: SessaoPessoa[] }) {
  return (
    <Cartao className="p-6">
      {sessoes.length === 0 ? (
        <p className="text-corpo-pequeno text-texto-secundario">Nenhuma sessão ativa.</p>
      ) : (
        <ul aria-label="Sessões ativas" className="flex flex-col divide-y divide-borda-padrao">
          {sessoes.map((sessao) => (
            <ItemSessao key={sessao.id_sessao} sessao={sessao} />
          ))}
        </ul>
      )}
    </Cartao>
  );
}
