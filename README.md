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

## Integração com o Sympla

A agenda lê os eventos e as participações direto da API Pública do Sympla (v1.6.0). As chamadas acontecem no servidor do Next, em `src/features/agenda/services/`, e o token nunca chega ao navegador.

```bash
cp .env.example .env.local
# preencha SYMPLA_TOKEN com o token da conta organizadora do PMI-DF
```

- **`SYMPLA_TOKEN` é obrigatório:** sem ele, a agenda e o console mostram a tela de erro.
- **Em produção:** configure `SYMPLA_TOKEN` como secret do ambiente de deploy. Nunca use o prefixo `NEXT_PUBLIC_`.
- **Cache:** os eventos ficam em cache por até 1 hora. Os participantes de cada evento também (1 dia para eventos encerrados há mais de 7 dias), compartilhados entre a agenda e o console.

## O que ainda é de exemplo

- **Usuária logada** ("Maria Souza") e **Admin** ("Rafael Lima"), em `src/lib/sessao.ts`, até a autenticação (ÉP-01) existir.
- **Base de pessoas:** vazia em `src/lib/pessoas.ts` até o ÉP-02. Por isso nenhum participante aparece vinculado a uma conta, e a conciliação só permite marcar "não é membro".
- **Módulos que ainda não existem** aparecem desabilitados na navegação.

## Console administrativo da agenda (`/admin/eventos`)

Telas do ÉP-05 para o Admin, seguindo o protótipo (telas 26 a 29):

| Rota | Tela | O que faz |
|---|---|---|
| `/admin/eventos` | Sincronização (26) | Status da integração, "Sincronizar agora", log de execuções e lista de eventos com participações |
| `/admin/eventos/numeros` | Números (28) | Totais agregados, filtros, seleção, ordenação e exportação CSV |
| `/admin/eventos/[id]/participantes` | Participantes (29) | Lista por evento com check-in e vínculo com conta, filtros e CSV |
| `/admin/eventos/conciliacao` | Conciliação (27) | Fila de participações não vinculadas, sugestões por nome, vincular, "não é membro" e desfazer |

- **Sem login por enquanto.** O acesso é controlado em `src/proxy.ts`, onde a autenticação vai entrar: liberado em `npm run dev` e, em produção, só com `ADMIN_HABILITADO=true`.
- **Sem backend.** Números e participantes vêm do Sympla, com cache. Conciliações, auditoria (inclusive as exportações CSV) e o log de sincronização ficam em `data/agenda-admin.json`, fora do git. Isso exige um servidor com disco persistente.
- **Período.** Por padrão, as telas olham os últimos 90 dias e os próximos eventos, para limitar as chamadas ao Sympla. "Últimos 12 meses" amplia a janela.
- **Base de pessoas.** O vínculo com conta depende da base de pessoas do ÉP-02 (hoje vazia em `src/lib/pessoas.ts`).
