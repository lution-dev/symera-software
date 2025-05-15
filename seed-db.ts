import { db } from "./server/db.js";
import {
  users,
  events,
  tasks,
  eventTeamMembers,
  vendors,
  activityLogs,
} from "./shared/schema.js";

async function seed() {
  console.log("🌱 Semeando o banco de dados com dados de teste...");

  // Limpar dados existentes (opcional, remova se quiser preservar dados)
  await db.delete(activityLogs);
  await db.delete(vendors);
  await db.delete(tasks);
  await db.delete(eventTeamMembers);
  await db.delete(events);
  await db.delete(users);

  console.log("✅ Tabelas limpas com sucesso");

  // Inserir usuários
  const insertedUsers = await db.insert(users).values([
    {
      id: "user1",
      email: "joao.silva@exemplo.com",
      firstName: "João",
      lastName: "Silva",
      profileImageUrl: "https://ui-avatars.com/api/?name=João+Silva",
    },
    {
      id: "user2",
      email: "maria.santos@exemplo.com",
      firstName: "Maria",
      lastName: "Santos",
      profileImageUrl: "https://ui-avatars.com/api/?name=Maria+Santos",
    },
    {
      id: "user3",
      email: "carlos.oliveira@exemplo.com",
      firstName: "Carlos",
      lastName: "Oliveira",
      profileImageUrl: "https://ui-avatars.com/api/?name=Carlos+Oliveira",
    },
    {
      id: "user4",
      email: "ana.pereira@exemplo.com",
      firstName: "Ana",
      lastName: "Pereira",
      profileImageUrl: "https://ui-avatars.com/api/?name=Ana+Pereira",
    },
  ]).returning();

  console.log(`✅ ${insertedUsers.length} usuários inseridos`);

  // Inserir eventos
  const insertedEvents = await db.insert(events).values([
    {
      name: "Casamento João e Maria",
      type: "wedding",
      date: new Date("2025-06-15"),
      location: "Recife, PE",
      description: "Cerimônia e recepção para 150 convidados",
      budget: 50000,
      expenses: 15000,
      attendees: 150,
      status: "planning",
      ownerId: "user1",
    },
    {
      name: "Aniversário de 15 anos",
      type: "birthday",
      date: new Date("2025-04-20"),
      location: "São Paulo, SP",
      description: "Festa de 15 anos para 80 convidados",
      budget: 25000,
      expenses: 5000,
      attendees: 80,
      status: "planning",
      ownerId: "user2",
    },
    {
      name: "Conferência Anual de Tecnologia",
      type: "conference",
      date: new Date("2025-09-10"),
      location: "Rio de Janeiro, RJ",
      description: "Evento corporativo para 300 pessoas",
      budget: 100000,
      expenses: 30000,
      attendees: 300,
      status: "planning",
      ownerId: "user3",
    },
    {
      name: "Jantar Beneficente",
      type: "social",
      date: new Date("2025-11-25"),
      location: "Brasília, DF",
      description: "Evento beneficente para arrecadar fundos",
      budget: 15000,
      expenses: 2000,
      attendees: 50,
      status: "planning",
      ownerId: "user4",
    },
  ]).returning();

  console.log(`✅ ${insertedEvents.length} eventos inseridos`);

  // Inserir tarefas
  const insertedTasks = await db.insert(tasks).values([
    {
      title: "Contratar fotógrafo",
      description: "Encontrar e contratar fotógrafo para o casamento",
      dueDate: new Date("2025-03-15"),
      status: "todo",
      priority: "high",
      eventId: insertedEvents[0].id,
      assigneeId: "user1",
    },
    {
      title: "Reservar local",
      description: "Visitar e reservar local para a cerimônia",
      dueDate: new Date("2025-01-30"),
      status: "completed",
      priority: "high",
      eventId: insertedEvents[0].id,
      assigneeId: "user2",
    },
    {
      title: "Contratar DJ",
      description: "Encontrar DJ para a festa de aniversário",
      dueDate: new Date("2025-02-20"),
      status: "in_progress",
      priority: "medium",
      eventId: insertedEvents[1].id,
      assigneeId: "user2",
    },
    {
      title: "Encomendar bolo",
      description: "Escolher sabor e design do bolo de aniversário",
      dueDate: new Date("2025-03-01"),
      status: "todo",
      priority: "medium",
      eventId: insertedEvents[1].id,
      assigneeId: "user2",
    },
    {
      title: "Contratar palestrantes",
      description: "Entrar em contato com palestrantes para a conferência",
      dueDate: new Date("2025-07-15"),
      status: "in_progress",
      priority: "high",
      eventId: insertedEvents[2].id,
      assigneeId: "user3",
    },
    {
      title: "Reservar equipamento audiovisual",
      description: "Projetores, microfones e sistema de som para a conferência",
      dueDate: new Date("2025-08-01"),
      status: "todo",
      priority: "high",
      eventId: insertedEvents[2].id,
      assigneeId: "user3",
    },
    {
      title: "Contactar restaurante",
      description: "Negociar menu e preços para o jantar beneficente",
      dueDate: new Date("2025-10-15"),
      status: "completed",
      priority: "high",
      eventId: insertedEvents[3].id,
      assigneeId: "user4",
    },
    {
      title: "Criar lista de convidados",
      description: "Compilar lista final de convidados para o jantar",
      dueDate: new Date("2025-10-30"),
      status: "in_progress",
      priority: "medium",
      eventId: insertedEvents[3].id,
      assigneeId: "user4",
    },
  ]).returning();

  console.log(`✅ ${insertedTasks.length} tarefas inseridas`);

  // Inserir membros da equipe
  const insertedTeamMembers = await db.insert(eventTeamMembers).values([
    {
      eventId: insertedEvents[0].id,
      userId: "user1",
      role: "organizer",
      permissions: { canDelete: true, canEdit: true, canInvite: true },
    },
    {
      eventId: insertedEvents[0].id,
      userId: "user2",
      role: "team_member",
      permissions: { canEdit: true, canInvite: false },
    },
    {
      eventId: insertedEvents[0].id,
      userId: "user3",
      role: "vendor",
      permissions: { canView: true },
    },
    {
      eventId: insertedEvents[1].id,
      userId: "user2",
      role: "organizer",
      permissions: { canDelete: true, canEdit: true, canInvite: true },
    },
    {
      eventId: insertedEvents[1].id,
      userId: "user4",
      role: "team_member",
      permissions: { canEdit: true, canInvite: false },
    },
    {
      eventId: insertedEvents[2].id,
      userId: "user3",
      role: "organizer",
      permissions: { canDelete: true, canEdit: true, canInvite: true },
    },
    {
      eventId: insertedEvents[2].id,
      userId: "user1",
      role: "team_member",
      permissions: { canEdit: true, canInvite: false },
    },
    {
      eventId: insertedEvents[3].id,
      userId: "user4",
      role: "organizer",
      permissions: { canDelete: true, canEdit: true, canInvite: true },
    },
    {
      eventId: insertedEvents[3].id,
      userId: "user3",
      role: "team_member",
      permissions: { canEdit: true, canInvite: false },
    },
  ]).returning();

  console.log(`✅ ${insertedTeamMembers.length} membros de equipe inseridos`);

  // Inserir fornecedores
  const insertedVendors = await db.insert(vendors).values([
    {
      name: "Buffet Delícias",
      contactName: "Roberto Almeida",
      contactEmail: "roberto@buffetdelicias.com.br",
      contactPhone: "(11) 98765-4321",
      service: "Buffet",
      cost: 15000,
      notes: "Especializado em casamentos",
      eventId: insertedEvents[0].id,
    },
    {
      name: "Flores & Decoração",
      contactName: "Márcia Gonçalves",
      contactEmail: "marcia@floresedecoracao.com.br",
      contactPhone: "(11) 91234-5678",
      service: "Decoração",
      cost: 8000,
      notes: "Inclui montagem e desmontagem",
      eventId: insertedEvents[0].id,
    },
    {
      name: "DJ Marcelo",
      contactName: "Marcelo Santos",
      contactEmail: "marcelo@djmarcelo.com.br",
      contactPhone: "(21) 99876-5432",
      service: "DJ",
      cost: 2500,
      notes: "Pacote inclui iluminação",
      eventId: insertedEvents[1].id,
    },
    {
      name: "Confeitaria Doce Sonho",
      contactName: "Ana Paula Costa",
      contactEmail: "anapaula@docesonho.com.br",
      contactPhone: "(21) 98765-1234",
      service: "Confeitaria",
      cost: 1200,
      notes: "Bolo de 3 andares e 100 docinhos",
      eventId: insertedEvents[1].id,
    },
    {
      name: "Tech Solutions AV",
      contactName: "Fernando Rodrigues",
      contactEmail: "fernando@techsolutions.com.br",
      contactPhone: "(11) 97654-3210",
      service: "Áudio e Vídeo",
      cost: 12000,
      notes: "Equipamento de última geração",
      eventId: insertedEvents[2].id,
    },
    {
      name: "Catering Executivo",
      contactName: "Cláudia Mendes",
      contactEmail: "claudia@cateringexecutivo.com.br",
      contactPhone: "(11) 98765-9876",
      service: "Alimentação",
      cost: 18000,
      notes: "Coffee breaks e almoço executivo",
      eventId: insertedEvents[2].id,
    },
    {
      name: "Bistrô Gourmet",
      contactName: "Ricardo Nunes",
      contactEmail: "ricardo@bistrogourmet.com.br",
      contactPhone: "(61) 99123-4567",
      service: "Restaurante",
      cost: 7500,
      notes: "Menu completo com 3 opções de entrada e prato principal",
      eventId: insertedEvents[3].id,
    },
    {
      name: "Som & Luz Produções",
      contactName: "Paulo Andrade",
      contactEmail: "paulo@someluzbsb.com.br",
      contactPhone: "(61) 98888-7777",
      service: "Sonorização",
      cost: 2000,
      notes: "Sistema de som e microfones sem fio",
      eventId: insertedEvents[3].id,
    },
  ]).returning();

  console.log(`✅ ${insertedVendors.length} fornecedores inseridos`);

  // Inserir registros de atividade
  const insertedActivities = await db.insert(activityLogs).values([
    {
      eventId: insertedEvents[0].id,
      userId: "user1",
      action: "event_created",
      details: { eventName: "Casamento João e Maria" },
    },
    {
      eventId: insertedEvents[0].id,
      userId: "user1",
      action: "task_added",
      details: { taskTitle: "Contratar fotógrafo" },
    },
    {
      eventId: insertedEvents[0].id,
      userId: "user2",
      action: "task_completed",
      details: { taskTitle: "Reservar local" },
    },
    {
      eventId: insertedEvents[0].id,
      userId: "user1",
      action: "vendor_added",
      details: { vendorName: "Buffet Delícias" },
    },
    {
      eventId: insertedEvents[1].id,
      userId: "user2",
      action: "event_created",
      details: { eventName: "Aniversário de 15 anos" },
    },
    {
      eventId: insertedEvents[1].id,
      userId: "user2",
      action: "task_added",
      details: { taskTitle: "Contratar DJ" },
    },
    {
      eventId: insertedEvents[1].id,
      userId: "user2",
      action: "vendor_added",
      details: { vendorName: "Confeitaria Doce Sonho" },
    },
    {
      eventId: insertedEvents[1].id,
      userId: "user4",
      action: "team_member_added",
      details: { memberName: "Ana Pereira" },
    },
    {
      eventId: insertedEvents[2].id,
      userId: "user3",
      action: "event_created",
      details: { eventName: "Conferência Anual de Tecnologia" },
    },
    {
      eventId: insertedEvents[2].id,
      userId: "user3",
      action: "task_added",
      details: { taskTitle: "Contratar palestrantes" },
    },
    {
      eventId: insertedEvents[2].id,
      userId: "user3",
      action: "vendor_added",
      details: { vendorName: "Tech Solutions AV" },
    },
    {
      eventId: insertedEvents[2].id,
      userId: "user1",
      action: "team_member_added",
      details: { memberName: "João Silva" },
    },
    {
      eventId: insertedEvents[3].id,
      userId: "user4",
      action: "event_created",
      details: { eventName: "Jantar Beneficente" },
    },
    {
      eventId: insertedEvents[3].id,
      userId: "user4",
      action: "task_completed",
      details: { taskTitle: "Contactar restaurante" },
    },
    {
      eventId: insertedEvents[3].id,
      userId: "user4",
      action: "vendor_added",
      details: { vendorName: "Bistrô Gourmet" },
    },
    {
      eventId: insertedEvents[3].id,
      userId: "user3",
      action: "task_in_progress",
      details: { taskTitle: "Criar lista de convidados" },
    },
  ]).returning();

  console.log(`✅ ${insertedActivities.length} registros de atividade inseridos`);

  console.log("✅ Banco de dados populado com sucesso!");
  process.exit(0);
}

seed().catch((e) => {
  console.error("❌ Erro ao popular o banco de dados:", e);
  process.exit(1);
});