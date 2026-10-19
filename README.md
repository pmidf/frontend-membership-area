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

- **Sem `SYMPLA_TOKEN`:** a agenda usa os dados de exemplo de `features/agenda/data/eventos-mock.ts`.
- **Em produção:** configure `SYMPLA_TOKEN` como secret do ambiente de deploy. Nunca use o prefixo `NEXT_PUBLIC_`.
- **Cache:** os eventos ficam em cache por até 1 hora. As participações de cada pessoa (evento + e-mail verificado) também.
