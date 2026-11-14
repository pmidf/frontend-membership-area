import type { ReactNode } from "react";

type ItemPrevia = { bloqueado?: boolean };

type PropsPreviaBloqueada<T extends ItemPrevia> = {
  itens: T[];
  chave: (item: T, indice: number) => string;
  renderizarItem: (item: T) => ReactNode;
  resumoAcessivel: string;
  className?: string;
};

export function PreviaBloqueada<T extends ItemPrevia>({
  itens,
  chave,
  renderizarItem,
  resumoAcessivel,
  className,
}: PropsPreviaBloqueada<T>) {
  const temBloqueados = itens.some((item) => item.bloqueado);

  return (
    <div className="relative">
      {temBloqueados && <p className="sr-only">{resumoAcessivel}</p>}
      <ul className={className}>
        {itens.map((item, indice) => (
          <li key={chave(item, indice)}>
            {item.bloqueado ? (
              <div
                inert
                aria-hidden="true"
                data-bloqueado="true"
                className="pointer-events-none blur-sm select-none"
              >
                {renderizarItem(item)}
              </div>
            ) : (
              renderizarItem(item)
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
