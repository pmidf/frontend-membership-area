"use client";

import DOMPurify from "dompurify";
import { useMemo } from "react";

import { cn } from "../lib/cn";

const TAGS_PERMITIDAS = ["p", "br", "strong", "em", "ul", "ol", "li", "a"];
const ATRIBUTOS_PERMITIDOS = ["href", "rel"];
const ENDERECOS_PERMITIDOS = /^https?:\/\//i;

let ganchoRegistrado = false;

function registrarGancho() {
  if (ganchoRegistrado) return;
  DOMPurify.addHook("afterSanitizeAttributes", (no) => {
    if (no.nodeName === "A") no.setAttribute("rel", "noopener noreferrer nofollow");
  });
  ganchoRegistrado = true;
}

function sanitizar(html: string): string {
  if (!DOMPurify.isSupported) return "";
  registrarGancho();
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: TAGS_PERMITIDAS,
    ALLOWED_ATTR: ATRIBUTOS_PERMITIDOS,
    ALLOWED_URI_REGEXP: ENDERECOS_PERMITIDOS,
  });
}

export function HtmlSeguro({ html, className }: { html: string; className?: string }) {
  const seguro = useMemo(() => sanitizar(html), [html]);

  return (
    <div
      className={cn(
        "break-words whitespace-pre-line [&_a]:text-texto-marca [&_a]:underline [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5",
        className,
      )}
      dangerouslySetInnerHTML={{ __html: seguro }}
    />
  );
}
