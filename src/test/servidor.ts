import { setupServer } from "msw/node";

import { handlersSaude } from "@/features/saude/mocks/saude.handlers";

export const servidor = setupServer(...handlersSaude);
