# BUSINESS_RULES.md — Symera

## 1. Regras de Negócio — Eventos

### 1.1 Criação de Eventos
- Todo evento **deve** ter: `name`, `type`, `format`, `startDate` e `ownerId`.
- O `ownerId` é automaticamente preenchido com o ID do usuário autenticado.
- Ao criar um evento, o criador é automaticamente adicionado como **membro da equipe com role `organizer`** e permissões completas (`canDelete`, `canEdit`, `canInvite`).
- Se o campo `generateAIChecklist` for `true`, o sistema gera tarefas automáticas via IA baseadas no tipo, formato, porte e prazo do evento.
- A geração de checklist por IA **não bloqueia** a criação do evento — se falhar, o evento é criado normalmente sem tarefas pré-geradas.
- O campo `coverImageUrl` aceita base64 que é automaticamente convertido para arquivo no servidor.

### 1.2 Tipos de Evento Suportados
- Casamentos, aniversários, eventos corporativos, conferências, workshops, desfiles de moda, entre outros.
- O checklist inteligente adapta-se automaticamente ao tipo detectado por palavras-chave no nome e descrição.

### 1.3 Status do Evento
Status válidos (ciclo de vida):
```
planning → confirmed → in_progress → completed
                                    → cancelled
```
- Status padrão na criação: `planning`.
- Apenas os status listados acima são aceitos. Qualquer outro valor é rejeitado com erro 400.

### 1.4 Acesso e Permissões
- O **proprietário** (`ownerId`) tem acesso total: visualizar, editar, deletar.
- **Membros da equipe** podem visualizar. A edição depende da role e das permissões do membro.
- Apenas o proprietário pode **deletar** o evento.
- Apenas o proprietário pode **editar** os dados do evento (PUT).
- Para **atualização de status** (PATCH), basta ter acesso ao evento (owner ou team member).

### 1.5 Rascunhos (Drafts)
- Cada usuário pode ter **no máximo 1 rascunho** de evento.
- Rascunhos são auto-salvos e podem usar `sendBeacon` (via query string token) para salvar mesmo quando o usuário fecha a aba.
- Rascunhos têm validação parcial (campos opcionais).

---

## 2. Regras de Negócio — Tarefas

### 2.1 Ciclo de Vida
```
todo → in_progress → completed
```
- Status padrão: `todo`.
- Prioridades: `low`, `medium`, `high`.
- Prioridade padrão: `medium`.

### 2.2 Atribuição
- Uma tarefa pode ter **múltiplos responsáveis** via tabela `task_assignees`.
- O campo legado `assigneeId` na tabela `tasks` é mantido para compatibilidade.
- Ao atribuir responsáveis, os IDs antigos são **substituídos** integralmente (replace, não append).

### 2.3 Geração por IA
- O checklist gerado calcula `dueDate` automaticamente baseado na distância até o `startDate` do evento.
- Tarefas de pós-evento (ex: "coletar feedback") recebem data posterior ao início do evento.
- Adaptações automáticas para: workshops (materiais didáticos), moda (modelos/produção), eventos grandes (≥100 pessoas), orçamentos altos (≥R$20.000).

---

## 3. Regras de Negócio — Equipe

- Um membro de equipe é vinculado a um **evento específico**, não ao sistema global.
- Roles possíveis: `organizer`, ou outros roles customizados.
- As permissões são armazenadas como JSON string com flags booleanas: `canDelete`, `canEdit`, `canInvite`.
- O proprietário do evento é sempre membro da equipe como `organizer`.

---

## 4. Regras de Negócio — Fornecedores

- Cada fornecedor é vinculado a um evento específico.
- Campos obrigatórios: `name`, `service`.
- Contato (nome, email, telefone) é opcional.
- O custo (`cost`) é armazenado em centavos (inteiro).

---

## 5. Regras de Negócio — Orçamento e Despesas

### 5.1 Budget Items
- Representam itens **planejados** no orçamento.
- Campo `paid` indica se o item já foi pago.
- O campo `budget` do evento armazena o orçamento total planejado.

