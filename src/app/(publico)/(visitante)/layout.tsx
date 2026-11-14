import { SomenteVisitante } from "@/shared/sessao/SomenteVisitante";

export default function LayoutVisitante({ children }: LayoutProps<"/">) {
  return <SomenteVisitante>{children}</SomenteVisitante>;
}
