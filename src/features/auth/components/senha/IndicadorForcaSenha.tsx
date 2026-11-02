import { cn } from "@/shared/ui/lib/cn";

import { classificarForcaSenha, type ForcaSenha } from "../../lib/forca-senha";

const apresentacao: Record<ForcaSenha, { rotulo: string; cor: string; barras: number }> = {
  fraca: { rotulo: "fraca", cor: "bg-erro-700", barras: 1 },
  media: { rotulo: "média", cor: "bg-alerta-700", barras: 2 },
  forte: { rotulo: "forte", cor: "bg-sucesso-700", barras: 3 },
};

export function IndicadorForcaSenha({ senha }: { senha: string }) {
  const forca = classificarForcaSenha(senha);

  return (
    <span aria-live="polite" className="flex items-center gap-2">
      {forca && (
        <>
          <span aria-hidden="true" className="flex gap-1">
            {[1, 2, 3].map((barra) => (
              <span
                key={barra}
                className={cn(
                  "h-1 w-6 rounded-pill bg-borda-padrao",
                  barra <= apresentacao[forca].barras && apresentacao[forca].cor,
                )}
              />
            ))}
          </span>
          Força da senha: {apresentacao[forca].rotulo}
        </>
      )}
    </span>
  );
}
