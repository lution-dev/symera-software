# Configuração do Supabase

## Passo 1: Criar Projeto no Supabase

1. Acesse [supabase.com](https://supabase.com) e faça login
2. Clique em "New Project"
3. Escolha um nome e senha para o banco
4. Selecione a região mais próxima (São Paulo se disponível)
5. Aguarde a criação do projeto

## Passo 2: Executar a Migração

1. No painel do Supabase, vá em **SQL Editor**
2. Copie todo o conteúdo do arquivo `supabase-migration.sql`
3. Cole no editor e clique em **Run**
4. Verifique se todas as tabelas foram criadas em **Table Editor**

## Passo 3: Obter a Connection String

1. No Supabase, vá em **Settings** > **Database**
2. Procure a seção **Connection string**
3. Selecione o modo **URI** 
4. Copie a string de conexão
5. **IMPORTANTE**: Adicione `?sslmode=require` no final da string
6. Ela ficará assim:
   ```
   postgresql://postgres.[ref]:[password]@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?sslmode=require
   ```

## Passo 4: Configurar no Replit

1. No Replit, vá em **Secrets** (ícone de cadeado)
2. Adicione ou atualize a variável:
   - **Key**: `DATABASE_URL`
   - **Value**: Cole a connection string do Supabase

## Passo 5: Reiniciar a Aplicação

Após configurar a variável, reinicie a aplicação para que ela conecte ao novo banco.

---

## Tabelas Criadas

| Tabela | Descrição |
|--------|-----------|
| users | Usuários do sistema |
| events | Eventos |
| tasks | Tarefas dos eventos |
| task_assignees | Atribuição de tarefas |
| activity_logs | Logs de atividade |
| event_team_members | Membros da equipe |
| vendors | Fornecedores |
| budget_items | Itens de orçamento |
| expenses | Despesas |
| schedule_items | Cronograma |
| documents | Documentos |
| participants | Participantes |
| event_feedbacks | Feedbacks |
| feedback_metrics | Métricas de feedback |

---

## Notas Importantes

- O Supabase usa PostgreSQL, então todas as queries do Drizzle funcionam normalmente
- A criação automática de tasks ao criar eventos continuará funcionando
- Se você usar o Supabase Auth no futuro, será necessário ajustar a tabela `users`
