import { db } from './server/db';
import { scheduleItems, InsertScheduleItem } from './shared/schema';

async function addScheduleItems() {
  console.log('Adicionando itens de cronograma para todos os eventos...');

  // Obter todos os eventos
  const events = await db.query.events.findMany();
  console.log(`Encontrados ${events.length} eventos.`);

  // Para cada evento, adicionar itens de cronograma
  for (const event of events) {
    console.log(`Criando itens de cronograma para o evento ${event.id} - ${event.name}`);

    // Verificar se já existem itens de cronograma para este evento
    const existingItems = await db.query.scheduleItems.findMany({
      where: (items, { eq }) => eq(items.eventId, event.id)
    });

    // Se já existirem itens, pular este evento
    if (existingItems.length > 0) {
      console.log(`  Evento ${event.id} já possui ${existingItems.length} itens de cronograma.`);
      continue;
    }

    let scheduleItemsToAdd: InsertScheduleItem[] = [];

    // Dependendo do tipo de evento, criar diferentes itens de cronograma
    if (event.type === 'wedding') {
      scheduleItemsToAdd = [
        {
          eventId: event.id,
          title: 'Chegada dos convidados',
          description: 'Recepção dos convidados na entrada do local',
          startTime: '16:00',
          location: 'Entrada principal',
          responsibles: 'Equipe de recepção'
        },
        {
          eventId: event.id,
          title: 'Cerimônia',
          description: 'Cerimônia de casamento',
          startTime: '17:00',
          location: 'Altar principal',
          responsibles: 'Cerimonialista, Noivos, Padrinhos'
        },
        {
          eventId: event.id,
          title: 'Coquetel',
          description: 'Coquetel de boas-vindas',
          startTime: '18:00',
          location: 'Área externa',
          responsibles: 'Equipe de buffet'
        },
        {
          eventId: event.id,
          title: 'Jantar',
          description: 'Jantar dos convidados',
          startTime: '19:30',
          location: 'Salão principal',
          responsibles: 'Equipe de buffet'
        },
        {
          eventId: event.id,
          title: 'Festa',
          description: 'Início da festa com música',
          startTime: '21:00',
          location: 'Pista de dança',
          responsibles: 'DJ e Banda'
        }
      ];
    } else if (event.type === 'corporate') {
      scheduleItemsToAdd = [
        {
          eventId: event.id,
          title: 'Credenciamento',
          description: 'Registro e credenciamento dos participantes',
          startTime: '08:00',
          location: 'Recepção',
          responsibles: 'Equipe de recepção'
        },
        {
          eventId: event.id,
          title: 'Abertura',
          description: 'Cerimônia de abertura com apresentação da agenda',
          startTime: '09:00',
          location: 'Auditório principal',
          responsibles: 'Diretor e Gerentes'
        },
        {
          eventId: event.id,
          title: 'Palestra principal',
          description: 'Palestra com o convidado principal',
          startTime: '10:00',
          location: 'Auditório principal',
          responsibles: 'Palestrante convidado'
        },
        {
          eventId: event.id,
          title: 'Coffee break',
          description: 'Pausa para café e networking',
          startTime: '11:30',
          location: 'Área de convivência',
          responsibles: 'Equipe de buffet'
        },
        {
          eventId: event.id,
          title: 'Workshops paralelos',
          description: 'Sessões de workshops em salas separadas',
          startTime: '13:00',
          location: 'Salas de reunião',
          responsibles: 'Facilitadores e palestrantes'
        },
        {
          eventId: event.id,
          title: 'Encerramento',
          description: 'Encerramento e próximos passos',
          startTime: '16:30',
          location: 'Auditório principal',
          responsibles: 'Diretor de Marketing'
        }
      ];
    } else if (event.type === 'conference') {
      scheduleItemsToAdd = [
        {
          eventId: event.id,
          title: 'Credenciamento',
          description: 'Credenciamento e entrega de material',
          startTime: '08:00',
          location: 'Recepção do Centro de Convenções',
          responsibles: 'Equipe de recepção'
        },
        {
          eventId: event.id,
          title: 'Abertura oficial',
          description: 'Cerimônia de abertura com autoridades',
          startTime: '09:30',
          location: 'Auditório principal',
          responsibles: 'Comitê organizador'
        },
        {
          eventId: event.id,
          title: 'Keynote de abertura',
          description: 'Palestra de abertura com especialista internacional',
          startTime: '10:00',
          location: 'Auditório principal',
          responsibles: 'Palestrante internacional'
        },
        {
          eventId: event.id,
          title: 'Sessões temáticas',
          description: 'Palestras em trilhas paralelas',
          startTime: '11:30',
          location: 'Salas temáticas',
          responsibles: 'Palestrantes convidados'
        },
        {
          eventId: event.id,
          title: 'Almoço',
          description: 'Almoço de networking',
          startTime: '13:00',
          location: 'Área de alimentação',
          responsibles: 'Equipe de catering'
        },
        {
          eventId: event.id,
          title: 'Painéis de discussão',
          description: 'Debate entre especialistas do setor',
          startTime: '14:30',
          location: 'Auditório principal',
          responsibles: 'Moderadores e painelistas'
        },
        {
          eventId: event.id,
          title: 'Encerramento',
          description: 'Cerimônia de encerramento e premiações',
          startTime: '17:30',
          location: 'Auditório principal',
          responsibles: 'Comitê organizador'
        }
      ];
    } else if (event.type === 'party') {
      scheduleItemsToAdd = [
        {
          eventId: event.id,
          title: 'Recepção dos convidados',
          description: 'Boas-vindas e entrega de lembrancinhas',
          startTime: '19:00',
          location: 'Entrada da casa',
          responsibles: 'Anfitriões'
        },
        {
          eventId: event.id,
          title: 'Coquetel de abertura',
          description: 'Drinks de boas-vindas e petiscos',
          startTime: '19:30',
          location: 'Área da piscina',
          responsibles: 'Bartenders'
        },
        {
          eventId: event.id,
          title: 'Jantar',
          description: 'Jantar buffet completo',
          startTime: '21:00',
          location: 'Área coberta',
          responsibles: 'Buffet contratado'
        },
        {
          eventId: event.id,
          title: 'Corte do bolo',
          description: 'Momento especial com o aniversariante',
          startTime: '22:30',
          location: 'Área central',
          responsibles: 'Aniversariante e família'
        },
        {
          eventId: event.id,
          title: 'Festa com DJ',
          description: 'Início da pista de dança com DJ',
          startTime: '23:00',
          location: 'Pista de dança',
          responsibles: 'DJ contratado'
        }
      ];
    } else {
      // Para outros tipos de evento, criar itens genéricos
      scheduleItemsToAdd = [
        {
          eventId: event.id,
          title: 'Início do evento',
          description: 'Abertura oficial',
          startTime: '09:00',
          location: 'Entrada principal',
          responsibles: 'Organizadores'
        },
        {
          eventId: event.id,
          title: 'Atividade principal',
          description: 'Atividade central do evento',
          startTime: '10:30',
          location: 'Área principal',
          responsibles: 'Equipe responsável'
        },
        {
          eventId: event.id,
          title: 'Encerramento',
          description: 'Fechamento do evento',
          startTime: '16:00',
          location: 'Área principal',
          responsibles: 'Organizadores'
        }
      ];
    }

    // Inserir os itens no banco de dados
    if (scheduleItemsToAdd.length > 0) {
      await db.insert(scheduleItems).values(scheduleItemsToAdd);
      console.log(`  Adicionados ${scheduleItemsToAdd.length} itens de cronograma para o evento ${event.id}.`);
    }
  }

  console.log('Concluído!');
  process.exit(0);
}

addScheduleItems().catch(error => {
  console.error('Erro ao adicionar itens de cronograma:', error);
  process.exit(1);
});