import { setupServer } from "msw/node";

import { handlersConversao } from "@/features/conversao/mocks/conversao.handlers";
import { handlersSaude } from "@/features/saude/mocks/saude.handlers";

import { handlersSessao } from "./handlers-sessao";

export const servidor = setupServer(
  ...handlersSaude,
  ...handlersConversao,
  ...handlersSessao(null),
);
