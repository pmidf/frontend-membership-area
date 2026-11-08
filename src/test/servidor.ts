import { setupServer } from "msw/node";

import {
  handlersAuth,
  handlersCadastro,
  handlersConfirmacao,
  handlersSenha,
} from "@/features/auth/mocks/auth.handlers";
import { handlersConversao } from "@/features/conversao/mocks/conversao.handlers";
import { handlersPerfil } from "@/features/perfil/mocks/perfil.handlers";
import { handlersSaude } from "@/features/saude/mocks/saude.handlers";
import { handlersSeguranca } from "@/features/seguranca/mocks/seguranca.handlers";

import { handlersSessao } from "./handlers-sessao";

export const servidor = setupServer(
  ...handlersSaude,
  ...handlersAuth,
  ...handlersCadastro,
  ...handlersConfirmacao,
  ...handlersSenha,
  ...handlersConversao,
  ...handlersSeguranca(),
  ...handlersPerfil(),
  ...handlersSessao(null),
);
