# TESTING_STRATEGY.md — Symera

## Estratégia de Testes

### Estado Atual
O projeto possui um arquivo de teste base (`server/routes.test.ts`) mas **não tem suíte de testes abrangente** implementada. A estratégia abaixo define o padrão a ser seguido.

## Pirâmide de Testes

```
       /‾‾‾‾‾‾‾‾‾‾\
      /    E2E       \         5% — Fluxos críticos
     /________________\
    /   Integration     \      25% — API + Database
   /____________________\
  /      Unit Tests       \    70% — Business logic
 /________________________\
```

## Testes Unitários

### O que testar
- Funções de validação (`isValidEmail`, `isValidPhone`).
- Lógica do `generateEventChecklist` (geração de tarefas por IA).
- Lógica do `MemoryCache` (get, set, invalidate, TTL).
- Helpers de resolução de ID (`getEffectiveUserId`).
- Schemas Zod (validação de input).
- Funções utilitárias (`saveBase64Image`, `deleteImage`).

### Framework Recomendado
```
Vitest (compatível com Vite)
```

### Convenções
- Arquivos de teste: `*.test.ts` ou `*.spec.ts` ao lado do arquivo testado.
- Nomeclatura: `describe('NomeDaFunção', () => { it('deveria comportamento esperado', ...) })`.
- Mocks: usar `vi.mock()` do Vitest para isolar dependências externas.

### Exemplo
```typescript
// server/openai.test.ts
import { generateEventChecklist } from './openai';

describe('generateEventChecklist', () => {
  it('deveria gerar checklist básico para evento presencial', async () => {
    const result = await generateEventChecklist({
      name: 'Evento Teste',
      type: 'corporativo',
      format: 'presencial',
      startDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      attendees: 50,
      budget: 10000,
    });

    expect(result.length).toBeGreaterThan(0);
    expect(result[0]).toHaveProperty('title');
    expect(result[0]).toHaveProperty('priority');
  });

  it('deveria incluir tarefas específicas para workshops', async () => {
    const result = await generateEventChecklist({
      name: 'Workshop de Design',
      type: 'workshop',
      format: 'presencial',
      startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    });

    const titles = result.map(r => r.title);
    expect(titles).toContain('Preparar conteúdo e material didático');
  });
});
```

## Testes de Integração

### O que testar
- Rotas da API com banco de dados real (ou test DB).
- Fluxo completo: `POST /api/events` → verifica dados no DB.
- Autenticação: middleware `isAuthenticated` com tokens válidos/inválidos.
- Upload de documentos via multer.
- Importação de participantes CSV/XLSX.

### Padrões de Mocking

| Dependência | Estratégia de Mock |
|-------------|-------------------|
| **Database** | Banco de teste separado (Supabase branch ou container local) |
| **Supabase Auth** | Mock do JWT token com payload válido |
| **OpenAI API** | Sempre mockada (não é usada de fato na implementação atual) |
| **Filesystem (uploads)** | Diretório temporário com cleanup automático |
| **MemoryCache** | Reset entre testes |

### Setup Recomendado
```typescript
// test/setup.ts
import { beforeAll, afterAll, beforeEach } from 'vitest';

beforeAll(async () => {
  // Setup test database
  // Migrate schema
});

beforeEach(async () => {
  // Limpar todas as tabelas
  // Reset caches
});

afterAll(async () => {
  // Cleanup test database
  // Fechar conexões
});
```

## Testes E2E

### Framework Recomendado
```
Playwright (suporte nativo a Chromium, Firefox, WebKit)
```

### Fluxos Críticos para E2E
1. **Login completo**: Google OAuth → Redirect → Dashboard.
2. **Criar evento com IA**: Formulário → Checklist gerado → Evento no dashboard.
3. **Gerenciar equipe**: Adicionar membro → Verificar permissões → Remover.
4. **Upload de documento**: Selecionar arquivo → Upload → Visualizar na lista.
5. **Feedback público**: Abrir URL → Preencher → Submeter → Verificar no evento.
6. **Fluxo mobile**: Todas as ações acima em viewport mobile.

## Cobertura Mínima Exigida

| Camada | Cobertura Mínima |
|--------|-----------------|
| Unitário (server) | 70% |
| Unitário (client) | 50% |
| Integração (API) | 60% das rotas |
| E2E | 5 fluxos críticos |

## Testes Críticos (Must-Have)

Estes testes **devem** existir antes de qualquer deploy:

1. ✅ Autenticação rejeita tokens inválidos/expirados.
2. ✅ Autenticação rejeita dev tokens em produção.
3. ✅ Evento não acessível por usuário não autorizado (403).
4. ✅ Evento não deletável por não-owner (403).
5. ✅ Validação Zod rejeita dados inválidos (400).
6. ✅ Checklist IA gera tarefas com datas válidas.
7. ✅ Upload rejeita tipos de arquivo não permitidos.
8. ✅ Upload rejeita arquivos > 50MB.
9. ✅ Migração de ID de usuário preserva todos os eventos.
10. ✅ Resolução de ID por email retorna ID correto.

## Testes de Carga

### Cenários Críticos
| Cenário | Target |
|---------|--------|
| Requests simultâneos ao `/api/events` | 100 req/s sem degradação |
| Criação simultânea de eventos | 10 eventos/s |
| Upload simultâneo de documentos | 5 uploads/s |
| Conexões simultâneas ao banco | Pool de 10 conexões não esgotado |

### Ferramenta Recomendada
```
k6 (Grafana k6 - load testing)
```

### Limites Conhecidos
- MemoryCache é in-process — não funciona com múltiplas instâncias.
- Pool de conexões limitado a 10 — pode ser gargalo sob carga.
- Uploads no filesystem — não escala horizontalmente.

---

*Última atualização: 12/02/2026*
