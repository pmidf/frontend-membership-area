import { SomenteVisitante } from "@/shared/sessao/SomenteVisitante";

export default function LayoutPublico({ children }: LayoutProps<"/">) {
  return (
    <SomenteVisitante>
      <main id="conteudo" className="mx-auto flex min-h-screen w-full max-w-xl flex-col px-4 py-10">
        {children}
      </main>
    </SomenteVisitante>
  );
}
