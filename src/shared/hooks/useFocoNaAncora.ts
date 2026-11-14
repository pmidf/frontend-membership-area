"use client";

import { useEffect, useRef } from "react";

export function useFocoNaAncora<T extends HTMLElement>(ancora: string) {
  const alvo = useRef<T>(null);

  useEffect(() => {
    if (window.location.hash !== `#${ancora}`) return;
    alvo.current?.scrollIntoView({ block: "start" });
    alvo.current?.focus({ preventScroll: true });
  }, [ancora]);

  return alvo;
}
