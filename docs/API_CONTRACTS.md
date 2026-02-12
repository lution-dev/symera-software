# API_CONTRACTS.md — Symera

## Base URL
- **Desenvolvimento**: `http://localhost:5000/api`
- **Produção**: `https://app.symera.com.br/api`

## Autenticação
Todas as rotas (exceto as marcadas como públicas) requerem:
```
Authorization: Bearer <supabase_jwt_token>
```

## Versionamento
Não há versionamento formal de API. Todas as rotas estão em `/api/`.

---

## Auth

### `GET /api/supabase-config`
Retorna as configurações públicas do Supabase.
```json
// Response 200
{ "url": "https://xxx.supabase.co", "anonKey": "eyJ..." }
```

### `GET /api/auth/dev-available`
Verifica se o login de desenvolvimento está disponível.
```json
// Response 200
{ "available": true }
```

### `POST /api/auth/dev-login`
Login de desenvolvimento (apenas fora de produção).
```json
// Response 200
{
  "success": true,
  "accessToken": "dev-token-...",
  "userId": "8650891",
  "email": "dev@symera.test",
  "name": "Usuário de Teste"
}
// Response 403 (produção)
{ "message": "Dev login não disponível em produção" }
```

### `GET /api/auth/user` 🔒
Retorna dados do usuário autenticado. Cria usuário se não existir.
```json
// Response 200
{
  "id": "abc123",
  "email": "user@example.com",
  "firstName": "João",
  "lastName": "Silva",
  "phone": null,
  "profileImageUrl": "https://...",
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:00:00.000Z"
}
```

### `GET /api/logout`
Destrói a sessão e redireciona para `/auth`.

---

## Events

### `GET /api/events` 🔒
Lista todos os eventos do usuário autenticado. Inclui `vendorCount`.
```json
// Response 200
[
  {
    "id": 1,
    "name": "Casamento Ana e João",
    "type": "casamento",
    "format": "presencial",
    "startDate": "2026-06-15T00:00:00.000Z",
    "endDate": null,
    "startTime": "16:00",
    "endTime": "23:00",
    "location": "Espaço XYZ",
    "meetingUrl": null,
    "description": "...",
    "budget": 50000,
    "expenses": 15000,
    "attendees": 200,
    "coverImageUrl": "/uploads/event-1-cover.jpg",
    "status": "planning",
    "feedbackUrl": "abc123",
    "ownerId": "user123",
    "vendorCount": 5,
    "createdAt": "...",
    "updatedAt": "..."
  }
]
```

### `GET /api/events/:id` 🔒
Retorna um evento específico. Requer ser owner ou team member.
```json
// Response 200: (mesmo schema acima, sem vendorCount)
// Response 403: { "message": "You don't have access to this event" }
// Response 404: { "message": "Event not found" }
```

### `POST /api/events` 🔒
Cria um novo evento.
```json
// Request Body
{
  "name": "Workshop de Design",           // obrigatório
  "type": "workshop",                     // obrigatório
  "format": "presencial",                 // obrigatório
  "startDate": "2026-03-20",              // obrigatório (string ISO)
  "endDate": "2026-03-21",               // opcional
  "startTime": "09:00",                  // opcional
  "endTime": "18:00",                    // opcional
  "location": "Centro de Convenções",     // opcional
  "meetingUrl": null,                     // opcional
  "description": "Workshop intensivo...", // opcional
  "budget": 15000,                        // opcional (centavos)
  "attendees": 50,                        // opcional
  "coverImageUrl": "data:image/png;base64,...", // opcional (base64 ou URL)
  "generateAIChecklist": true             // opcional
}
// Response 201: Event object
// Response 400: { "message": "Invalid event data", "errors": [...] }
```

### `PUT /api/events/:id` 🔒
Atualiza um evento. Apenas o owner.
```json
// Request Body: mesmo do POST (sem generateAIChecklist)
// Response 200: Event atualizado
// Response 403: { "message": "Only the event owner can update it" }
```

### `PATCH /api/events/:id` 🔒
Atualiza apenas o status do evento. Owner ou team member.
```json
// Request Body
{ "status": "confirmed" }
// Status válidos: "planning", "confirmed", "in_progress", "completed", "cancelled"
// Response 200: Event atualizado
// Response 400: { "message": "Invalid status", "validValues": [...] }
```

### `DELETE /api/events/:id` 🔒
Deleta um evento. Apenas o owner.
```json
// Response 204: (sem body)
// Response 403: { "message": "Only the event owner can delete it" }
```

---

## Draft Events

### `GET /api/events/draft` 🔒
Retorna o rascunho do usuário.
```json
// Response 200: Event (com status "draft")
// Response 404: { "message": "No draft found" }
```

