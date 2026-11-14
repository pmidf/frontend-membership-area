"use client";

import { usePathname } from "next/navigation";
import { Suspense, type ReactNode } from "react";

type RenderizarComCaminho = (caminhoAtual: string | null) => ReactNode;

function LeitorCaminho({ children }: { children: RenderizarComCaminho }) {
  return <>{children(usePathname())}</>;
}

export function ComCaminhoAtual({ children }: { children: RenderizarComCaminho }) {
  return (
    <Suspense fallback={children(null)}>
      <LeitorCaminho>{children}</LeitorCaminho>
    </Suspense>
  );
}
