import { TabuleiroQuebraCabeca } from "./TabuleiroQuebraCabeca";

export function TabuleiroVazio({ className }: { className?: string }) {
  return <TabuleiroQuebraCabeca pecas={[]} className={className} />;
}