### 5.2 Expenses
- Representam despesas **reais** do evento.
- Podem estar vinculadas a um fornecedor (`vendorId`).
- Possuem `dueDate` (vencimento) e `paymentDate` (data de pagamento efetivo).
- Campo `paid` indica se foi pago.
- O campo `expenses` do evento armazena o total gasto acumulado.

---

## 6. Regras de Negócio — Participantes

### 6.1 Status do Participante
```
pending → confirmed
        → cancelled
```
- Status padrão: `pending`.

### 6.2 Origem
- `manual`: cadastrado manualmente.
- `import`: importado via CSV/XLSX.
- Importação aceita formatos: CSV e XLSX (até 10MB).
- Na importação, cada registro é validado individualmente. Registros inválidos são reportados separadamente.

### 6.3 Validações
- Email: formato válido via regex.
- Telefone: entre 10 e 15 dígitos (após remoção de formatação).

---

## 7. Regras de Negócio — Feedback

### 7.1 Feedback Público
- Cada evento pode ter uma URL pública de feedback (`feedbackUrl`).
- O formulário de feedback é **público** — não requer autenticação.
- Cada feedback é identificado por um `feedbackId` único.
- Campos: `rating` (obrigatório, numérico), `comment` (obrigatório, texto), `name` e `email` (opcionais).
- `isAnonymous`: padrão `true`.

### 7.2 Métricas de Feedback
- Cada feedback pode ter métricas associadas: `viewedAt`, `submittedAt`, `ipAddress`, `userAgent`.
- Usadas para rastreamento e análise de engajamento.

---

## 8. Regras de Negócio — Documentos

- Upload máximo: **50MB** por arquivo.
- Tipos permitidos: `jpeg`, `jpg`, `png`, `gif`, `pdf`, `doc`, `docx`, `xls`, `xlsx`, `ppt`, `pptx`, `txt`, `mp4`, `mov`, `avi`, `mp3`, `wav`.
- Cada documento tem: `name`, `category`, `fileUrl`, `fileType`, `uploadedById`.
- Categorias são livres (texto).

---

## 9. Regras de Negócio — Cronograma

- Itens de cronograma (`schedule_items`) são vinculados a um evento.
- Campos obrigatórios: `title`, `startTime`.
- `responsibles` é armazenado como texto livre.

---

## 10. Fluxos Críticos

### 10.1 Fluxo de Criação de Evento com IA
```
Usuário preenche formulário → Valida campos (Zod) → Cria evento no DB →
Processa imagem base64 (se houver) → Adiciona criador como team member →
Se generateAIChecklist: gera tarefas via IA → Registra activity log → Retorna evento
```

### 10.2 Fluxo de Autenticação
```
Login Google via Supabase OAuth → Callback → Salva sessão no localStorage →
Cada request: envia Bearer token → Backend decodifica JWT → Resolve ID efetivo
(prioriza ID pelo email no banco, fallback para UUID Supabase) → Processa request
```

### 10.3 Fluxo de Migração de Usuário
```
Login com novo provider → Email já existe com ID antigo →
Migra automaticamente: events, tasks, team_members, activity_logs, etc.
do ID antigo para o novo ID → Mantém consistência referencial
```

---

## 11. Restrições Legais

- **LGPD**: Dados pessoais (email, telefone, nome) devem ser protegidos. Feedback permite anonimato.
- **Termos de Uso**: Não implementado formalmente — necessário para produção.
- **Política de Privacidade**: Não implementada — necessário para produção.

---

## 12. Casos de Borda Importantes

| Caso | Comportamento |
|------|---------------|
| Usuário faz login com Google após ter usado dev token | Sistema migra dados do ID antigo para o novo via email |
| OpenAI API fora do ar | Checklist não é gerado, evento é criado normalmente |
| Upload de arquivo > 50MB | Rejeitado pelo multer com erro |
| Token JWT expirado | Frontend tenta refresh; se falhar, redireciona para login |
| Dois usuários com mesmo email e IDs diferentes | Sistema prioriza o existente no banco por email |
| Evento sem `endDate` | Campo aceita null, exibe apenas data de início |
| Servidor reiniciando durante request | Frontend usa dados do localStorage como fallback |
| Rascunho salvo via sendBeacon | Token passado via query string como fallback |

---

*Última atualização: 12/02/2026*
