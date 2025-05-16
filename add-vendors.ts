import { db } from "./server/db";
import { vendors, activityLogs } from "./shared/schema";

async function addVendors() {
  try {
    console.log("Iniciando a inserção de fornecedores...");

    // Fornecedores para o Casamento (Evento ID 5)
    const weddingVendors = [
      {
        name: "Buffet Elegância",
        contactName: "Ana Pereira",
        contactEmail: "ana@buffetelegancia.com.br",
        contactPhone: "(11) 98765-4321",
        service: "catering",
        cost: 18000,
        notes: "Pacote completo com entrada, prato principal e sobremesa para 150 pessoas",
        eventId: 5,
      },
      {
        name: "Flores do Jardim",
        contactName: "Roberto Flores",
        contactEmail: "roberto@floresdojardim.com.br",
        contactPhone: "(11) 97654-3210",
        service: "decoration",
        cost: 8500,
        notes: "Decoração completa para cerimônia e recepção",
        eventId: 5,
      },
      {
        name: "Ateliê de Noivas",
        contactName: "Carla Souza",
        contactEmail: "carla@ateliedenoivas.com.br",
        contactPhone: "(11) 96543-2109",
        service: "costume",
        cost: 7000,
        notes: "Vestido de noiva personalizado com ajustes",
        eventId: 5,
      },
      {
        name: "DJ Marcos",
        contactName: "Marcos Silva",
        contactEmail: "marcos@djmarcos.com.br",
        contactPhone: "(11) 95432-1098",
        service: "music",
        cost: 3500,
        notes: "Pacote de 6 horas com equipamento completo",
        eventId: 5,
      },
      {
        name: "Fotografias Eternas",
        contactName: "Pedro Oliveira",
        contactEmail: "pedro@fotografiaseternas.com.br",
        contactPhone: "(11) 94321-0987",
        service: "photography",
        cost: 5800,
        notes: "Ensaio pré-wedding + cobertura completa do evento",
        eventId: 5,
      }
    ];

    // Fornecedores para o Aniversário de 15 anos (Evento ID 6)
    const birthdayVendors = [
      {
        name: "Festas & Cia",
        contactName: "Julia Mendes",
        contactEmail: "julia@festasecia.com.br",
        contactPhone: "(11) 93210-9876",
        service: "catering",
        cost: 12000,
        notes: "Buffet completo para 80 adolescentes e 40 adultos",
        eventId: 6,
      },
      {
        name: "Balões Mágicos",
        contactName: "Ricardo Torres",
        contactEmail: "ricardo@baloesmagicos.com.br",
        contactPhone: "(11) 92109-8765",
        service: "decoration",
        cost: 3800,
        notes: "Decoração temática com balões e painéis",
        eventId: 6,
      },
      {
        name: "DJ Teen",
        contactName: "Bruno Costa",
        contactEmail: "bruno@djteen.com.br",
        contactPhone: "(11) 91098-7654",
        service: "music",
        cost: 2500,
        notes: "Especializado em festas para adolescentes com playlist personalizada",
        eventId: 6,
      },
      {
        name: "Doces Sonhos Confeitaria",
        contactName: "Marina Lima",
        contactEmail: "marina@docessonhos.com.br",
        contactPhone: "(11) 90987-6543",
        service: "cake",
        cost: 1800,
        notes: "Bolo de 3 andares temático e mesa de doces",
        eventId: 6,
      }
    ];

    // Fornecedores para a Conferência (Evento ID 7)
    const conferenceVendors = [
      {
        name: "Centro de Convenções Nacional",
        contactName: "Carlos Rodrigues",
        contactEmail: "carlos@centroconvencoes.com.br",
        contactPhone: "(11) 98765-1234",
        service: "venue",
        cost: 15000,
        notes: "Auditório principal com capacidade para 300 pessoas",
        eventId: 7,
      },
      {
        name: "Tech Sound & Vision",
        contactName: "Roberta Alves",
        contactEmail: "roberta@techsound.com.br",
        contactPhone: "(11) 97654-2345",
        service: "music",
        cost: 8000,
        notes: "Equipamento audiovisual completo incluindo projetores e sistema de som",
        eventId: 7,
      },
      {
        name: "Coffee Break Express",
        contactName: "Thiago Santos",
        contactEmail: "thiago@coffeebreak.com.br",
        contactPhone: "(11) 96543-3456",
        service: "catering",
        cost: 6500,
        notes: "2 coffee breaks e 1 almoço para 300 participantes",
        eventId: 7,
      },
      {
        name: "Crachás & Materiais",
        contactName: "Fernanda Costa",
        contactEmail: "fernanda@crachasemat.com.br",
        contactPhone: "(11) 95432-4567",
        service: "invitation",
        cost: 3000,
        notes: "Crachás, pastas e materiais personalizados",
        eventId: 7,
      },
      {
        name: "Streaming Pro",
        contactName: "Daniel Martins",
        contactEmail: "daniel@streamingpro.com.br",
        contactPhone: "(11) 94321-5678",
        service: "photography",
        cost: 4500,
        notes: "Transmissão ao vivo e gravação do evento",
        eventId: 7,
      }
    ];

    // Fornecedores para o Workshop (Evento ID 9)
    const workshopVendors = [
      {
        name: "Espaço Coworking Central",
        contactName: "Amanda Vieira",
        contactEmail: "amanda@coworkingcentral.com.br",
        contactPhone: "(11) 93210-6789",
        service: "venue",
        cost: 2000,
        notes: "Sala de treinamento para 30 pessoas",
        eventId: 9,
      },
      {
        name: "Café & Cia",
        contactName: "Gustavo Lima",
        contactEmail: "gustavo@cafeecia.com.br",
        contactPhone: "(11) 92109-7890",
        service: "catering",
        cost: 1500,
        notes: "Coffee break contínuo durante o workshop",
        eventId: 9,
      },
      {
        name: "Gráfica Express",
        contactName: "Camila Soares",
        contactEmail: "camila@graficaexpress.com.br",
        contactPhone: "(11) 91098-8901",
        service: "invitation",
        cost: 800,
        notes: "Impressão de materiais didáticos e certificados",
        eventId: 9,
      }
    ];

    // Fornecedores para o Jantar Beneficente (Evento ID 8)
    const charityDinnerVendors = [
      {
        name: "Restaurante Le Bistro",
        contactName: "Michel Durand",
        contactEmail: "michel@lebistro.com.br",
        contactPhone: "(11) 90987-9012",
        service: "venue",
        cost: 10000,
        notes: "Salão VIP com jantar completo para 100 convidados",
        eventId: 8,
      },
      {
        name: "Trio de Cordas Clássico",
        contactName: "Clara Mendonça",
        contactEmail: "clara@triodecordas.com.br",
        contactPhone: "(11) 98765-0123",
        service: "music",
        cost: 3500,
        notes: "Apresentação durante o coquetel e jantar",
        eventId: 8,
      },
      {
        name: "Leilão Solidário",
        contactName: "Roberto Santos",
        contactEmail: "roberto@leilaosolidario.com.br",
        contactPhone: "(11) 97654-1234",
        service: "other",
        cost: 1500,
        notes: "Organização de leilão beneficente com mestre de cerimônias",
        eventId: 8,
      },
      {
        name: "Convites Elegantes",
        contactName: "Beatriz Silva",
        contactEmail: "beatriz@conviteselegantes.com.br",
        contactPhone: "(11) 96543-2345",
        service: "invitation",
        cost: 2000,
        notes: "Convites impressos personalizados e lista de presença",
        eventId: 8,
      }
    ];

    // Combinar todos os fornecedores
    const allVendors = [
      ...weddingVendors, 
      ...birthdayVendors, 
      ...conferenceVendors, 
      ...workshopVendors,
      ...charityDinnerVendors
    ];

    // Inserir os fornecedores no banco de dados
    const insertedVendors = await db.insert(vendors).values(allVendors).returning();
    
    console.log(`${insertedVendors.length} fornecedores inseridos com sucesso!`);

    // Adicionar logs de atividade para cada fornecedor adicionado
    for (const vendor of insertedVendors) {
      await db.insert(activityLogs).values({
        eventId: vendor.eventId,
        userId: '8650891', // ID do seu usuário
        action: 'vendor_added',
        details: { vendorName: vendor.name, service: vendor.service },
      });
    }

    console.log("Logs de atividade adicionados com sucesso!");

    return insertedVendors;
  } catch (error) {
    console.error("Erro ao adicionar fornecedores:", error);
    throw error;
  }
}

// Executar a função principal
addVendors()
  .then(() => {
    console.log("Processo concluído com sucesso!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Falha no processo:", error);
    process.exit(1);
  });