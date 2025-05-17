import { db } from "./server/db";
import { storage } from "./server/storage";

async function addCreatorToEvent() {
  try {
    const eventId = 10; // Lançamento Coleção Primavera 2025
    const userId = "8650891"; // Seu ID de usuário
    
    // Adicionar o criador como membro da equipe com função de organizador
    const teamMember = await storage.addTeamMember({
      eventId,
      userId,
      role: "organizer",
      permissions: { canDelete: true, canEdit: true, canInvite: true }
    });
    
    console.log("Membro adicionado com sucesso:", teamMember);
    
    // Adicionar atividade de log
    await storage.createActivityLog({
      eventId,
      userId,
      action: "added_team_member",
      details: { role: "organizer", addedBy: "system" }
    });
    
    console.log("Log de atividade criado");
    
    const teamMembers = await storage.getTeamMembersByEventId(eventId);
    console.log(`Agora o evento tem ${teamMembers.length} membros na equipe`);
    
    process.exit(0);
  } catch (error) {
    console.error("Erro ao adicionar membro da equipe:", error);
    process.exit(1);
  }
}

// Executar a função
addCreatorToEvent();