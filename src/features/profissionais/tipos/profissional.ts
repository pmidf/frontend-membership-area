import type { Pagina } from "@/shared/api/tipos";

export type ItemProfissional = {
  id_pessoa: string;
  nome_completo: string;
  foto_perfil: string | null;
  cargo: string;
  empresa: string;
  cidade: string;
  uf: string;
};

export type PerfilProfissional = ItemProfissional & {
  mini_bio: string | null;
  linkedin_url: string | null;
};

export type ListaProfissionais = Pagina<ItemProfissional>;

export type FiltrosProfissionais = { q?: string; cidade?: string; uf?: string; page?: number };
