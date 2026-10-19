// Tipos da API Pública do Sympla v1.6.0, conforme o contrato OpenAPI oficial
// (https://developers.sympla.com.br/api-docs). Só os campos usados pela plataforma.

export type SymplaEndereco = {
  name?: string;
  address?: string;
  address_num?: string;
  address_alt?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;
  lat?: number;
  lon?: number;
};

export type SymplaEvento = {
  id: string;
  reference_id?: number;
  name: string;
  /** HTML da descrição do evento. */
  detail?: string;
  /** Data/hora local na timezone pedida (padrão America/Sao_Paulo). */
  start_date: string;
  end_date: string;
  image?: string;
  url: string;
  address?: SymplaEndereco | null;
  category_prim?: { name?: string } | null;
  category_sec?: { name?: string } | null;
  published: 0 | 1;
  cancelled: 0 | 1;
  private_event: 0 | 1;
};

export type SymplaParticipante = {
  id: string;
  event_id: string;
  email: string;
  ticket_status: string;
  order_status: string;
  checkin?: {
    check_in: boolean;
    check_in_date?: string;
  } | null;
};

export type SymplaPaginaCursor<T> = {
  data: T[];
  pagination?: {
    next_cursor?: string | null;
    page_size?: number;
    quantity?: number;
  };
};