### `POST /api/events/draft` 🔒
Salva/atualiza rascunho. Aceita token via query string (`?token=...`).
```json
// Request Body (todos opcionais)
{ "name": "...", "type": "...", "format": "...", "startDate": "...", ... }
// Response 200: Draft Event
```

### `DELETE /api/events/draft` 🔒
Remove o rascunho.
```json
// Response 200: { "message": "Draft deleted successfully" }
```

---

## Tasks

### `GET /api/events/:id/tasks` 🔒
Lista tarefas de um evento.

### `POST /api/events/:id/tasks` 🔒
Cria tarefa.
```json
// Request Body
{
  "title": "Confirmar DJ",          // obrigatório
  "description": "...",             // opcional
  "dueDate": "2026-03-15",          // opcional
  "status": "todo",                 // opcional (default: "todo")
  "priority": "high",              // opcional (default: "medium")
  "assigneeIds": ["user1", "user2"] // opcional
}
```

### `PUT /api/events/:eventId/tasks/:taskId` 🔒
Atualiza tarefa.

### `DELETE /api/events/:eventId/tasks/:taskId` 🔒
Deleta tarefa.

### `GET /api/tasks/:taskId/assignees` 🔒
Lista responsáveis de uma tarefa.

---

## Team Members

### `GET /api/events/:id/team` 🔒
Lista membros da equipe.

### `POST /api/events/:id/team` 🔒
Adiciona membro.
```json
// Request Body
{ "userId": "user123", "role": "coordinator", "permissions": "{...}" }
// ou por email:
{ "email": "novo@example.com", "role": "helper" }
```

### `DELETE /api/events/:id/team/:userId` 🔒
Remove membro.

---

## Vendors

### `GET /api/events/:id/vendors` 🔒
### `POST /api/events/:id/vendors` 🔒
### `PUT /api/events/:id/vendors/:vendorId` 🔒
### `DELETE /api/events/:id/vendors/:vendorId` 🔒

---

## Budget & Expenses

### `GET /api/events/:id/budget` 🔒
### `POST /api/events/:id/budget` 🔒
### `PUT /api/events/:id/budget/:itemId` 🔒
### `DELETE /api/events/:id/budget/:itemId` 🔒

### `GET /api/events/:id/expenses` 🔒
### `POST /api/events/:id/expenses` 🔒
### `PUT /api/events/:id/expenses/:expenseId` 🔒
### `DELETE /api/events/:id/expenses/:expenseId` 🔒

---

## Schedule

### `GET /api/events/:id/schedule` 🔒
### `POST /api/events/:id/schedule` 🔒
### `PUT /api/events/:id/schedule/:itemId` 🔒
### `DELETE /api/events/:id/schedule/:itemId` 🔒

---

## Documents

### `GET /api/events/:id/documents` 🔒
### `POST /api/events/:id/documents` 🔒 (multipart/form-data)
Upload via `multer`. Max 50MB.
```
Content-Type: multipart/form-data
Fields: name, category, description
File: document (campo do arquivo)
```

### `DELETE /api/events/:id/documents/:docId` 🔒

---

## Participants

### `GET /api/events/:id/participants` 🔒
### `POST /api/events/:id/participants` 🔒
### `PUT /api/events/:id/participants/:participantId` 🔒
### `DELETE /api/events/:id/participants/:participantId` 🔒

### `POST /api/events/:id/participants/import` 🔒 (multipart/form-data)
Importa CSV/XLSX. Max 10MB.
```json
// Response 200
{
  "stats": { "total": 100, "valid": 95, "invalid": 5 },
  "invalidRecords": [{ "row": 3, "reason": "Email inválido" }]
}
```

---

## Feedback (Público)

### `GET /api/events/:id/feedback` 🔒
Lista feedbacks de um evento.

### `POST /api/public/feedback/:feedbackId` ⚡ PÚBLICO
Envia feedback (não requer autenticação).
```json
// Request Body
{
  "rating": 5,                  // obrigatório (1-5)
  "comment": "Excelente evento!", // obrigatório
  "name": "Maria",              // opcional
  "email": "maria@ex.com",      // opcional
  "isAnonymous": false          // opcional (default: true)
}
```

---

## Status Codes Padrão

| Código | Significado |
|--------|-------------|
| `200` | Sucesso |
| `201` | Recurso criado |
| `204` | Sucesso sem body (delete) |
| `400` | Dados inválidos (Zod validation) |
| `401` | Não autenticado |
| `403` | Sem permissão |
| `404` | Recurso não encontrado |
| `500` | Erro interno do servidor |

---

*Última atualização: 12/02/2026*
