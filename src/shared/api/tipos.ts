export type Pagina<T> = {
  total: number;
  pagina: number;
  total_paginas: number;
  itens: T[];
};
