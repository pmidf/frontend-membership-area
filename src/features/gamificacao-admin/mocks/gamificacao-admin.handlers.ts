import { http, HttpResponse } from "msw/http";

import type {
  CriarQuebraCabeca,
  ItemQuebraCabecaAdmin,
  QuebraCabecaCriado,
} from "../tipos/quebra-cabeca-admin";

const id = (numero: number) => `40000000-0000-4000-8000-${String(numero).padStart(12, "0")}`;

export const listaTeste: ItemQuebraCabecaAdmin[] = [
  {
    id_quebra_cabeca: id(1),
    nome: "Diretoria 2023–2024",
    situacao: "PUBLICADO",
    total_pecas: 8,
    em_andamento: 0,
    concluidos: 9,
  },
  {
    id_quebra_cabeca: id(2),
    nome: "Fundação do PMI-DF",
    situacao: "PUBLICADO",
    total_pecas: 8,
    em_andamento: 12,
    concluidos: 3,
  },
  {
    id_quebra_cabeca: id(3),
    nome: "Meetup de Ágeis",
    situacao: "RASCUNHO",
    total_pecas: 8,
    em_andamento: 0,
    concluidos: 0,
  },
  {
    id_quebra_cabeca: id(4),
    nome: "Summit 2024",
    situacao: "FORA_DO_AR",
    total_pecas: 8,
    em_andamento: 2,
    concluidos: 5,
  },
];

export function handlersGamificacaoAdmin(listaInicial: ItemQuebraCabecaAdmin[] = listaTeste) {
  const lista = structuredClone(listaInicial);
  let proximo = 100;

  return [
    http.get("*/api/admin/quebra-cabecas", () => HttpResponse.json(lista)),
    http.post("*/api/admin/quebra-cabecas", async ({ request }) => {
      const dados = (await request.json()) as CriarQuebraCabeca;
      const criado: QuebraCabecaCriado = {
        id_quebra_cabeca: id((proximo += 1)),
        nome: dados.nome,
        legenda: dados.legenda,
        historia: dados.historia,
        imagem_original: dados.imagem_original,
        situacao: "RASCUNHO",
      };
      lista.push({
        id_quebra_cabeca: criado.id_quebra_cabeca,
        nome: criado.nome,
        situacao: "RASCUNHO",
        total_pecas: 8,
        em_andamento: 0,
        concluidos: 0,
      });
      lista.sort((a, b) => a.nome.localeCompare(b.nome));
      return HttpResponse.json(criado, { status: 201 });
    }),
    http.post("*/api/admin/quebra-cabecas/:id/publicar", ({ params }) => {
      const item = lista.find((atual) => atual.id_quebra_cabeca === params.id);
      if (!item) {
        return HttpResponse.json({ codigo: "QUEBRA_CABECA_NAO_ENCONTRADO" }, { status: 404 });
      }
      if (item.situacao !== "RASCUNHO") {
        return HttpResponse.json({ codigo: "TRANSICAO_INVALIDA" }, { status: 409 });
      }
      item.situacao = "PUBLICADO";
      return HttpResponse.json({ ...item, legenda: "", historia: "", imagem_original: "" });
    }),
  ];
}
