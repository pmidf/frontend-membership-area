# Área de Membros PMI-DF · Frontend

Interface web da área de membros do PMI Distrito Federal: cadastro e filiação, perfil, clube de benefícios, agenda de eventos, conteúdo exclusivo, vitrine de oportunidades e gamificação. Consome a API do [backend-membership-area](https://github.com/pmidf/backend-membership-area), que é a fonte da verdade de regras e dados.

## Sumário

1. [Stack](#stack)
2. [Como rodar](#como-rodar)
3. [Scripts](#scripts)
4. [Integração com o backend](#integração-com-o-backend)
5. [Arquitetura](#arquitetura)
6. [Convenções](#convenções)
7. [Testes](#testes)
8. [Fluxo de contribuição](#fluxo-de-contribuição)

## Stack

| Camada        | Tecnologia                                                                                           |
| ------------- | ---------------------------------------------------------------------------------------------------- |
| Framework     | Next.js 16 (App Router, Turbopack) + React 19                                                        |
| Linguagem     | TypeScript `strict`                                                                                  |
| Estilo        | Tailwind CSS 4 com os tokens do Figma em `src/app/globals.css` · fonte Inter · ícones `lucide-react` |
| Dados remotos | TanStack Query 5                                                                                     |
| Formulários   | React Hook Form + zod                                                                                |
| Testes        | Vitest + Testing Library + MSW · Playwright + axe                                                    |
| Qualidade     | ESLint 9 + Prettier · Husky + lint-staged · GitHub Actions                                           |
| Runtime       | Node 24 (`.nvmrc`) · npm                                                                             |

## Como rodar

Pré-requisitos: Node 24 e o backend rodando (veja o [README do backend](https://github.com/pmidf/backend-membership-area#3-como-rodar)).

```bash
cp .env.example .env.local
npm install
npm run dev
```

A aplicação sobe em <http://localhost:3001>. A página inicial mostra se a API está acessível.

| Processo       | Porta  |
| -------------- | :----: |
| Frontend       | `3001` |
| API do backend | `3333` |

O backend libera o CORS e monta os links dos e-mails (confirmação, redefinição de senha) a partir de `FRONTEND_URL`, que por padrão é `http://localhost:3001`. Por isso o frontend usa essa porta.

### Variáveis de ambiente

| Variável             | Para quê                                                                                                                                                  |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `BACKEND_URL`        | Endereço do backend para onde o Next encaminha `/api/*`. Lida no servidor; nunca use o prefixo `NEXT_PUBLIC_`. Deve estar definida também no `next build` |
| `EXIBIR_COMPONENTES` | `true` libera a página `/_componentes`, o catálogo do design system. Lida no `next build`; não defina em produção                                         |

## Scripts

| Comando                                   | O que faz                                                                                    |
| ----------------------------------------- | -------------------------------------------------------------------------------------------- |
| `npm run dev`                             | Servidor de desenvolvimento na porta 3001                                                    |
| `npm run build` · `npm run start`         | Build de produção e servidor na porta 3001                                                   |
| `npm run lint`                            | ESLint sem tolerância a avisos                                                               |
| `npm run typecheck`                       | Gera os tipos das rotas e roda o `tsc`                                                       |
| `npm run format` · `npm run format:check` | Formata ou confere a formatação com o Prettier                                               |
| `npm test` · `npm run test:watch`         | Testes de unidade e de componente                                                            |
| `npm run test:coverage`                   | Testes com cobertura mínima de 80%                                                           |
| `npm run e2e`                             | Testes de ponta a ponta com Playwright (instale antes com `npx playwright install chromium`) |

## Integração com o backend

- **Mesma origem.** `next.config.ts` reescreve `/api/:caminho*` para `${BACKEND_URL}/api/:caminho*`. O navegador sempre chama `/api/...` na própria origem.
- **Sessão.**
  - O _refresh token_ chega num cookie `httpOnly`, `sameSite: strict`, com `path: /api/auth`. Graças ao _rewrite_, ele funciona sem CORS.
  - O _access token_ (15 minutos) fica só em memória e vai no cabeçalho `Authorization`.
  - Quando a API responde `401`, o cliente renova a sessão em `POST /api/auth/refresh` e repete a chamada.
- **Erros.** A API responde `{ "codigo": "..." }` ou, em validação, `422 { "codigo": "DADOS_INVALIDOS", "campos": { ... } }`. A mensagem exibida é escolhida pelo código.
- **Prévias.** Para quem não é filiado, a API devolve itens com `bloqueado: true` e sem os campos exclusivos. A interface mostra a prévia desfocada a partir disso.
- **Contratos.** Os tipos de cada feature espelham os DTOs e as respostas do backend, mantendo os nomes em snake_case.

## Arquitetura

```
src/
  app/                rotas do App Router; páginas finas que só compõem telas das features
  features/<dominio>/
    api/              <dominio>.api.ts (chamadas) · <dominio>.queries.ts (query keys e hooks)
    components/       componentes da feature, com o teste ao lado
    schemas/          schemas zod espelhando as validações do backend
    tipos/            contratos da API
    mocks/            handlers MSW e fixtures
  shared/
    ui/               design system
    layout/           AppShell, Sidebar, Topbar, navegação mobile
    api/              cliente HTTP, erros e cliente de consultas
    sessao/           sessão e guards de acesso
    lib/              utilitários puros (datas, máscaras, CSV)
  test/               setup do Vitest, servidor MSW e utilitários de renderização
e2e/                  testes Playwright
```

O exemplo completo de uma feature está em [`src/features/saude`](src/features/saude): chamada à API, hook do TanStack Query, componente, mock e teste.

## Convenções

- **Domínio em português**, como no backend: `features/beneficios`, `CartaoBeneficio`, `useResgatarBeneficio`.
- **Nomes de arquivo:** componentes em `PascalCase.tsx`; hooks `useNome`; funções e variáveis em camelCase; os demais arquivos em kebab-case.
- **Campos da API** em snake_case, como chegam.
- **Código limpo:** sem comentários, sem `any`, sem `console`, sem código morto. Os nomes explicam a intenção.
- **Dados:** componente de UI não faz _fetch_; os dados chegam por hooks da feature.
- **Componentes** pequenos e de responsabilidade única, reutilizando `shared/ui`.
- **Estados:** todo dado remoto trata carregando, vazio, erro e bloqueado.
- **Acessibilidade:** rótulos em todos os campos, foco visível, navegação por teclado e textos alternativos.
- **Tokens:** use as classes geradas pelo `@theme`, como `bg-acao-primaria`, `text-texto-secundario`, `border-borda-padrao`, `rounded-md` e `text-h2`, em vez de valores soltos.

## Testes

| Tipo          | Ferramenta                     | Onde                                                                       |
| ------------- | ------------------------------ | -------------------------------------------------------------------------- |
| Unidade       | Vitest                         | `*.test.ts` ao lado do código                                              |
| Componente    | Vitest + Testing Library + MSW | `*.test.tsx` ao lado do componente; handlers em `features/<dominio>/mocks` |
| Ponta a ponta | Playwright + axe               | `e2e/*.spec.ts`, em desktop (1280) e mobile (390)                          |

O MSW recusa qualquer chamada sem handler (`onUnhandledFrame: 'error'`), o que garante que todo contrato usado nos testes está declarado.

## Fluxo de contribuição

1. Pegue uma issue e crie a branch `feat/<id-da-issue>-<resumo>` (ou `fix/`, `chore/`).
2. Faça commits no padrão Conventional Commits (`feat:`, `fix:`, `test:`, `refactor:`, `chore:`, `docs:`). O pre-commit aplica o lint e a formatação.
3. Abra o PR preenchendo o template, com screenshots desktop e mobile e `Closes #<issue>`.
4. O CI precisa estar verde e o PR, aprovado em code review, antes do merge.
