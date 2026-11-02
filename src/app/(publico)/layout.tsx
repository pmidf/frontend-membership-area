import { LayoutAutenticacao } from "@/shared/layout/LayoutAutenticacao";
import { SomenteVisitante } from "@/shared/sessao/SomenteVisitante";

export default function LayoutPublico({ children }: LayoutProps<"/">) {
  return (
    <LayoutAutenticacao>
      <SomenteVisitante>{children}</SomenteVisitante>
    </LayoutAutenticacao>
  );
}
