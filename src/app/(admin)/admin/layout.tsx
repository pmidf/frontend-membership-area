import type { Metadata } from "next";
import { SidebarAdmin } from "@/features/agenda-admin/components/SidebarAdmin";
import styles from "./layout.module.css";

// TODO(auth): o acesso ao console é restringido em src/proxy.ts; a checagem de sessão e papel de Admin entra lá.
export const metadata: Metadata = {
  title: { default: "Console administrativo", template: "%s · Console PMI-DF" },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.casca}>
      <SidebarAdmin />
      <main className={styles.principal}>{children}</main>
    </div>
  );
}
