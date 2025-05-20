import React, { useState } from 'react';

// Este é um exemplo de como seria um menu vertical
// com contadores para cada item de navegação.

interface VerticalMenuExampleProps {
  tasks?: any[];
  team?: any[];
  activities?: any[];
}

const VerticalMenuExample: React.FC<VerticalMenuExampleProps> = ({
  tasks = [],
  team = [],
  activities = []
}) => {
  const [activeTab, setActiveTab] = useState('tasks');
  
  // Contador de tarefas com prazo
  const tasksWithDueDate = tasks.filter((task: any) => !!task.dueDate).length;
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-lg font-medium mb-4">Exemplo de Menu Vertical</h2>
      <p className="text-sm text-muted-foreground mb-6">
        Esta é uma implementação simples de um menu vertical com ícones e contadores.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-6">
        {/* Coluna da esquerda - Menu vertical (~260px) */}
        <div className="w-full sm:w-[260px] flex-shrink-0 border-r pr-4">
          <div className="flex flex-row sm:flex-col space-x-2 sm:space-x-0 sm:space-y-2 overflow-x-auto sm:overflow-visible">
            <button 
              onClick={() => setActiveTab('tasks')}
              className={`flex justify-start items-center w-full px-3 py-2 rounded-md ${activeTab === 'tasks' ? 'bg-muted text-primary font-medium' : 'hover:bg-muted hover:text-primary'}`}
            >
              <i className="fas fa-tasks mr-2"></i> Tarefas 
              <span className="ml-auto bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full">
                {tasks.length}
              </span>
            </button>
            
            <button 
              onClick={() => setActiveTab('team')}
              className={`flex justify-start items-center w-full px-3 py-2 rounded-md ${activeTab === 'team' ? 'bg-muted text-primary font-medium' : 'hover:bg-muted hover:text-primary'}`}
            >
              <i className="fas fa-users mr-2"></i> Equipe
              <span className="ml-auto bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full">
                {team.length}
              </span>
            </button>
            
            <button 
              onClick={() => setActiveTab('timeline')}
              className={`flex justify-start items-center w-full px-3 py-2 rounded-md ${activeTab === 'timeline' ? 'bg-muted text-primary font-medium' : 'hover:bg-muted hover:text-primary'}`}
            >
              <i className="fas fa-calendar-alt mr-2"></i> Cronograma
              <span className="ml-auto bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full">
                {tasksWithDueDate}
              </span>
            </button>
            
            <button 
              onClick={() => setActiveTab('activity')}
              className={`flex justify-start items-center w-full px-3 py-2 rounded-md ${activeTab === 'activity' ? 'bg-muted text-primary font-medium' : 'hover:bg-muted hover:text-primary'}`}
            >
              <i className="fas fa-history mr-2"></i> Atividades
              <span className="ml-auto bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full">
                {activities.length}
              </span>
            </button>
          </div>
        </div>
        
        {/* Coluna da direita - Apenas para demonstração */}
        <div className="flex-grow">
          <div className="p-4 bg-muted rounded-md">
            <h3 className="font-medium mb-2">Aba Selecionada: {activeTab}</h3>
            <p className="text-sm text-muted-foreground">
              Este componente mostra como ficaria a navegação vertical.
              Para implementá-lo no aplicativo real, o código seria ligeiramente adaptado 
              para integrar com as funcionalidades existentes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerticalMenuExample;