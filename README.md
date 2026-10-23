# frontend-membership-area

Frontend da Plataforma de Membros do PMI-DF, em Next.js 16 (App Router, TypeScript, CSS Modules).

- Documentação do produto: https://pmidf.github.io/documentation-membership-area/
- Protótipo: Figma "Membership Area", página "Protótipo de alta fidelidade"

## Rodando

```bash
npm install
npm run dev     # http://localhost:3000
npm run build
npm run lint
```

## Estrutura

```
src/
  app/
    (area-logada)/          layout com sidebar
      agenda/               ÉP-05 · lista e calendário (?visao=calendario&mes=AAAA-MM)
      agenda/[id]/          ÉP-05 · detalhe do evento
    api/agenda/[id]/ics/    arquivo .ics de "Adicionar ao meu calendário"
  components/
    layout/                 Sidebar, Topbar
    ui/                     Tag, Button, Card, Alert (componentes do design system)
  features/
    agenda/                 tipos, regras de negócio, datas, .ics, serviço e componentes da agenda
  lib/sessao.ts             usuário autenticado (mock até a integração com o ÉP-01)
```

Os tokens do design system (cores, raios) ficam em `src/app/globals.css`.

## Agenda (ÉP-05): o que está implementado

US-05.01 (consultar a agenda):

- lista de próximos eventos com destaque do próximo, filtros de busca, formato, categoria e período (todos na URL)
- calendário mensal com navegação entre meses
- "Eventos passados" em ordem decrescente
- detalhe com mapa para eventos presenciais
- inscrição sempre no Sympla, em nova aba; para quem está autenticado, aparece antes um aviso listando os e-mails verificados
- arquivo .ics para adicionar ao calendário
- eventos cancelados ficam marcados como "Cancelado" por 7 dias e depois saem da agenda
- evento encerrado ou cancelado não mostra o botão de inscrição
- datas sempre no fuso America/Sao_Paulo
- versão mobile (até 768px): barra de navegação inferior no lugar da sidebar, calendário compacto com a lista do mês e detalhe em coluna única

## Backend

Os dados vêm do [backend-membership-area](../backend-membership-area), que lê eventos e participantes direto do Sympla (com cache de 5 minutos) e guarda no Postgres só as pessoas e as decisões da conciliação. O frontend não fala com o Sympla nem conhece o token.

```bash
cp .env.example .env.local
# BACKEND_URL=http://localhost:3333  (o backend precisa estar no ar: `docker compose up -d` no backend-membership-area)
```

- Todas as chamadas ao backend acontecem no servidor do Next (`src/lib/backend.ts`).
- A lista de eventos fica em cache por alguns minutos. A situação da pessoa e os dados do console não usam cache.
- Sem o backend, a agenda e o console mostram a tela de erro.

## O que ainda é de exemplo

- **Usuária logada** ("Maria Souza") e **Admin** ("Rafael Lima"), em `src/lib/sessao.ts`, até a autenticação (ÉP-01) existir.
- **Usuária logada:** o backend identifica a pessoa pelo `id_pessoa` (UUID da tabela `pessoa`). O id de exemplo em `src/lib/sessao.ts` só mostra a situação nos eventos se existir uma pessoa com esse id no banco.
- **Módulos que ainda não existem** aparecem desabilitados na navegação.

## Console administrativo da agenda (`/admin/eventos`)

Telas do ÉP-05 para o Admin, seguindo o protótipo (telas 26 a 29):

| Rota | Tela | O que faz |
|---|---|---|
| `/admin/eventos` | Eventos (26) | Integração com o Sympla, "Atualizar agora" e lista de eventos com participações |
| `/admin/eventos/numeros` | Números (28) | Totais agregados, filtros, seleção, ordenação e exportação CSV |
| `/admin/eventos/[id]/participantes` | Participantes (29) | Lista por evento com check-in e vínculo com conta, filtros e CSV |
| `/admin/eventos/conciliacao` | Conciliação (27) | Fila de participações não vinculadas, sugestões por nome, vincular, "não é membro" e desfazer |

- **Sem login por enquanto.** O acesso é controlado em `src/proxy.ts`, onde a autenticação vai entrar: liberado em `npm run dev` e, em produção, só com `ADMIN_HABILITADO=true`.
- **Dados no backend.** Números, participantes e conciliações vêm do backend, que lê o Sympla na hora. "Atualizar agora" descarta o cache de 5 minutos. As exportações CSV são geradas lá e só repassadas pelo Next.
- **Período.** Por padrão, as telas olham os últimos 90 dias e os próximos eventos. "Últimos 12 meses" amplia a janela.
- **Vínculo com conta.** Automático quando o e-mail da inscrição no Sympla é um e-mail verificado da pessoa; nos outros casos, pela conciliação. Cada inscrição é identificada por evento + participante do Sympla.
