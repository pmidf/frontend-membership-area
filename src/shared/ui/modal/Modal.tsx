"use client";

import { X } from "lucide-react";
import {
  useEffect,
  useId,
  useRef,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
  type SyntheticEvent,
} from "react";

import { cn } from "../lib/cn";

const SELETOR_FOCAVEIS =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function focaveis(elemento: HTMLElement): HTMLElement[] {
  return Array.from(elemento.querySelectorAll<HTMLElement>(SELETOR_FOCAVEIS));
}

export type PropsModal = {
  aberto: boolean;
  aoFechar: () => void;
  titulo: ReactNode;
  descricao?: ReactNode;
  children?: ReactNode;
  rodape?: ReactNode;
  largura?: "md" | "lg";
  fecharAoClicarFora?: boolean;
};

function ConteudoModal({
  aoFechar,
  titulo,
  descricao,
  children,
  rodape,
  largura = "md",
  fecharAoClicarFora = true,
}: Omit<PropsModal, "aberto">) {
  const dialogo = useRef<HTMLDialogElement>(null);
  const idTitulo = useId();
  const idDescricao = useId();

  useEffect(() => {
    const elemento = dialogo.current;
    if (!elemento) return;
    const anterior = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const rolagemAnterior = document.body.style.overflow;
    elemento.showModal();
    document.body.style.overflow = "hidden";
    const preferido = elemento.querySelector<HTMLElement>("[data-foco-inicial]");
    (preferido ?? focaveis(elemento)[0] ?? elemento).focus();

    return () => {
      if (elemento.open) elemento.close();
      document.body.style.overflow = rolagemAnterior;
      anterior?.focus();
    };
  }, []);

  function aoPressionar(evento: KeyboardEvent<HTMLDialogElement>) {
    if (evento.key === "Escape") {
      evento.preventDefault();
      aoFechar();
      return;
    }
    if (evento.key !== "Tab" || !dialogo.current) return;
    const itens = focaveis(dialogo.current);
    if (itens.length === 0) return;
    const primeiro = itens[0];
    const ultimo = itens[itens.length - 1];
    if (evento.shiftKey && document.activeElement === primeiro) {
      evento.preventDefault();
      ultimo.focus();
    } else if (!evento.shiftKey && document.activeElement === ultimo) {
      evento.preventDefault();
      primeiro.focus();
    }
  }

  function aoClicar(evento: MouseEvent<HTMLDialogElement>) {
    if (fecharAoClicarFora && evento.target === dialogo.current) aoFechar();
  }

  function aoCancelar(evento: SyntheticEvent<HTMLDialogElement>) {
    evento.preventDefault();
    aoFechar();
  }

  return (
    <dialog
      ref={dialogo}
      aria-labelledby={idTitulo}
      aria-describedby={descricao ? idDescricao : undefined}
      onKeyDown={aoPressionar}
      onClick={aoClicar}
      onCancel={aoCancelar}
      className={cn(
        "m-auto w-full rounded-lg bg-fundo-superficie p-0 text-texto-primario shadow-xl backdrop:bg-violeta-950/60",
        largura === "md" ? "max-w-lg" : "max-w-3xl",
        "max-sm:h-full max-sm:max-h-none max-sm:max-w-none max-sm:rounded-none",
      )}
    >
      <div className="flex max-h-[90vh] flex-col max-sm:h-full max-sm:max-h-none">
        <header className="flex items-start justify-between gap-4 p-6 pb-2">
          <div className="flex flex-col gap-1">
            <h2 id={idTitulo} className="text-h3">
              {titulo}
            </h2>
            {descricao && (
              <p id={idDescricao} className="text-corpo-pequeno text-texto-secundario">
                {descricao}
              </p>
            )}
          </div>
          <button
            type="button"
            aria-label="Fechar"
            onClick={aoFechar}
            className="rounded-sm p-1 text-texto-secundario hover:text-texto-primario focus-visible:outline-2 focus-visible:outline-acao-destaque"
          >
            <X aria-hidden="true" className="size-5" />
          </button>
        </header>
        {children && <div className="flex-1 overflow-y-auto px-6 py-4">{children}</div>}
        {rodape && (
          <footer className="flex flex-col-reverse gap-3 border-t border-borda-padrao p-6 sm:flex-row sm:justify-end">
            {rodape}
          </footer>
        )}
      </div>
    </dialog>
  );
}

export function Modal({ aberto, ...props }: PropsModal) {
  if (!aberto) return null;
  return <ConteudoModal {...props} />;
}
