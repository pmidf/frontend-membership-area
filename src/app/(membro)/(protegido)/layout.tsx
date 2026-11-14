import { ExigeLogin } from "@/shared/sessao/ExigeLogin";

export default function LayoutProtegido({ children }: LayoutProps<"/">) {
  return <ExigeLogin>{children}</ExigeLogin>;
}
