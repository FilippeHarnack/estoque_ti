# TI Inventário

Sistema web para gerenciamento de equipamentos de TI. Permite controlar o inventário, alocação por funcionário e departamento, movimentações de entrada/saída e geração de relatórios.

## Funcionalidades

- **Dashboard** — visão geral do inventário com métricas de status e movimentações recentes
- **Equipamentos** — cadastro, edição e exclusão de itens com filtros por categoria, status, departamento e funcionário
- **Movimentações** — registro de entradas e saídas com rastreamento de operador e destino
- **Histórico** — linha do tempo de movimentações agrupadas por equipamento
- **Relatórios** — distribuição por categoria, itens em uso por funcionário e percentual de disponibilidade
- **Segurança** — gerenciamento de usuários com controle de acesso por perfil (Super Admin, Admin, Operador, Viewer)

## Stack

- [Next.js](https://nextjs.org/) 15 (App Router)
- [React](https://react.dev/) 19
- [Tailwind CSS](https://tailwindcss.com/) 4
- [Supabase](https://supabase.com/) (Postgres + Auth)
- [Font Awesome](https://fontawesome.com/) 7

## Pré-requisitos

- Node.js 18+
- Conta e projeto configurado no [Supabase](https://supabase.com/)

## Configuração

1. Clone o repositório e instale as dependências:

```bash
npm install
```

2. Crie o arquivo `.env.local` na raiz com as variáveis do Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=<sua-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<sua-supabase-anon-key>
NEXT_PUBLIC_EDGE_FN_URL=<url-da-edge-function>
```

3. Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

## Scripts

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Inicia o servidor de desenvolvimento |
| `npm run build` | Gera o build de produção |
| `npm start` | Inicia o servidor de produção |
| `npm run lint` | Executa o ESLint |
