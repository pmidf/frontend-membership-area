"use client";

import { useApiDisponivel } from "../api/saude.queries";

type Estado = "verificando" | "disponivel" | "indisponivel";

const mensagens: Record<Estado, string> = {
  verificando: "Verificando a API…",
  disponivel: "API disponível",
  indisponivel: "API indisponível",
};

const cores: Record<Estado, string> = {
  verificando: "bg-texto-placeholder",
  disponivel: "bg-aqua-600",
  indisponivel: "bg-texto-erro",
};

export function EstadoApi() {
  const { data: disponivel, isPending } = useApiDisponivel();
  const estado: Estado = isPending ? "verificando" : disponivel ? "disponivel" : "indisponivel";

  return (
    <p
      role="status"
      className="inline-flex items-center gap-2 rounded-pill border border-borda-padrao bg-fundo-superficie px-4 py-2 text-corpo-pequeno text-texto-secundario"
    >
      <span aria-hidden="true" className={`size-2 rounded-pill ${cores[estado]}`} />
      {mensagens[estado]}
    </p>
  );
}
