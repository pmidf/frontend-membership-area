import type { ReactNode } from "react";

import { PainelInstitucional } from "./PainelInstitucional";

export function LayoutAutenticacao({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <PainelInstitucional />
      <main
        id="conteudo"
        className="flex flex-1 justify-center px-4 py-8 md:py-12 lg:items-center lg:px-12"
      >
        <div className="w-full max-w-100">{children}</div>
      </main>
    </div>
  );
}
