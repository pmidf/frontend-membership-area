import { LayoutAutenticacao } from "@/shared/layout/LayoutAutenticacao";

export default function LayoutPublico({ children }: LayoutProps<"/">) {
  return <LayoutAutenticacao>{children}</LayoutAutenticacao>;
}
