import { setupServer } from "msw/node";

import { handlersAuth, handlersCadastro } from "@/features/auth/mocks/auth.handlers";
import { handlersConversao } from "@/features/conversao/mocks/conversao.handlers";
import { handlersSaude } from "@/features/saude/mocks/saude.handlers";

import { handlersSessao } from "./handlers-sessao";

export const servidor = setupServer(
  ...handlersSaude,
  ...handlersAuth,
  ...handlersCadastro,
  ...handlersConversao,
  ...handlersSessao(null),
);
