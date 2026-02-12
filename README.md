# Symera - Plataforma de Gestão de Eventos com IA

Symera é uma plataforma inteligente de gestão de eventos projetada para otimizar a colaboração em equipe através de gerenciamento sofisticado de tarefas e planejamento financeiro. A aplicação apresenta um design mobile-first, responsivo, com foco em experiência do usuário aprimorada.

## Funcionalidades

- **Planejamento Assistido por IA**: Priorização e acompanhamento inteligente de tarefas
- **Gerenciamento Colaborativo de Tarefas**: Recursos de planejamento colaborativo de tarefas em tempo real
- **Planejamento Financeiro**: Acompanhamento de orçamento e gestão de fornecedores
- **Design Mobile-First**: Interface responsiva com navegação contextual
- **Múltiplos Tipos de Eventos**: Suporte para casamentos, aniversários, eventos corporativos, conferências e mais
- **Internacionalização**: Suporte ao idioma português
- **Visualização Dinâmica**: Acompanhamento e visualização do formato do evento
- **Filtragem Avançada**: Recursos poderosos de filtragem e classificação para eventos e tarefas

## Stack Tecnológica

### Frontend
- **React 18** + **TypeScript**
- **Tailwind CSS** + **shadcn/ui**
- **Wouter** (roteamento)
- **TanStack Query** (gerenciamento de estado)
- **React Hook Form** + **Zod** (formulários e validação)
- **Framer Motion** (animações)

### Backend
- **Express.js** (servidor)
- **Drizzle ORM** (banco de dados)
- **Neon Serverless** (driver PostgreSQL)
- **Supabase Auth** (autenticação JWT)

### Banco de Dados
- **PostgreSQL** hospedado no **Supabase**

## Configuração Local

### Pré-requisitos
- Node.js v18+
- npm

### 1. Clone o repositório
```bash
git clone https://github.com/seu-usuario/symera.git
cd symera
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Configure as variáveis de ambiente
Copie o arquivo de exemplo e preencha com seus valores:
```bash
cp .env.example .env
```

Variáveis necessárias:
| Variável | Descrição | Obrigatória |
|----------|-----------|-------------|
| `DATABASE_URL` | String de conexão PostgreSQL (Supabase) | Sim |
| `SESSION_SECRET` | Chave secreta para sessões | Sim |
| `SUPABASE_URL` | URL do projeto Supabase | Sim |
| `SUPABASE_ANON_KEY` | Chave anônima do Supabase | Sim |
| `OPENAI_API_KEY` | Chave da API OpenAI (para IA) | Não |

### 4. Sincronize o banco de dados
```bash
npm run db:push
```

### 5. Inicie o servidor de desenvolvimento
```bash
npm run dev
```
A aplicação estará disponível em `http://localhost:5000`.

## Deploy na Vercel

### 1. Conecte ao GitHub
Faça push do código para um repositório no GitHub.

### 2. Importe no Vercel
1. Acesse [vercel.com](https://vercel.com) e faça login
2. Clique em "Import Project"
3. Selecione o repositório do GitHub
4. Configure as variáveis de ambiente (mesmas da seção acima)
5. Clique em "Deploy"

O `vercel.json` já está configurado para:
- Build do frontend com Vite
- API serverless via `/api`

### Notas importantes sobre Vercel
- **Uploads**: Os uploads de arquivos usam o disco local (`public/uploads`). Na Vercel (serverless), o disco é temporário. Para produção, migre para Supabase Storage ou outro serviço de armazenamento em nuvem.
- **vite.config.ts**: Após clonar, remova os plugins do Replit (`@replit/vite-plugin-runtime-error-modal` e `@replit/vite-plugin-cartographer`) e suas dependências do `package.json`.
- **Alternativa**: Se preferir um servidor persistente (para uploads e WebSocket), considere hospedar o backend no Railway, Render ou Fly.io, e usar a Vercel apenas para o frontend.

## Estrutura do Projeto

```
/
├── client/               # Frontend React
│   ├── src/
│   │   ├── components/   # Componentes reutilizáveis
│   │   ├── hooks/        # Hooks personalizados
│   │   ├── lib/          # Utilitários
│   │   ├── pages/        # Páginas da aplicação
│   │   ├── App.tsx       # Componente principal
│   │   └── main.tsx      # Ponto de entrada
│   └── index.html
├── server/               # Backend Express
│   ├── db.ts             # Conexão com banco de dados
│   ├── routes.ts         # Rotas da API
│   ├── storage.ts        # Camada de acesso a dados
│   ├── supabaseAuth.ts   # Autenticação Supabase
│   └── openai.ts         # Integração OpenAI
├── shared/               # Código compartilhado
│   └── schema.ts         # Schema do banco (Drizzle)
├── api/                  # Serverless functions (Vercel)
│   └── index.ts          # API entry point
├── vercel.json           # Configuração Vercel
├── drizzle.config.ts     # Configuração Drizzle
└── vite.config.ts        # Configuração Vite
```

## Scripts

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Inicia servidor de desenvolvimento |
| `npm run build` | Build para produção |
| `npm run start` | Inicia servidor de produção |
| `npm run db:push` | Sincroniza schema com o banco |

## API

Endpoints principais:
- `POST /api/auth/*` - Autenticação
- `GET/POST /api/events/*` - Eventos
- `GET/POST /api/events/:id/tasks/*` - Tarefas
- `GET/POST /api/events/:id/team/*` - Equipe
- `GET/POST /api/events/:id/vendors/*` - Fornecedores
- `GET/POST /api/events/:id/budget/*` - Orçamento
- `GET/POST /api/events/:id/expenses/*` - Despesas
- `GET/POST /api/events/:id/schedule/*` - Cronograma
- `GET/POST /api/events/:id/documents/*` - Documentos
- `GET/POST /api/events/:id/participants/*` - Participantes

---

© 2025 Symera. Todos os Direitos Reservados.
