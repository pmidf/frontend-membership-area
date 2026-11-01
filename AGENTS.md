<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Convenções do projeto

Leia o [README](README.md) antes de alterar o código. Em resumo:

- O backend é a fonte da verdade: contratos, regras e mensagens de erro vêm dele.
- Domínio em português; campos da API em snake_case, como chegam.
- Sem comentários, sem `any`, sem `console`; componente de UI não faz fetch.
- Toda feature tem testes de componente com MSW e respeita a cobertura mínima de 80%.
