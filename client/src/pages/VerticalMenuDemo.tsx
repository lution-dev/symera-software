import React from 'react';
import { Link } from 'wouter';
import { Button } from "@/components/ui/button";
import VerticalMenuExample from '@/components/VerticalMenuExample';

const VerticalMenuDemo = () => {
  // Dados de exemplo para o menu
  const mockTasks = [
    { id: 1, title: 'Tarefa 1', dueDate: new Date() },
    { id: 2, title: 'Tarefa 2', dueDate: null },
    { id: 3, title: 'Tarefa 3', dueDate: new Date() }
  ];
  
  const mockTeam = [
    { id: 1, user: { firstName: 'João', lastName: 'Silva' } },
    { id: 2, user: { firstName: 'Maria', lastName: 'Santos' } }
  ];
  
  const mockActivities = [
    { id: 1, action: 'task_completed' },
    { id: 2, action: 'member_added' },
    { id: 3, action: 'budget_updated' },
    { id: 4, action: 'note_added' }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Demo do Menu Vertical</h1>
        <Link href="/">
          <Button variant="outline">Voltar para Dashboard</Button>
        </Link>
      </div>
      
      <div className="mb-6">
        <p className="text-lg mb-2">Este é um exemplo de como ficaria a navegação vertical:</p>
        <p className="text-muted-foreground">Este componente demonstra a estrutura e o comportamento do menu vertical para os detalhes do evento.</p>
      </div>
      
      <VerticalMenuExample 
        tasks={mockTasks}
        team={mockTeam}
        activities={mockActivities}
      />
      
      <div className="mt-8 bg-muted p-6 rounded-lg">
        <h2 className="text-lg font-medium mb-4">Como implementar:</h2>
        <p className="mb-4">Para implementar esta navegação na página de eventos existente:</p>
        <ol className="list-decimal ml-6 space-y-2">
          <li>Adicione o estado <code>activeTab</code> ao componente Event</li>
          <li>Adicione o menu vertical antes ou depois dos cards de resumo</li>
          <li>Use o estado para mostrar o conteúdo correto com base na aba selecionada</li>
        </ol>
        <p className="mt-4 text-sm">Nota: O código fonte deste componente está em <code>client/src/components/VerticalMenuExample.tsx</code></p>
      </div>
    </div>
  );
};

export default VerticalMenuDemo;