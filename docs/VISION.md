# VISION.md — Symera

## Propósito do Produto

Symera é uma plataforma inteligente de gestão de eventos que otimiza a colaboração em equipe através de gerenciamento sofisticado de tarefas, planejamento financeiro e assistência por IA. O objetivo é transformar a organização de eventos em uma experiência fluida e intuitiva, eliminando a complexidade operacional.

## Problema que Resolve

1. **Fragmentação de ferramentas**: Organizadores de eventos usam várias ferramentas (planilhas, WhatsApp, e-mails) sem integração, gerando perda de informação e retrabalho.
2. **Falta de visão unificada**: Sem um painel central, é impossível acompanhar progresso real de tarefas, orçamento e cronograma.
3. **Planejamento manual e propenso a erros**: Checklists criados do zero para cada evento, sem inteligência ou base histórica.
4. **Colaboração deficiente**: Times de evento operam em silos, sem visibilidade compartilhada do status das atividades.
5. **Controle financeiro disperso**: Orçamentos e despesas gerenciados em planilhas separadas, dificultando o acompanhamento em tempo real.

## Público-Alvo

| Segmento | Perfil | Necessidade Principal |
|----------|--------|----------------------|
| **Organizadores profissionais** | Profissionais e empresas de eventos | Gestão centralizada de múltiplos eventos simultâneos |
| **Equipes corporativas** | Times internos de empresas | Organizar eventos corporativos, conferências e workshops |
| **Produtores culturais** | Organizadores de festivais, shows, exposições | Controle de fornecedores, cronograma e equipe |
| **Casais/Famílias** | Organizadores de casamentos, aniversários | Planejamento assistido por IA com checklists inteligentes |

## Diferencial Competitivo

1. **Checklist inteligente por IA**: Geração automática de tarefas baseada no tipo, formato, porte e prazo do evento, adaptada ao contexto específico.
2. **Design mobile-first**: Interface responsiva pensada para uso em campo, durante montagens e inspeções.
3. **Integração vertical completa**: Tarefas, equipe, fornecedores, orçamento, cronograma, documentos e participantes em uma mesma plataforma.
4. **Feedback pós-evento automático**: Sistema público de coleta de feedback com métricas e análise.
5. **Internacionalização nativa**: Suporte completo ao português brasileiro desde o design.

## Métricas de Sucesso

| Métrica | Target | Frequência |
|---------|--------|------------|
| **Eventos ativos** | Crescimento 20% mês/mês | Mensal |
| **Tarefas completadas** | ≥ 80% das tarefas criadas concluídas | Por evento |
| **Utilização do checklist IA** | ≥ 60% dos novos eventos | Mensal |
| **Retenção de usuários** | ≥ 70% retorno em 30 dias | Mensal |
| **NPS (via feedback)** | ≥ 50 | Trimestral |
| **Tempo médio para criar evento** | < 3 minutos (com IA) | Contínuo |
| **Membros de equipe por evento** | ≥ 2 em 50% dos eventos | Mensal |

## Princípios Inegociáveis

1. **Toda interação deve ser mobile-friendly**: Nenhuma funcionalidade pode ser exclusiva para desktop.
2. **Dados do usuário são sagrados**: Nunca deletar dados sem confirmação explícita; soft-deletes quando possível.
3. **Falha graceful com IA**: O sistema deve funcionar plenamente mesmo sem acesso à API da OpenAI.
4. **Autenticação obrigatória para dados sensíveis**: Toda rota que expõe dados de eventos deve exigir autenticação, exceto rotas públicas de feedback.
5. **Experiência em português**: Toda mensagem, erro e interface deve estar em português brasileiro; internacionalização futura não deve comprometer isso.
6. **Performance percebida**: Uso de cache (MemoryCache no backend, localStorage no frontend) para manter a experiência fluida mesmo com conexões instáveis.
7. **Simplicidade sobre complexidade**: Preferir soluções simples e legíveis; evitar over-engineering.

---

*Última atualização: 12/02/2026*
