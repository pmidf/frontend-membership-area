import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { Provedores } from "./provedores";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: { default: "Área de Membros · PMI-DF", template: "%s · Área de Membros PMI-DF" },
  description: "Benefícios, conteúdo, eventos e oportunidades para a comunidade do PMI-DF.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${inter.variable} h-full`}>
      <body className="min-h-full">
        <Provedores>{children}</Provedores>
      </body>
    </html>
  );
}
