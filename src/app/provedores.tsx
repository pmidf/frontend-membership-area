"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";

import { criarClienteConsultas } from "@/shared/api/criar-cliente-consultas";
import { ProvedorAvisos } from "@/shared/ui/aviso/ProvedorAvisos";

export function Provedores({ children }: { children: ReactNode }) {
  const [clienteConsultas] = useState(criarClienteConsultas);

  return (
    <QueryClientProvider client={clienteConsultas}>
      <ProvedorAvisos>{children}</ProvedorAvisos>
    </QueryClientProvider>
  );
}
