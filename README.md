# Symera - Plataforma de Gestão de Eventos com IA

Symera é uma plataforma inteligente de gestão de eventos projetada para otimizar a colaboração em equipe através de gerenciamento sofisticado de tarefas e planejamento financeiro. A aplicação apresenta um design mobile-first, responsivo, com foco em experiência do usuário aprimorada.

## 🚀 Funcionalidades

- **Planejamento Assistido por IA**: Priorização e acompanhamento inteligente de tarefas
- **Gerenciamento Colaborativo de Tarefas**: Recursos de planejamento colaborativo de tarefas em tempo real
- **Planejamento Financeiro**: Acompanhamento de orçamento e gestão de fornecedores
- **Design Mobile-First**: Interface responsiva com navegação contextual
- **Múltiplos Tipos de Eventos**: Suporte para casamentos, aniversários, eventos corporativos, conferências e mais
- **Internacionalização**: Suporte ao idioma português
- **Visualização Dinâmica**: Acompanhamento e visualização do formato do evento
- **Filtragem Avançada**: Recursos poderosos de filtragem e classificação para eventos e tarefas

## 📋 Stack Tecnológica

### Frontend
- **React**: Biblioteca principal de UI
- **Tailwind CSS**: Framework CSS utilitário
- **shadcn/ui**: Componentes de UI de alta qualidade construídos sobre Radix UI
- **Wouter**: Roteamento leve para React
- **TanStack Query (React Query)**: Busca de dados e gerenciamento de estado
- **React Hook Form**: Validação e manipulação de formulários
- **Zod**: Validação de esquemas
- **Framer Motion**: Animações e transições

### Backend
- **Express.js**: Framework de servidor web
- **Drizzle ORM**: ORM de banco de dados para PostgreSQL
- **PostgreSQL**: Banco de dados relacional
- **Passport.js**: Middleware de autenticação
- **Replit Auth**: Integração de autenticação

## 🗄️ Esquema do Banco de Dados

A aplicação utiliza um banco de dados PostgreSQL com Drizzle ORM. As principais entidades incluem:

- **Usuários**: Contas e perfis de usuários
- **Eventos**: Detalhes do evento, incluindo tipo, formato, data e localização
- **Tarefas**: Tarefas associadas aos eventos
- **Membros da Equipe**: Colaboradores para eventos
- **Fornecedores**: Prestadores de serviços para eventos
- **Itens de Orçamento**: Planejamento financeiro para eventos

## 📁 Estrutura do Projeto

```
/
├── client/               # Código do Frontend
│   ├── src/
│   │   ├── assets/       # Imagens e recursos estáticos
│   │   ├── components/   # Componentes React reutilizáveis
│   │   ├── hooks/        # Hooks React personalizados
│   │   ├── lib/          # Funções utilitárias
│   │   ├── pages/        # Componentes de página
│   │   ├── App.tsx       # Componente principal da aplicação
│   │   └── main.tsx      # Ponto de entrada da aplicação
│   └── index.html        # Template HTML
├── server/               # Código do Backend
│   ├── db.ts             # Conexão com o banco de dados
│   ├── routes.ts         # Rotas da API
│   ├── storage.ts        # Camada de acesso a dados
│   ├── index.ts          # Ponto de entrada do servidor
│   ├── replitAuth.ts     # Autenticação Replit
│   └── openai.ts         # Integração com OpenAI
├── shared/               # Código compartilhado entre frontend e backend
│   ├── schema.ts         # Definições de esquema do banco de dados
│   └── types.ts          # Definições de tipos TypeScript
├── .replit               # Configuração do Replit
├── drizzle.config.ts     # Configuração do Drizzle ORM
├── package.json          # Dependências do projeto
└── vite.config.ts        # Configuração do bundler Vite
```

## 🚀 Executando o Projeto

### Desenvolvimento

1. Certifique-se de ter o Node.js instalado (v18 ou mais recente recomendado)
2. Instale as dependências:
   ```
   npm install
   ```
3. Inicie o servidor de desenvolvimento:
   ```
   npm run dev
   ```
   Isso iniciará tanto o servidor Express do backend quanto o servidor de desenvolvimento Vite do frontend.

### Gerenciamento do Banco de Dados

Para aplicar alterações de esquema ao banco de dados:

```
npm run db:push
```

Nota: Sempre use o ORM para operações de banco de dados em vez de escrever SQL bruto.

## 📱 Design Mobile e Responsivo

Symera é projetada para ser mobile-first com layouts responsivos:
- Barra lateral adaptativa que se transforma em uma barra de navegação inferior em dispositivos móveis
- Navegação contextual baseada no tamanho da tela
- Elementos de UI amigáveis ao toque
- Formulários e interações otimizados para dispositivos móveis

## 🔧 Estrutura da API

A API segue convenções RESTful com os seguintes endpoints principais:

- `/api/auth/*`: Endpoints de autenticação
- `/api/events/*`: Endpoints de gerenciamento de eventos
- `/api/tasks/*`: Endpoints de gerenciamento de tarefas
- `/api/team/*`: Endpoints de gerenciamento de equipe
- `/api/vendors/*`: Endpoints de gerenciamento de fornecedores
- `/api/budget/*`: Endpoints de gerenciamento de orçamento

## 👥 Autenticação

A aplicação utiliza Replit Auth para produção e um modo de autenticação de desenvolvimento para desenvolvimento. O estado de autenticação é gerenciado através de cookies de sessão.

## 📊 Visualização de Dados

O progresso e as estatísticas dos eventos são visualizados através de:
- Indicadores de progresso
- Gráficos de conclusão de tarefas
- Visualização de alocação de orçamento
- Agendamento de eventos baseado em tempo

## 🚀 Implantação

A aplicação está configurada para implantação no Replit. Para implantar:

1. Construa a aplicação:
   ```
   npm run build
   ```
2. Inicie o servidor de produção:
   ```
   npm run start
   ```

## 📝 Diretrizes de Desenvolvimento

- Atualize o esquema do banco de dados em `shared/schema.ts` ao adicionar novos modelos de dados
- Use React Query para busca de dados no frontend
- Siga a estrutura de componentes estabelecida para consistência
- Implemente validação de formulário usando esquemas Zod
- Mantenha o código modular e de fácil manutenção
- Use componentes shadcn para consistência da UI

## 🌐 Variáveis de Ambiente

As seguintes variáveis de ambiente são utilizadas:

- `DATABASE_URL`: String de conexão PostgreSQL
- `NODE_ENV`: Ambiente (desenvolvimento ou produção)
- `OPENAI_API_KEY`: Para recursos assistidos por IA (opcional)

## ⚙️ Dependências

Veja `package.json` para a lista completa de dependências.

## 📅 Última Atualização

23 de Maio de 2025

---

© 2025 Symera. Todos os Direitos Reservados.