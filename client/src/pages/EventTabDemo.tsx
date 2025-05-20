import React, { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

// Componente de demonstração para navegação em duas colunas
const EventTabDemo: React.FC = () => {
  const [activeTab, setActiveTab] = useState("tasks");
  const [, navigate] = useLocation();
  const { toast } = useToast();

  // Dados de exemplo
  const tasks = [
    { id: 1, title: "Contratar buffet", description: "Definir menu e contratar serviço de buffet", priority: "alta" },
    { id: 2, title: "Criar lista de convidados", description: "Compilar lista final de convidados para o jantar", priority: "média" }
  ];
  
  const team = [
    { id: 1, name: "João Silva", role: "Organizador" },
    { id: 2, name: "Maria Souza", role: "Assistente" },
    { id: 3, name: "Carlos Pereira", role: "Fornecedor" }
  ];
  
  const activities = [
    { id: 1, description: "Tarefa 'Contratar buffet' foi criada", date: "2025-05-15" },
    { id: 2, description: "Maria Souza foi adicionada à equipe", date: "2025-05-14" }
  ];

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Detalhes do Evento</h1>
      
      {/* Layout de duas colunas */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        {/* Coluna da esquerda (~260px) - Menu vertical */}
        <div className="w-full md:w-[260px] bg-card rounded-lg shadow-sm">
          <div className="p-3 border-b">
            <h2 className="font-medium text-primary">Seções do Evento</h2>
          </div>
          <div className="flex flex-col w-full space-y-1 p-2">
            <Button 
              variant={activeTab === "tasks" ? "default" : "ghost"}
              className="w-full justify-start px-4 py-3 text-left h-auto"
              onClick={() => setActiveTab("tasks")}
            >
              <i className="fas fa-tasks mr-3"></i> 
              Tarefas 
              <span className="ml-2 bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs">{tasks.length}</span>
            </Button>
            <Button 
              variant={activeTab === "team" ? "default" : "ghost"}
              className="w-full justify-start px-4 py-3 text-left h-auto"
              onClick={() => setActiveTab("team")}
            >
              <i className="fas fa-users mr-3"></i> 
              Equipe 
              <span className="ml-2 bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs">{team.length}</span>
            </Button>
            <Button 
              variant={activeTab === "timeline" ? "default" : "ghost"}
              className="w-full justify-start px-4 py-3 text-left h-auto"
              onClick={() => setActiveTab("timeline")}
            >
              <i className="fas fa-calendar-alt mr-3"></i> 
              Cronograma
            </Button>
            <Button 
              variant={activeTab === "activity" ? "default" : "ghost"}
              className="w-full justify-start px-4 py-3 text-left h-auto"
              onClick={() => setActiveTab("activity")}
            >
              <i className="fas fa-history mr-3"></i> 
              Atividades
              <span className="ml-2 bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs">{activities.length}</span>
            </Button>
          </div>
        </div>
        
        {/* Coluna da direita - Conteúdo da aba selecionada */}
        <div className="flex-1 bg-card rounded-lg p-6">
          {/* Conteúdo da aba Tarefas */}
          {activeTab === "tasks" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Checklist do Evento</h2>
                <div className="flex gap-2">
                  <Button onClick={() => toast({ title: "Nova tarefa", description: "Função de nova tarefa clicada" })}>
                    <i className="fas fa-plus mr-2"></i> Nova Tarefa
                  </Button>
                  <Button variant="outline">
                    <i className="fas fa-external-link-alt mr-2"></i> Ver tudo
                  </Button>
                </div>
              </div>
              
              <div className="bg-muted rounded-lg">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3">Tarefa</th>
                      <th className="text-left p-3 w-32">Prioridade</th>
                      <th className="text-right p-3 w-24">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tasks.map(task => (
                      <tr key={task.id} className="border-b last:border-0">
                        <td className="p-3">
                          <div className="font-medium">{task.title}</div>
                          <div className="text-xs text-muted-foreground">{task.description}</div>
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            task.priority === 'alta' ? 'bg-red-500/10 text-red-500' : 
                            task.priority === 'média' ? 'bg-amber-500/10 text-amber-500' : 
                            'bg-green-500/10 text-green-500'
                          }`}>
                            {task.priority === 'alta' ? 'Alta' : 
                            task.priority === 'média' ? 'Média' : 'Baixa'}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex justify-end gap-1">
                            <Button size="icon" variant="ghost" className="h-8 w-8">
                              <i className="fas fa-edit text-muted-foreground"></i>
                            </Button>
                            <Button size="icon" variant="ghost" className="h-8 w-8">
                              <i className="fas fa-trash text-muted-foreground"></i>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          {/* Conteúdo da aba Equipe */}
          {activeTab === "team" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Equipe do Evento</h2>
                <Button>
                  <i className="fas fa-user-plus mr-2"></i> Adicionar Membro
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {team.map(member => (
                  <div key={member.id} className="bg-muted p-4 rounded-lg">
                    <div className="flex items-center">
                      <div className="bg-primary/10 text-primary rounded-full w-10 h-10 flex items-center justify-center mr-3">
                        {member.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <p className="text-xs text-muted-foreground">{member.role}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Conteúdo da aba Cronograma */}
          {activeTab === "timeline" && (
            <div>
              <h2 className="text-xl font-semibold mb-6">Cronograma do Evento</h2>
              
              <div className="bg-muted p-8 rounded-lg text-center">
                <div className="mb-4">
                  <i className="fas fa-calendar-day text-primary text-4xl"></i>
                </div>
                <h3 className="text-lg font-medium mb-2">Nenhuma tarefa com prazo definido</h3>
                <p className="text-muted-foreground mb-4">Adicione tarefas com prazos para visualizar o cronograma do evento</p>
                <Button>
                  <i className="fas fa-tasks mr-2"></i> Gerenciar Checklist
                </Button>
              </div>
            </div>
          )}
          
          {/* Conteúdo da aba Atividades */}
          {activeTab === "activity" && (
            <div>
              <h2 className="text-xl font-semibold mb-6">Atividade Recente</h2>
              
              <div className="space-y-4">
                {activities.map(activity => (
                  <div key={activity.id} className="bg-muted p-3 rounded-lg">
                    <div className="flex gap-3">
                      <div className="bg-primary/10 text-primary rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
                        <i className="fas fa-bell text-sm"></i>
                      </div>
                      <div>
                        <p className="text-sm">{activity.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">{activity.date}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventTabDemo;