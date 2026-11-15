import Link from "next/link";
import type { ReactNode } from "react";

type PropsSecaoResumo = {
  titulo: string;
  rotuloLink: string;
  href: string;
  children: ReactNode;
};

export function SecaoResumo({ titulo, rotuloLink, href, children }: PropsSecaoResumo) {
  return (
    <section aria-label={titulo} className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-h3">{titulo}</h2>
        <Link
          href={href}
          className="text-rotulo whitespace-nowrap text-texto-marca hover:underline"
        >
          {rotuloLink}
        </Link>
      </div>
      {children}
    </section>
  );
}
