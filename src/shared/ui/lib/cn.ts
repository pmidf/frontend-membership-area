import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

const mesclarClasses = extendTailwindMerge({
  extend: {
    theme: {
      text: ["display", "h2", "h3", "corpo", "corpo-pequeno", "rotulo", "botao", "legenda"],
      radius: ["pill"],
    },
  },
});

export function cn(...classes: ClassValue[]): string {
  return mesclarClasses(clsx(classes));
}
