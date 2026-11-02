import { setupServer } from "msw/node";

import { handlersSaude } from "@/features/saude/mocks/saude.handlers";

import { handlersSessao } from "./handlers-sessao";

export const servidor = setupServer(...handlersSaude, ...handlersSessao(null));
