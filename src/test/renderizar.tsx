import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, type RenderOptions } from "@testing-library/react";
import type { ReactElement } from "react";

import { ProvedorAvisos } from "@/shared/ui/aviso/ProvedorAvisos";

export function renderizar(componente: ReactElement, opcoes?: RenderOptions) {
  const clienteConsultas = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  return render(
    <QueryClientProvider client={clienteConsultas}>
      <ProvedorAvisos>{componente}</ProvedorAvisos>
    </QueryClientProvider>,
    opcoes,
  );
}
