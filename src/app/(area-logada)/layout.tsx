import { NavegacaoInferior } from "@/components/layout/NavegacaoInferior";
import { Sidebar } from "@/components/layout/Sidebar";
import { obterUsuarioAtual } from "@/lib/sessao";
import styles from "./layout.module.css";

export default async function AreaLogadaLayout({ children }: { children: React.ReactNode }) {
  const usuario = await obterUsuarioAtual();

  const statusFiliacao =
    usuario?.statusFiliacao === "filiado"
      ? {
          titulo: "Filiado ativo",
          descricao: usuario.filiacaoValidaAte ? `Filiação válida até ${usuario.filiacaoValidaAte}` : undefined,
        }
      : undefined;

  return (
    <div className={styles.casca}>
      <Sidebar statusFiliacao={statusFiliacao} />
      <main className={styles.principal}>{children}</main>
      <NavegacaoInferior />
    </div>
  );
}
