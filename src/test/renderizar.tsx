import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, type RenderOptions } from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";

import { ProvedorSessao } from "@/shared/sessao/ProvedorSessao";
import type { Perfil } from "@/shared/sessao/tipos";
import { ProvedorAvisos } from "@/shared/ui/aviso/ProvedorAvisos";

import { handlersSessao } from "./handlers-sessao";
import { servidor } from "./servidor";

type OpcoesRenderizar = RenderOptions & {
  sessao?: Perfil | null;
};

export function criarClienteDeTeste(): QueryClient {
  return new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
}

export function renderizar(
  componente: ReactElement,
  { sessao = null, ...opcoes }: OpcoesRenderizar = {},
) {
  servidor.use(...handlersSessao(sessao));
  const clienteConsultas = criarClienteDeTeste();

  function Provedores({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={clienteConsultas}>
        <ProvedorSessao>
          <ProvedorAvisos>{children}</ProvedorAvisos>
        </ProvedorSessao>
      </QueryClientProvider>
    );
  }

  return { clienteConsultas, ...render(componente, { wrapper: Provedores, ...opcoes }) };
}
