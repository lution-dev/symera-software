# DEPLOYMENT.md — Symera

## Ambientes

| Ambiente | URL | Descrição |
|----------|-----|-----------|
| **Development** | `http://localhost:5000` | Servidor local com Vite HMR |
| **Production** | `https://app.symera.com.br` | Vercel (frontend + serverless API) |

> **Nota**: Não há ambiente de staging configurado atualmente.

## Pipeline de CI/CD

### Fluxo Atual
```mermaid
graph LR
    A[git push] --> B[GitHub]
    B --> C[Vercel Auto-deploy]
    C --> D[Build: vite build]
    C --> E[Deploy: Serverless Functions]
    D --> F[Produção]
    E --> F
```

### Build Steps
1. **Install**: `npm install`
2. **Build frontend**: `npx vite build --config vite.config.ts`
3. **Output**: `dist/public/` (arquivos estáticos)
4. **API**: `api/index.ts` (serverless function)

### Configuração Vercel (`vercel.json`)
```json
{
  "buildCommand": "npx vite build --config vite.config.ts",
  "outputDirectory": "dist/public",
  "installCommand": "npm install",
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/index.ts" }
  ],
  "functions": {
    "api/index.ts": {
      "maxDuration": 30
    }
  }
}
```

## Estratégia de Rollback

### Vercel
- Cada deploy cria uma **versão imutável** com URL única.
- Para rollback: acessar o dashboard da Vercel → Deployments → selecionar deploy anterior → "Promote to Production".
- Tempo de rollback: **< 1 minuto**.

### Banco de Dados
- ⚠️ **Não há rollback automático** para o banco.
- Antes de qualquer mudança de schema, criar **backup manual** via Supabase dashboard.
- Scripts SQL de referência disponíveis: `supabase-migration.sql`, `supabase-data-clean.sql`.

## Variáveis de Ambiente

### Obrigatórias
| Variável | Descrição | Onde Configurar |
|----------|-----------|----------------|
| `DATABASE_URL` | Connection string PostgreSQL | Vercel → Settings → Environment Variables |
| `SESSION_SECRET` | Secret para sessões Express | Vercel → Settings → Environment Variables |
| `SUPABASE_URL` | URL do projeto Supabase | Vercel → Settings → Environment Variables |
| `SUPABASE_ANON_KEY` | Chave anônima pública do Supabase | Vercel → Settings → Environment Variables |

### Opcionais
| Variável | Descrição | Default |
|----------|-----------|---------|
| `OPENAI_API_KEY` | API key da OpenAI | Não usada (checklist é local) |
| `NODE_ENV` | Ambiente de execução | `production` (Vercel) |

### Local (`.env`)
```bash
DATABASE_URL=postgresql://user:password@host:5432/database
SESSION_SECRET=your-session-secret-here
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
OPENAI_API_KEY=your-openai-api-key-optional
NODE_ENV=development
```

## Estratégia de Versionamento

### Versão Atual
- `package.json`: `"version": "1.0.0"` (não atualizado ativamente).

### Recomendação
- Adotar **Semantic Versioning** (SemVer): `MAJOR.MINOR.PATCH`.
- Usar **tags Git** para releases: `git tag v1.1.0`.
- Manter um `CHANGELOG.md`.

### Branching
- **main**: branch de produção (auto-deploy via Vercel).
- Feature branches: `feature/nome-da-feature`.
- Bugfix branches: `fix/descricao-do-bug`.

## Comandos Úteis

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Inicia servidor dev (Express + Vite HMR) |
| `npm run build` | Build para produção (Vite + esbuild) |
| `npm run start` | Inicia servidor de produção |
| `npm run check` | Verifica tipos TypeScript |
| `npm run db:push` | Sincroniza schema com banco |

## Limitações em Serverless (Vercel)

| Limitação | Impacto | Mitigação |
|-----------|---------|-----------|
| **Filesystem efêmero** | Uploads de arquivo são perdidos entre invocações | Migrar para Supabase Storage |
| **Cold starts** | Latência de 1-3s na primeira requisição | maxDuration: 30s configurado |
| **WebSocket não suportado** | WebSocket (`ws`) não funciona em serverless | Usar Supabase Realtime ou server dedicado |
| **Sem state in-process** | MemoryCache é resetado a cada invocação | Migrar para Redis ou Upstash |
| **Connection pooling** | Pool de 10 conexões pode não ser ideal | Usar Supabase connection pooler (porta 6543) |

## Pré-deploy Checklist

- [ ] Variáveis de ambiente configuradas na Vercel
- [ ] `NODE_ENV=production` ativo
- [ ] Remover plugins Replit do `vite.config.ts` se clonando de Replit
- [ ] Backup do banco antes de schema changes
- [ ] Testar build local: `npm run build && npm run start`
- [ ] Verificar tipos: `npm run check`

---

*Última atualização: 12/02/2026*
