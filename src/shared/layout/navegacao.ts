import {
  Award,
  BriefcaseBusiness,
  Calendar,
  Gift,
  House,
  SquarePlay,
  User,
  Users,
  type LucideIcon,
} from "lucide-react";

export type ItemDeNavegacao = {
  rotulo: string;
  href: string;
  icone: LucideIcon;
};

export const itensMembro: ItemDeNavegacao[] = [
  { rotulo: "Início", href: "/inicio", icone: House },
  { rotulo: "Clube de benefícios", href: "/beneficios", icone: Gift },
  { rotulo: "Agenda de eventos", href: "/agenda", icone: Calendar },
  { rotulo: "Conteúdo exclusivo", href: "/conteudos", icone: SquarePlay },
  { rotulo: "Vagas", href: "/vagas", icone: BriefcaseBusiness },
  { rotulo: "Minhas conquistas", href: "/conquistas", icone: Award },
  { rotulo: "Comunidade", href: "/profissionais", icone: Users },
  { rotulo: "Meu perfil", href: "/perfil", icone: User },
];

export const itensMobile: ItemDeNavegacao[] = [
  { rotulo: "Início", href: "/inicio", icone: House },
  { rotulo: "Benefícios", href: "/beneficios", icone: Gift },
  { rotulo: "Agenda", href: "/agenda", icone: Calendar },
  { rotulo: "Vagas", href: "/vagas", icone: BriefcaseBusiness },
  { rotulo: "Perfil", href: "/perfil", icone: User },
];

const hrefsMobile = new Set(itensMobile.map((item) => item.href));

export const itensForaDaNavegacaoInferior = itensMembro.filter(
  (item) => !hrefsMobile.has(item.href),
);

export const itensAdmin: ItemDeNavegacao[] = [
  { rotulo: "Pessoas", href: "/admin/pessoas", icone: Users },
  { rotulo: "Benefícios", href: "/admin/beneficios", icone: Gift },
  { rotulo: "Eventos", href: "/admin/eventos", icone: Calendar },
  { rotulo: "Conteúdo", href: "/admin/conteudos", icone: SquarePlay },
  { rotulo: "Vagas", href: "/admin/vagas", icone: BriefcaseBusiness },
  { rotulo: "Quebra-cabeças", href: "/admin/quebra-cabecas", icone: Award },
];

export function estaAtivo(href: string, caminhoAtual: string | null): boolean {
  if (!caminhoAtual) return false;
  return caminhoAtual === href || caminhoAtual.startsWith(`${href}/`);
}

export function tituloDaRota(itens: ItemDeNavegacao[], caminhoAtual: string | null): string {
  return itens.find((item) => estaAtivo(item.href, caminhoAtual))?.rotulo ?? "";
}
