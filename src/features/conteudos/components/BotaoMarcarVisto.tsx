"use client";

import { Check } from "lucide-react";

import { Botao, useAvisos } from "@/shared/ui";

import { useAlternarVisto } from "../api/conteudos.queries";
import type { ConteudoAcessivel, TipoConteudo } from "../tipos/conteudo";

const rotulos: Record<TipoConteudo, { marcar: string; desmarcar: string }> = {
  VIDEO: { marcar: "Marcar como assistido", desmarcar: "Assistido — desmarcar" },
  MATERIAL: { marcar: "Marcar como visto", desmarcar: "Visto — desmarcar" },
};

export function BotaoMarcarVisto({ conteudo }: { conteudo: ConteudoAcessivel }) {
  const { id_conteudo, tipo, consumido } = conteudo;
  const alternar = useAlternarVisto(id_conteudo);
  const avisos = useAvisos();
  const { marcar, desmarcar } = rotulos[tipo];

  function aoClicar() {
    alternar.mutate(!consumido, {
      onError: () => avisos.erro("Não foi possível atualizar. Tente novamente."),
    });
  }

  return (
    <Botao
      larguraTotal
      variante={consumido ? "secundario" : "primario"}
      icone={consumido ? <Check aria-hidden="true" className="size-4" /> : undefined}
      onClick={aoClicar}
    >
      {consumido ? desmarcar : marcar}
    </Botao>
  );
}
