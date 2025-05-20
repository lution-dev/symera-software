import React, { useState } from 'react';

interface VerticalNavTabsProps {
  tasks: any[];
  team: any[];
  activities: any[];
}

const VerticalNavTabs: React.FC<VerticalNavTabsProps> = ({
  tasks,
  team,
  activities
}) => {
  const [activeTab, setActiveTab] = useState('tasks');

  return (
    <div className="flex flex-col sm:flex-row gap-6 mb-8">
      {/* Coluna da esquerda - Menu vertical */}
      <div className="w-full sm:w-[260px] flex-shrink-0 mb-4 sm:mb-0 sm:border-r sm:pr-4">
        <div className="flex flex-row sm:flex-col space-x-2 sm:space-x-0 sm:space-y-2 overflow-x-auto sm:overflow-visible">
          <button 
            onClick={() => setActiveTab('tasks')}
            className={`flex justify-start items-center w-full px-3 py-2 rounded-md ${activeTab === 'tasks' ? 'bg-muted text-primary font-medium' : 'hover:bg-muted hover:text-primary'}`}
          >
            <i className="fas fa-tasks mr-2"></i> Tarefas 
            {Array.isArray(tasks) && tasks.length > 0 && (
              <span className="ml-auto bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full">
                {tasks.length}
              </span>
            )}
          </button>
          
          <button 
            onClick={() => setActiveTab('team')}
            className={`flex justify-start items-center w-full px-3 py-2 rounded-md ${activeTab === 'team' ? 'bg-muted text-primary font-medium' : 'hover:bg-muted hover:text-primary'}`}
          >
            <i className="fas fa-users mr-2"></i> Equipe
            {Array.isArray(team) && team.length > 0 && (
              <span className="ml-auto bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full">
                {team.length}
              </span>
            )}
          </button>
          
          <button 
            onClick={() => setActiveTab('timeline')}
            className={`flex justify-start items-center w-full px-3 py-2 rounded-md ${activeTab === 'timeline' ? 'bg-muted text-primary font-medium' : 'hover:bg-muted hover:text-primary'}`}
          >
            <i className="fas fa-calendar-alt mr-2"></i> Cronograma
            {Array.isArray(tasks) && tasks.filter((task: any) => !!task.dueDate).length > 0 && (
              <span className="ml-auto bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full">
                {tasks.filter((task: any) => !!task.dueDate).length}
              </span>
            )}
          </button>
          
          <button 
            onClick={() => setActiveTab('activity')}
            className={`flex justify-start items-center w-full px-3 py-2 rounded-md ${activeTab === 'activity' ? 'bg-muted text-primary font-medium' : 'hover:bg-muted hover:text-primary'}`}
          >
            <i className="fas fa-history mr-2"></i> Atividades
            {Array.isArray(activities) && activities.length > 0 && (
              <span className="ml-auto bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full">
                {activities.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Para ilustrar apenas a navegação vertical */}
      <div className="p-4 bg-muted rounded-md flex-grow">
        <h3 className="font-medium mb-2">Demonstração da Navegação Vertical</h3>
        <p>Aba ativa: <strong>{activeTab}</strong></p>
        <p className="text-muted-foreground text-sm mt-2">
          Este é apenas um componente de demonstração para a navegação vertical.
          Os dados reais continuarão usando o sistema de tabs atual.
        </p>
      </div>
    </div>
  );
};

export default VerticalNavTabs;