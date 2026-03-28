import OpenAI from "openai";

// OpenAI configuration (optional - only used if API key is provided)
const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null;

type ChecklistItem = {
  title: string;
  dueDate?: Date;
  description?: string;
  priority?: string;
};

// Gera checklist usando OpenAI GPT (quando disponível)
async function generateWithAI(
  eventData: any,
  existingTitles: Set<string>,
  daysUntilEvent: number,
  eventStartDate: Date
): Promise<ChecklistItem[]> {
  if (!openai) return [];

  const existingList = existingTitles.size > 0
    ? `\nTAREFAS JÁ EXISTENTES (NÃO repita nenhuma delas):\n${Array.from(existingTitles).map(t => `- ${t}`).join("\n")}`
    : "";

  const prompt = `Você é um planejador profissional de eventos. Analise o evento abaixo e gere entre 5 e 8 NOVAS tarefas práticas e específicas para o sucesso deste evento.

EVENTO:
- Nome: ${eventData.name}
- Tipo: ${eventData.type}
- Data: ${eventData.startDate}
- Local: ${eventData.location || "A definir"}
- Descrição: ${eventData.description || "Sem descrição"}
- Orçamento: R$ ${eventData.budget || "Não definido"}
- Participantes: ${eventData.attendees || "Não definido"}
- Dias até o evento: ${daysUntilEvent}
${existingList}

REGRAS:
1. Gere tarefas NOVAS, DIFERENTES e COMPLEMENTARES às existentes
2. Seja específico e contextual ao tipo de evento
3. Cada tarefa deve ter: title, description, priority (high/medium/low), dueDateBefore (número de dias antes do evento)
4. Pense em detalhes que um organizador poderia esquecer
5. Considere: comunicação, logística, experiência do participante, contingências, pós-evento

Responda APENAS com um JSON array válido, sem markdown. Exemplo:
[{"title":"...","description":"...","priority":"medium","dueDateBefore":7}]`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.9,
      max_tokens: 2000,
    });

    const content = response.choices[0]?.message?.content?.trim() || "[]";
    const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const items = JSON.parse(cleaned);

    return items
      .filter((item: any) => !existingTitles.has(item.title?.toLowerCase().trim()))
      .map((item: any) => {
        let dueDate: Date | undefined;
        const daysBefore = item.dueDateBefore || 3;
        dueDate = new Date(eventStartDate);
        dueDate.setDate(dueDate.getDate() - daysBefore);

        return {
          title: item.title,
          description: item.description || "",
          dueDate,
          priority: item.priority || "medium",
        };
      });
  } catch (error) {
    console.error("Erro ao gerar tarefas com OpenAI:", error);
    return [];
  }
}

// Banco expandido de tarefas, organizado por categoria
// Cada categoria tem muitas opções para permitir várias gerações sem repetir
const TASK_BANK: Record<string, Array<{
  title: string;
  description: string;
  priority: string;
  dueDateBefore: number;
  condition?: (ctx: any) => boolean;
}>> = {
  planejamento: [
    { title: "Definir objetivos e propósito do evento", description: "Estabelecer metas claras, público-alvo e resultados esperados", priority: "high", dueDateBefore: 45 },
    { title: "Criar cronograma detalhado do evento", description: "Definir horários, atividades e responsáveis para cada momento", priority: "high", dueDateBefore: 30 },
    { title: "Definir KPIs e métricas de sucesso", description: "Estabelecer indicadores para medir o resultado do evento", priority: "medium", dueDateBefore: 35 },
    { title: "Elaborar plano de contingência", description: "Preparar soluções para imprevistos como clima, atrasos e falhas técnicas", priority: "medium", dueDateBefore: 15 },
    { title: "Mapear riscos e pontos críticos", description: "Identificar possíveis problemas e criar planos de mitigação", priority: "medium", dueDateBefore: 25 },
    { title: "Definir público-alvo e personas", description: "Detalhar perfil dos participantes ideais e suas expectativas", priority: "medium", dueDateBefore: 40 },
    { title: "Criar briefing completo do evento", description: "Documento consolidando todas as informações-chave para a equipe", priority: "high", dueDateBefore: 30 },
    { title: "Revisar e aprovar orçamento final", description: "Validar todos os custos previstos e margem de segurança", priority: "high", dueDateBefore: 20 },
  ],

  local: [
    { title: "Pesquisar e reservar local", description: "Encontrar espaço adequado para os participantes", priority: "high", dueDateBefore: 30, condition: (ctx) => !ctx.hasLocation },
    { title: "Confirmar reserva e preparar espaço", description: "Finalizar detalhes com o local e planejar layout", priority: "high", dueDateBefore: 20, condition: (ctx) => ctx.hasLocation },
    { title: "Visitar o local e verificar infraestrutura", description: "Conferir instalações, tomadas, acesso Wi-Fi e banheiros", priority: "high", dueDateBefore: 15 },
    { title: "Definir layout e disposição do espaço", description: "Planejar posição de palco, cadeiras, mesas e áreas de circulação", priority: "medium", dueDateBefore: 12 },
    { title: "Verificar acessibilidade do local", description: "Garantir rampas, elevadores e sinalização para PCD", priority: "high", dueDateBefore: 20 },
    { title: "Confirmar estacionamento e acessos", description: "Verificar vagas, transporte público e rotas de acesso", priority: "medium", dueDateBefore: 10 },
    { title: "Planejar sinalização interna", description: "Criar placas indicativas, banners e identificação de áreas", priority: "low", dueDateBefore: 5 },
    { title: "Organizar limpeza pré e pós evento", description: "Contratar equipe de limpeza ou confirmar com o local", priority: "medium", dueDateBefore: 3 },
  ],

  comunicacao: [
    { title: "Criar lista de participantes", description: "Desenvolver lista completa de convidados e contatos", priority: "high", dueDateBefore: 25 },
    { title: "Criar e enviar convites", description: "Desenvolver convites e sistema de confirmação", priority: "high", dueDateBefore: 20 },
    { title: "Criar estratégia de divulgação", description: "Planejar marketing digital e redes sociais", priority: "medium", dueDateBefore: 15 },
    { title: "Criar página de inscrição online", description: "Configurar formulário com campos necessários e confirmação automática", priority: "high", dueDateBefore: 25 },
    { title: "Preparar e-mail de confirmação", description: "Template com informações de local, horário e o que levar", priority: "medium", dueDateBefore: 10 },
    { title: "Criar posts para redes sociais", description: "Desenvolver conteúdo visual e textos para Instagram, LinkedIn e WhatsApp", priority: "medium", dueDateBefore: 18 },
    { title: "Enviar lembrete aos confirmados", description: "Reenviar informações essenciais 3 dias antes do evento", priority: "high", dueDateBefore: 3 },
    { title: "Preparar comunicação pós-evento", description: "Elaborar e-mail de agradecimento e próximos passos", priority: "medium", dueDateBefore: -1 },
    { title: "Criar hashtag oficial do evento", description: "Definir hashtag para uso nas redes sociais e materiais", priority: "low", dueDateBefore: 20 },
    { title: "Enviar press release para mídia", description: "Preparar release e contatar jornalistas e influenciadores", priority: "medium", dueDateBefore: 15, condition: (ctx) => ctx.isLargeEvent },
    { title: "Criar grupo de WhatsApp do evento", description: "Organizar grupo para comunicação rápida com participantes", priority: "low", dueDateBefore: 7 },
  ],

  fornecedores: [
    { title: "Organizar alimentação e bebidas", description: "Contratar catering ou organizar coffee break", priority: "medium", dueDateBefore: 15, condition: (ctx) => ctx.hasBudget },
    { title: "Contratar serviços audiovisuais", description: "Garantir som, iluminação e equipamentos necessários", priority: "medium", dueDateBefore: 20 },
    { title: "Contratar fotógrafo e/ou cinegrafista", description: "Garantir registro profissional do evento", priority: "medium", dueDateBefore: 15 },
    { title: "Solicitar orçamentos de fornecedores", description: "Pedir propostas de pelo menos 3 fornecedores por serviço", priority: "high", dueDateBefore: 30 },
    { title: "Contratar decoração e ambientação", description: "Definir tema visual, flores, iluminação decorativa", priority: "medium", dueDateBefore: 12, condition: (ctx) => ctx.hasBudget },
    { title: "Confirmar entregas dos fornecedores", description: "Reconfirmar datas, horários e especificações com cada fornecedor", priority: "high", dueDateBefore: 3 },
    { title: "Contratar segurança e controle de acesso", description: "Definir equipe de segurança para o evento", priority: "medium", dueDateBefore: 10, condition: (ctx) => ctx.isLargeEvent },
    { title: "Definir cardápio e restrições alimentares", description: "Consultar participantes sobre alergias e preferências", priority: "medium", dueDateBefore: 10, condition: (ctx) => ctx.hasBudget },
    { title: "Providenciar brindes e materiais promocionais", description: "Encomendar brindes personalizados para os participantes", priority: "low", dueDateBefore: 10 },
  ],

  conteudo: [
    { title: "Preparar conteúdo e material didático", description: "Desenvolver apostilas, apresentações e exercícios práticos", priority: "high", dueDateBefore: 25, condition: (ctx) => ctx.isWorkshop },
    { title: "Testar equipamentos e materiais", description: "Verificar som, projeção e materiais necessários", priority: "high", dueDateBefore: 7, condition: (ctx) => ctx.isWorkshop },
    { title: "Definir pauta e roteiro do evento", description: "Criar roteiro detalhado com transições e tempos", priority: "high", dueDateBefore: 15 },
    { title: "Confirmar palestrantes e convidados especiais", description: "Validar presença e alinhar apresentações", priority: "high", dueDateBefore: 15 },
    { title: "Preparar apresentação de slides", description: "Criar slides profissionais com identidade visual do evento", priority: "medium", dueDateBefore: 7 },
    { title: "Criar dinâmicas de interação", description: "Planejar icebreakers, Q&A e momentos de networking", priority: "medium", dueDateBefore: 8 },
    { title: "Preparar certificados de participação", description: "Criar modelo de certificado com dados do evento", priority: "low", dueDateBefore: 5, condition: (ctx) => ctx.isWorkshop },
    { title: "Gravar vídeo teaser do evento", description: "Produzir vídeo curto para divulgação nas redes", priority: "low", dueDateBefore: 20 },
    { title: "Preparar material impresso", description: "Imprimir programações, mapas e fichas de avaliação", priority: "medium", dueDateBefore: 3 },
    { title: "Definir mestre de cerimônias", description: "Contratar ou designar responsável por conduzir o evento", priority: "high", dueDateBefore: 15, condition: (ctx) => ctx.isLargeEvent },
  ],

  equipe: [
    { title: "Organizar equipe de apoio", description: "Definir recepção, controle de acesso e suporte", priority: "medium", dueDateBefore: 15, condition: (ctx) => ctx.isLargeEvent },
    { title: "Sistema de credenciamento", description: "Configurar processo de entrada e identificação", priority: "medium", dueDateBefore: 10, condition: (ctx) => ctx.isLargeEvent },
    { title: "Fazer reunião de alinhamento com equipe", description: "Alinhar responsabilidades, horários e procedimentos", priority: "high", dueDateBefore: 5 },
    { title: "Distribuir funções e responsabilidades", description: "Atribuir tarefas específicas para cada membro da equipe", priority: "high", dueDateBefore: 10 },
    { title: "Treinar equipe de recepção", description: "Orientar sobre abordagem, informações e protocolo", priority: "medium", dueDateBefore: 3 },
    { title: "Criar escala de trabalho da equipe", description: "Definir turnos e horários de cada pessoa da organização", priority: "medium", dueDateBefore: 5 },
    { title: "Definir canal de comunicação da equipe", description: "Criar grupo exclusivo para comunicação durante o evento", priority: "medium", dueDateBefore: 7 },
  ],

  preparacao_final: [
    { title: "Confirmar presença dos participantes", description: "Fazer follow-up final e organizar lista de confirmados", priority: "medium", dueDateBefore: 5 },
    { title: "Preparar materiais do evento", description: "Organizar crachás, kits e materiais de distribuição", priority: "high", dueDateBefore: 1 },
    { title: "Revisar logística final", description: "Verificar todos os detalhes e preparativos finais", priority: "high", dueDateBefore: 1 },
    { title: "Fazer checklist de montagem", description: "Listar todos os itens necessários para montagem no local", priority: "high", dueDateBefore: 2 },
    { title: "Testar conexão de internet no local", description: "Verificar velocidade e estabilidade do Wi-Fi", priority: "medium", dueDateBefore: 2 },
    { title: "Preparar mesa de credenciamento", description: "Organizar listas, crachás e materiais de recepção", priority: "high", dueDateBefore: 1 },
    { title: "Conferir sonorização e microfones", description: "Testar todo o equipamento de áudio no local", priority: "high", dueDateBefore: 1 },
    { title: "Verificar projeção e telas", description: "Testar projetor, resolução e conectividade", priority: "high", dueDateBefore: 1 },
    { title: "Organizar transporte de materiais", description: "Planejar logística de levar tudo ao local do evento", priority: "medium", dueDateBefore: 2 },
  ],

  pos_evento: [
    { title: "Coletar feedback dos participantes", description: "Enviar formulário de avaliação e coletar sugestões", priority: "medium", dueDateBefore: -2 },
    { title: "Enviar fotos e materiais aos participantes", description: "Compartilhar álbum de fotos e apresentações", priority: "medium", dueDateBefore: -3 },
    { title: "Fazer relatório final do evento", description: "Documentar resultados, custos reais e aprendizados", priority: "high", dueDateBefore: -5 },
    { title: "Agradecer fornecedores e parceiros", description: "Enviar e-mail ou mensagem de agradecimento formal", priority: "low", dueDateBefore: -3 },
    { title: "Analisar métricas e ROI do evento", description: "Calcular retorno sobre investimento e impacto", priority: "medium", dueDateBefore: -7 },
    { title: "Publicar conteúdo pós-evento nas redes", description: "Compartilhar highlights, fotos e depoimentos", priority: "medium", dueDateBefore: -2 },
    { title: "Fazer debriefing com a equipe", description: "Reunião para discutir o que funcionou e melhorias para o futuro", priority: "medium", dueDateBefore: -5 },
    { title: "Acertar pagamentos pendentes", description: "Finalizar pagamentos com fornecedores e fechar contas", priority: "high", dueDateBefore: -10 },
  ],

  moda: [
    { title: "Definir conceito e tema", description: "Finalizar conceito, paleta de cores e tema geral", priority: "high", dueDateBefore: 30, condition: (ctx) => ctx.isFashionEvent },
    { title: "Contratar modelos e equipe de produção", description: "Selecionar modelos, fotógrafos e equipe técnica", priority: "high", dueDateBefore: 25, condition: (ctx) => ctx.isFashionEvent },
    { title: "Organizar peças da coleção", description: "Catalogar, etiquetar e separar peças por look", priority: "high", dueDateBefore: 10, condition: (ctx) => ctx.isFashionEvent },
    { title: "Fazer prova de roupas com modelos", description: "Ajustar caimento e definir ordem dos looks", priority: "high", dueDateBefore: 7, condition: (ctx) => ctx.isFashionEvent },
    { title: "Montar backstage e camarim", description: "Preparar espaço com espelhos, iluminação e araras", priority: "medium", dueDateBefore: 2, condition: (ctx) => ctx.isFashionEvent },
    { title: "Contratar maquiadores e cabeleireiros", description: "Alinhar visual com o conceito da coleção", priority: "high", dueDateBefore: 15, condition: (ctx) => ctx.isFashionEvent },
  ],

  tecnologia: [
    { title: "Configurar sistema de inscrição/check-in", description: "Preparar QR codes, listas digitais ou app de check-in", priority: "medium", dueDateBefore: 7 },
    { title: "Preparar transmissão ao vivo", description: "Configurar câmeras, encoder e plataforma de streaming", priority: "medium", dueDateBefore: 5, condition: (ctx) => ctx.isLargeEvent },
    { title: "Criar pesquisa/enquete ao vivo", description: "Configurar ferramenta interativa para participação do público", priority: "low", dueDateBefore: 5 },
    { title: "Testar aplicativo do evento", description: "Verificar funcionamento do app ou plataforma digital", priority: "medium", dueDateBefore: 3 },
    { title: "Configurar rede Wi-Fi dedicada", description: "Garantir banda suficiente para todos os participantes", priority: "medium", dueDateBefore: 3, condition: (ctx) => ctx.isLargeEvent },
  ],
};

// Gera checklist usando banco de tarefas expandido (fallback sem OpenAI)
function generateFromTaskBank(
  eventData: any,
  existingTitles: Set<string>,
  daysUntilEvent: number,
  eventStartDate: Date
): ChecklistItem[] {
  const ctx = {
    hasLocation: !!eventData.location,
    isLargeEvent: (eventData.attendees || 0) >= 100,
    hasBudget: (eventData.budget || 0) > 1000,
    hasHighBudget: (eventData.budget || 0) >= 20000,
    isWorkshop: /workshop|intensivo|aprenda|curso|treinamento/i.test(
      `${eventData.name || ""} ${eventData.description || ""}`
    ),
    isFashionEvent: /coleção|moda|desfile/i.test(eventData.name || ""),
  };

  // Coletar todas as tarefas elegíveis (condição atendida + não duplicada)
  const eligible: typeof TASK_BANK["planejamento"] = [];

  for (const category of Object.values(TASK_BANK)) {
    for (const task of category) {
      const conditionMet = !task.condition || task.condition(ctx);
      const notDuplicate = !existingTitles.has(task.title.toLowerCase().trim());

      if (conditionMet && notDuplicate) {
        eligible.push(task);
      }
    }
  }

  if (eligible.length === 0) {
    console.log("Nenhuma tarefa nova disponível no banco de tarefas");
    return [];
  }

  // Embaralhar e pegar entre 5 e 8 tarefas
  const shuffled = eligible.sort(() => Math.random() - 0.5);
  const count = Math.min(shuffled.length, 5 + Math.floor(Math.random() * 4)); // 5 a 8
  const selected = shuffled.slice(0, count);

  return selected.map(item => {
    const daysBefore = Math.min(item.dueDateBefore, daysUntilEvent - 1);
    let dueDate: Date;

    if (daysBefore > 0) {
      dueDate = new Date(eventStartDate);
      dueDate.setDate(dueDate.getDate() - daysBefore);
    } else if (daysBefore < 0) {
      dueDate = new Date(eventStartDate);
      dueDate.setDate(dueDate.getDate() + Math.abs(daysBefore));
    } else {
      dueDate = new Date(eventStartDate);
    }

    return {
      title: item.title,
      description: item.description,
      dueDate,
      priority: item.priority,
    };
  });
}

