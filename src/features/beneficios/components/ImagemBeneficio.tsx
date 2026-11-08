"use client";

import Image from "next/image";
import { useState } from "react";

import { cn } from "@/shared/ui";

type PropsImagemBeneficio = {
  src: string;
  alt?: string;
  className?: string;
};

export function ImagemBeneficio({ src, alt = "", className }: PropsImagemBeneficio) {
  const [falhou, setFalhou] = useState(false);

  return (
    <div
      className={cn(
        "relative h-25 w-full overflow-hidden rounded-md bg-linear-to-r from-violeta-500 to-aqua-600",
        className,
      )}
    >
      {!falhou && (
        <Image
          src={src}
          alt={alt}
          fill
          unoptimized
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover"
          onError={() => setFalhou(true)}
        />
      )}
    </div>
  );
}
