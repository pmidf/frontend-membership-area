"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import inferior from "./NavegacaoInferior.module.css";
import styles from "./Sidebar.module.css";

type ItemNavegacao = {
  rotulo: string;
  href?: string;
  icone: string;
};

// Itens sem `href` são módulos que ainda não existem: aparecem desabilitados.
const ITENS: ItemNavegacao[] = [
  { rotulo: "Início", icone: "/icons/inicio.svg" },
  { rotulo: "Clube de benefícios", icone: "/icons/clube.svg" },
  { rotulo: "Agenda de eventos", href: "/agenda", icone: "/icons/agenda.svg" },
  { rotulo: "Conteúdo exclusivo", icone: "/icons/conteudo.svg" },
  { rotulo: "Vagas", icone: "/icons/vagas.svg" },
  { rotulo: "Minhas conquistas", icone: "/icons/conquistas.svg" },
  { rotulo: "Comunidade", icone: "/icons/comunidade.svg" },
  { rotulo: "Meu perfil", icone: "/icons/perfil.svg" },
];

export function ListaNavegacao({ pathname }: { pathname: string | null }) {
  return (
    <ul className={styles.navegacao}>
      {ITENS.map((item) => {
        if (!item.href) {
          return (
            <li key={item.rotulo}>
              <span className={`${styles.item} ${styles.desabilitado}`} aria-disabled="true" title="Em breve">
                <Image src={item.icone} alt="" width={20} height={20} />
                <span>{item.rotulo}</span>
              </span>
            </li>
          );
        }
        const ativo = pathname !== null && pathname.startsWith(item.href);
        return (
          <li key={item.rotulo}>
            <Link
              href={item.href}
              className={`${styles.item} ${ativo ? styles.ativo : ""}`}
              aria-current={ativo ? "page" : undefined}
            >
              <Image src={item.icone} alt="" width={20} height={20} />
              <span>{item.rotulo}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export function NavegacaoAtiva() {
  return <ListaNavegacao pathname={usePathname()} />;
}

// Barra inferior do mobile: atalhos principais (Figma · "Barra de navegação inferior").
const ITENS_INFERIORES: ItemNavegacao[] = [
  { rotulo: "Início", icone: "/icons/mobile/inicio.svg" },
  { rotulo: "Benefícios", icone: "/icons/mobile/beneficios.svg" },
  { rotulo: "Agenda", href: "/agenda", icone: "/icons/mobile/agenda.svg" },
  { rotulo: "Vagas", icone: "/icons/mobile/vagas.svg" },
  { rotulo: "Perfil", icone: "/icons/mobile/perfil.svg" },
];

export function ListaNavegacaoInferior({ pathname }: { pathname: string | null }) {
  return (
    <ul className={inferior.lista}>
      {ITENS_INFERIORES.map((item) => {
        if (!item.href) {
          return (
            <li key={item.rotulo}>
              <span className={`${inferior.item} ${inferior.desabilitado}`} aria-disabled="true" title="Em breve">
                <span className={inferior.icone} style={{ maskImage: `url(${item.icone})` }} aria-hidden />
                <span>{item.rotulo}</span>
              </span>
            </li>
          );
        }
        const ativo = pathname !== null && pathname.startsWith(item.href);
        return (
          <li key={item.rotulo}>
            <Link
              href={item.href}
              className={`${inferior.item} ${ativo ? inferior.ativo : ""}`}
              aria-current={ativo ? "page" : undefined}
            >
              {/* O ícone é aplicado como máscara para herdar a cor do texto (ativo/inativo). */}
              <span className={inferior.icone} style={{ maskImage: `url(${item.icone})` }} aria-hidden />
              <span>{item.rotulo}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export function NavegacaoInferiorAtiva() {
  return <ListaNavegacaoInferior pathname={usePathname()} />;
}