// Função principal — sempre gera tarefas novas, nunca repete existentes
export async function generateEventChecklist(
  eventData: any,
  existingTaskTitles: string[] = []
): Promise<ChecklistItem[]> {
  try {
    const eventStartDate = new Date(eventData.startDate);
    const today = new Date();
    const daysUntilEvent = Math.ceil((eventStartDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    console.log("Gerando checklist para evento:", eventData.name);
    console.log("Tarefas existentes:", existingTaskTitles.length);

    const existingTitles = new Set(existingTaskTitles.map(t => t.toLowerCase().trim()));

    // Tentar gerar com OpenAI primeiro
    if (openai) {
      console.log("Usando OpenAI para gerar tarefas...");
      const aiTasks = await generateWithAI(eventData, existingTitles, daysUntilEvent, eventStartDate);
      if (aiTasks.length > 0) {
        console.log(`OpenAI gerou ${aiTasks.length} tarefas novas`);
        return aiTasks;
      }
      console.log("OpenAI não retornou tarefas, usando fallback...");
    }

    // Fallback: banco de tarefas expandido
    console.log("Usando banco de tarefas local...");
    const tasks = generateFromTaskBank(eventData, existingTitles, daysUntilEvent, eventStartDate);
    console.log(`Banco local gerou ${tasks.length} tarefas novas`);
    return tasks;

  } catch (error) {
    console.error("Erro ao gerar checklist:", error);
    return [];
  }
}