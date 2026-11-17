"use client";

import Image from "next/image";
import { useState } from "react";

import { iniciais } from "@/shared/lib/iniciais";
import { cn } from "@/shared/ui";

type PropsLogoEmpresa = {
  empresa: string;
  logo: string | null;
  className?: string;
};

export function LogoEmpresa({ empresa, logo, className }: PropsLogoEmpresa) {
  const [falhou, setFalhou] = useState(false);
  const classes = cn("relative inline-flex size-16 shrink-0 overflow-hidden rounded-md", className);

  if (logo && !falhou) {
    return (
      <span className={cn(classes, "border border-borda-padrao bg-branco")}>
        <Image
          src={logo}
          alt={`Logo da ${empresa}`}
          fill
          unoptimized
          sizes="64px"
          className="object-contain"
          onError={() => setFalhou(true)}
        />
      </span>
    );
  }

  return (
    <span
      role="img"
      aria-label={`Logo da ${empresa}`}
      className={cn(
        classes,
        "items-center justify-center bg-aqua-600 text-corpo font-medium text-texto-inverso",
      )}
    >
      <span aria-hidden="true">{iniciais(empresa)}</span>
    </span>
  );
}
