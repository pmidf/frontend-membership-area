import type { ReactNode } from "react";

type PropsSecaoCatalogo = {
  titulo: string;
  children: ReactNode;
};

export function SecaoCatalogo({ titulo, children }: PropsSecaoCatalogo) {
  return (
    <section
      aria-label={titulo}
      className="flex flex-col gap-4 rounded-lg border border-borda-padrao bg-fundo-superficie p-6"
    >
      <h2 className="text-h3">{titulo}</h2>
      {children}
    </section>
  );
}
