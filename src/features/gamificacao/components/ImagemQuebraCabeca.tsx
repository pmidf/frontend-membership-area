"use client";

import Image from "next/image";
import { useState } from "react";

import { cn } from "@/shared/ui";

type PropsImagemQuebraCabeca = {
  src: string;
  className?: string;
};

export function ImagemQuebraCabeca({ src, className }: PropsImagemQuebraCabeca) {
  const [falhou, setFalhou] = useState(false);

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-linear-to-r from-violeta-500 to-aqua-600",
        className,
      )}
    >
      {src && !falhou && (
        <Image
          src={src}
          alt=""
          fill
          unoptimized
          sizes="(min-width: 768px) 33vw, 100vw"
          className="object-cover"
          onError={() => setFalhou(true)}
        />
      )}
    </div>
  );
}
