import React from "react";
import { formatTaskDueDate, getTaskPriorityColor, getTaskStatusColor } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";

interface Task {
  id: number;
  title: string;
  description?: string;
  dueDate?: string;
  status: "todo" | "in_progress" | "completed";
  priority: "low" | "medium" | "high";
  eventId: number;
  eventName?: string;
  assigneeId?: string;
  assigneeName?: string;
}

interface TaskListProps {
  title?: string;
  tasks?: Task[];
  loading?: boolean;
  showEventName?: boolean;
  onTaskUpdate?: (taskId: number, data: Partial<Task>) => void;
  onTaskDelete?: (taskId: number) => void;
}

const TaskList: React.FC<TaskListProps> = ({
  title = "Tarefas Pendentes",
  tasks: propTasks,
  loading: propLoading,
  showEventName = true,
  onTaskUpdate,
  onTaskDelete
}) => {
  const [, navigate] = useLocation();
  // If tasks are not provided via props, fetch them from the API
  const { data: apiTasks, isLoading: apiLoading } = useQuery({
    queryKey: ['/api/dashboard'],
    enabled: !propTasks,
    select: (data) => data.pendingTasks,
  });

  const tasks = propTasks || apiTasks || [];
  const loading = propLoading || (apiLoading && !propTasks);

  const handleStatusChange = async (taskId: number, newStatus: "todo" | "in_progress" | "completed") => {
    if (!onTaskUpdate) {
      try {
        await apiRequest("PATCH", `/api/tasks/${taskId}`, { status: newStatus });
        // Refresh tasks after update
        window.location.reload();
      } catch (error) {
        console.error("Error updating task status:", error);
      }
    } else {
      onTaskUpdate(taskId, { status: newStatus });
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    if (!onTaskDelete) {
      try {
        await apiRequest("DELETE", `/api/tasks/${taskId}`);
        // Refresh tasks after delete
        window.location.reload();
      } catch (error) {
        console.error("Error deleting task:", error);
      }
    } else {
      onTaskDelete(taskId);
    }
  };

  if (loading) {
    return (
      <div className="bg-card rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-white">{title}</h2>
        </div>
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="bg-card rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-white">{title}</h2>
        </div>
        <div className="p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              <i className="fas fa-check text-primary text-2xl"></i>
            </div>
          </div>
          <h3 className="text-lg font-medium mb-2">Nenhuma tarefa pendente</h3>
          <p className="text-muted-foreground">Você concluiu todas as suas tarefas ou ainda não criou nenhuma.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg shadow-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-border">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-white">{title}</h2>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-muted">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Tarefa</th>
              {showEventName && (
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Evento</th>
              )}
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Data Limite</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Prioridade</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-card divide-y divide-border">
            {tasks.map((task) => (
              <tr key={task.id} className="hover:bg-muted transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-8 w-8 bg-muted rounded-md flex items-center justify-center">
                      <i className={`fas fa-${task.status === 'completed' ? 'check' : 'tasks'} ${task.status === 'completed' ? 'text-green-500' : 'text-primary'}`}></i>
                    </div>
                    <div className="ml-4">
                      <div className={`text-sm font-medium ${task.status === 'completed' ? 'line-through opacity-60 text-muted-foreground' : 'text-white'}`}>{task.title}</div>
                      {task.description && (
                        <div className="text-xs text-muted-foreground truncate max-w-xs">{task.description}</div>
                      )}
                    </div>
                  </div>
                </td>
                {showEventName && (
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-muted-foreground">{task.eventName}</div>
                  </td>
                )}
                <td className="px-6 py-4 whitespace-nowrap">
                  {task.dueDate ? (
                    <>
                      <div className="text-sm text-white">{formatTaskDueDate(task.dueDate).split('(')[0]}</div>
                      {formatTaskDueDate(task.dueDate).includes('(') && (
                        <div className={`text-xs ${
                          formatTaskDueDate(task.dueDate).includes('Atrasado') 
                            ? 'text-red-400' 
                            : formatTaskDueDate(task.dueDate).includes('Hoje') 
                              ? 'text-yellow-400' 
                              : 'text-muted-foreground'
                        }`}>
                          ({formatTaskDueDate(task.dueDate).split('(')[1].replace(')', '')})
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-sm text-muted-foreground">Sem data</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getTaskPriorityColor(task.priority)}`}>
                    {task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Média' : 'Baixa'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getTaskStatusColor(task.status)}`}>
                    {task.status === 'completed' ? 'Concluída' : task.status === 'in_progress' ? 'Em andamento' : 'A fazer'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleStatusChange(
                        task.id, 
                        task.status === 'todo' 
                          ? 'in_progress' 
                          : task.status === 'in_progress' 
                            ? 'completed' 
                            : 'todo'
                      )}
                    >
                      <i className={`fas fa-${
                        task.status === 'todo' 
                          ? 'play' 
                          : task.status === 'in_progress' 
                            ? 'check' 
                            : 'redo'
                      } text-${
                        task.status === 'todo' 
                          ? 'blue' 
                          : task.status === 'in_progress' 
                            ? 'green' 
                            : 'yellow'
                      }-400`}></i>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => {
                        console.log(`Navegando para: /events/${task.eventId}/tasks/${task.id}/edit`);
                        navigate(`/events/${task.eventId}/tasks/${task.id}/edit`);
                      }}
                    >
                      <i className="fas fa-pencil-alt text-amber-400"></i>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleDeleteTask(task.id)}
                    >
                      <i className="fas fa-trash text-red-400"></i>
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TaskList;
