import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScheduleItem } from '@shared/schema';
import { ScheduleItemForm, ScheduleFormData } from './ScheduleItemForm';
import { ScheduleItemActions } from './ScheduleItemActions';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface ScheduleListProps {
  eventId: number;
}

export const ScheduleList: React.FC<ScheduleListProps> = ({ eventId }) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ScheduleItem | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Buscar itens do cronograma
  const { data: scheduleItems = [], isLoading } = useQuery({
    queryKey: ['/api/events', eventId, 'schedule'],
    queryFn: async () => {
      const response = await apiRequest(`/api/events/${eventId}/schedule`);
      return Array.isArray(response) ? response : [];
    }
  });

  // Ordenar itens por horário
  const sortedItems = React.useMemo(() => {
    if (!scheduleItems || !Array.isArray(scheduleItems) || scheduleItems.length === 0) {
      return [];
    }
    
    return [...scheduleItems].sort((a, b) => {
      // Converte o tempo para minutos para facilitar a comparação
      const timeToMinutes = (time: string) => {
        const [hours, minutes] = time.split(':').map(Number);
        return hours * 60 + minutes;
      };
      
      return timeToMinutes(a.startTime) - timeToMinutes(b.startTime);
    });
  }, [scheduleItems]);

  // Adicionar um novo item
  const addMutation = useMutation({
    mutationFn: (data: ScheduleFormData) => 
      apiRequest(`/api/events/${eventId}/schedule`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/events', eventId, 'schedule'] });
      setIsAddModalOpen(false);
      toast({
        title: 'Atividade adicionada',
        description: 'A atividade foi adicionada ao cronograma com sucesso.',
      });
    },
    onError: (error) => {
      console.error('Erro ao adicionar atividade:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível adicionar a atividade. Tente novamente.',
        variant: 'destructive',
      });
    },
  });

  // Atualizar um item existente
  const updateMutation = useMutation({
    mutationFn: (data: ScheduleItem) => 
      apiRequest(`/api/schedule/${data.id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/events', eventId, 'schedule'] });
      setIsEditModalOpen(false);
      setSelectedItem(null);
      toast({
        title: 'Atividade atualizada',
        description: 'A atividade foi atualizada com sucesso.',
      });
    },
    onError: (error) => {
      console.error('Erro ao atualizar atividade:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar a atividade. Tente novamente.',
        variant: 'destructive',
      });
    },
  });

  // Excluir um item
  const deleteMutation = useMutation({
    mutationFn: (id: number) => 
      apiRequest(`/api/schedule/${id}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/events', eventId, 'schedule'] });
      toast({
        title: 'Atividade excluída',
        description: 'A atividade foi excluída do cronograma com sucesso.',
      });
    },
    onError: (error) => {
      console.error('Erro ao excluir atividade:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir a atividade. Tente novamente.',
        variant: 'destructive',
      });
    },
  });

  const handleAddItem = (data: ScheduleFormData) => {
    // O eventId é adicionado no backend através da URL, não precisamos incluir aqui
    addMutation.mutate(data);
  };

  const handleEditItem = (item: ScheduleItem) => {
    setSelectedItem(item);
    setIsEditModalOpen(true);
  };

  const handleUpdateItem = (data: ScheduleFormData) => {
    if (selectedItem) {
      updateMutation.mutate({ ...selectedItem, ...data });
    }
  };

  const handleDeleteItem = (id: number) => {
    deleteMutation.mutate(id);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
        <h2 className="text-xl font-semibold">Cronograma do Evento</h2>
        <Button 
          variant="default" 
          className="w-full sm:w-auto"
          onClick={() => setIsAddModalOpen(true)}
        >
          <i className="fas fa-plus mr-2"></i> Adicionar Atividade
        </Button>
      </div>
      
      <div className="bg-card rounded-lg border border-border p-6">
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <i className="fas fa-spinner fa-spin text-2xl text-primary"></i>
          </div>
        ) : sortedItems.length === 0 ? (
          <div className="text-center py-8">
            <i className="fas fa-calendar-day text-3xl text-muted-foreground/50 mb-3"></i>
            <h3 className="font-medium text-lg mb-2">Nenhuma atividade programada</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Adicione atividades ao cronograma para organizar o dia do evento
            </p>
            <Button 
              variant="default"
              onClick={() => setIsAddModalOpen(true)}
            >
              <i className="fas fa-plus mr-2"></i> Adicionar Primeira Atividade
            </Button>
          </div>
        ) : (
          <div className="border-l-2 border-primary/30 pl-4 space-y-8 relative py-4">
            {/* Título simples para o cronograma */}
            <h3 className="font-medium text-lg mb-6 flex items-center">
              <i className="fas fa-calendar-day text-primary mr-2"></i>
              Dia do Evento
            </h3>
            
            {/* Atividades do cronograma */}
            <div className="space-y-8">
              {sortedItems.map((item) => (
                <div key={item.id}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="absolute left-[-8px] w-4 h-4 rounded-full bg-primary"></div>
                      <span className="text-sm font-medium text-primary">{item.startTime.substring(0, 5)}</span>
                    </div>
                    <ScheduleItemActions 
                      item={item}
                      onEdit={handleEditItem}
                      onDelete={handleDeleteItem}
                    />
                  </div>
                  <div className="ml-5 bg-muted/30 p-3 rounded-lg border border-border mt-2">
                    <h4 className="font-medium">{item.title}</h4>
                    {item.description && (
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    )}
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      {item.location && (
                        <Badge variant="outline" className="text-xs">{item.location}</Badge>
                      )}
                      {item.responsibles && (
                        <Badge variant="outline" className="text-xs">{item.responsibles}</Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="absolute left-[-8px] bottom-0 w-4 h-4 rounded-full bg-primary/30"></div>
          </div>
        )}
      </div>
      
      {/* Modal para adicionar atividade */}
      <ScheduleItemForm
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddItem}
        title="Adicionar Atividade ao Cronograma"
        isSubmitting={addMutation.isPending}
      />
      
      {/* Modal para editar atividade */}
      {selectedItem && (
        <ScheduleItemForm
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedItem(null);
          }}
          onSubmit={handleUpdateItem}
          title="Editar Atividade"
          defaultValues={{
            title: selectedItem.title,
            description: selectedItem.description || '',
            startTime: selectedItem.startTime,
            location: selectedItem.location || '',
            responsibles: selectedItem.responsibles || '',
          }}
          isSubmitting={updateMutation.isPending}
        />
      )}
    </div>
  );
};