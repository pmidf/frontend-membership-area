import { CascaAdmin } from "@/shared/layout/CascaAdmin";
import { ExigeAdmin } from "@/shared/sessao/ExigeAdmin";

export default function LayoutAdmin({ children }: LayoutProps<"/admin">) {
  return (
    <ExigeAdmin>
      <CascaAdmin>{children}</CascaAdmin>
    </ExigeAdmin>
  );
}
