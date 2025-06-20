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

  // Buscar dados do evento para obter as datas
  const { data: event } = useQuery({
    queryKey: ['/api/events', eventId],
    queryFn: async () => {
      const res = await fetch(`/api/events/${eventId}`, {
        credentials: 'include'
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      return res.json();
    }
  });

  // Buscar itens do cronograma da API
  const { data: scheduleItems, isLoading, error } = useQuery({
    queryKey: ['/api/events', eventId, 'schedule'],
    queryFn: async () => {
      const res = await fetch(`/api/events/${eventId}/schedule`, {
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      
      const data = await res.json();
      console.log('Cronograma - dados recebidos diretamente:', data);
      return data;
    }
  });

  // Debug: log dos dados recebidos
  useEffect(() => {
    console.log('ScheduleList Debug - EventId:', eventId);
    console.log('ScheduleList Debug - IsLoading:', isLoading);
    console.log('ScheduleList Debug - Error:', error);
    console.log('ScheduleList Debug - ScheduleItems:', scheduleItems);
    console.log('ScheduleList Debug - ScheduleItems Type:', typeof scheduleItems);
    console.log('ScheduleList Debug - ScheduleItems Array?:', Array.isArray(scheduleItems));
  }, [eventId, isLoading, error, scheduleItems]);

  // Ordenar itens por horário
  const sortedItems = React.useMemo(() => {
    console.log('SortedItems - Raw scheduleItems:', scheduleItems);
    console.log('SortedItems - Type:', typeof scheduleItems);
    console.log('SortedItems - Is Array:', Array.isArray(scheduleItems));
    
    // Verificar se é um array ou se precisa ser extraído de uma propriedade
    let items = scheduleItems;
    if (scheduleItems && typeof scheduleItems === 'object' && !Array.isArray(scheduleItems)) {
      // Se for um objeto, procurar pela propriedade que contém o array
      if (scheduleItems.data && Array.isArray(scheduleItems.data)) {
        items = scheduleItems.data;
      } else if (scheduleItems.items && Array.isArray(scheduleItems.items)) {
        items = scheduleItems.items;
      } else {
        // Converter object para array se tiver propriedades numéricas
        const keys = Object.keys(scheduleItems);
        if (keys.length > 0 && keys.some(key => !isNaN(Number(key)))) {
          items = Object.values(scheduleItems);
        }
      }
    }
    
    console.log('SortedItems - Processed items:', items);
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      console.log('SortedItems - Returning empty array');
      return [];
    }
    
    const sorted = [...items].sort((a, b) => {
      // Primeiro ordenar por data (se existir)
      if (a.eventDate && b.eventDate) {
        const dateA = new Date(a.eventDate);
        const dateB = new Date(b.eventDate);
        if (dateA.getTime() !== dateB.getTime()) {
          return dateA.getTime() - dateB.getTime();
        }
      }
      
      // Se as datas forem iguais ou não existirem, ordenar por horário
      const timeToMinutes = (time: string) => {
        const [hours, minutes] = time.split(':').map(Number);
        return hours * 60 + minutes;
      };
      
      return timeToMinutes(a.startTime) - timeToMinutes(b.startTime);
    });
    
    console.log('SortedItems - Final sorted items:', sorted);
    return sorted;
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
            {/* Título do cronograma */}
            <h3 className="font-medium text-lg mb-6 flex items-center">
              <i className="fas fa-calendar-day text-primary mr-2"></i>
              {event && event.startDate !== event.endDate ? 'Cronograma Multi-dias' : 'Cronograma do Evento'}
            </h3>
            
            {/* Atividades do cronograma */}
            <div className="space-y-8">
              {sortedItems.map((item) => (
                <div key={item.id}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="absolute left-[-8px] w-4 h-4 rounded-full bg-primary"></div>
                      <div className="flex items-center space-x-2">
                        {/* Mostrar data se evento durar mais de 1 dia e item tiver data específica */}
                        {event && event.startDate !== event.endDate && item.eventDate && (
                          <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                            {new Date(item.eventDate).toLocaleDateString('pt-BR', { 
                              day: '2-digit', 
                              month: '2-digit' 
                            })}
                          </span>
                        )}
                        <span className="text-sm font-medium text-primary">{item.startTime.substring(0, 5)}</span>
                      </div>
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
        eventStartDate={event?.startDate ? new Date(event.startDate).toISOString().split('T')[0] : undefined}
        eventEndDate={event?.endDate ? new Date(event.endDate).toISOString().split('T')[0] : undefined}
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
            eventDate: selectedItem.eventDate ? new Date(selectedItem.eventDate).toISOString().split('T')[0] : '',
            startTime: selectedItem.startTime,
            location: selectedItem.location || '',
            responsibles: selectedItem.responsibles || '',
          }}
          isSubmitting={updateMutation.isPending}
          eventStartDate={event?.startDate ? new Date(event.startDate).toISOString().split('T')[0] : undefined}
          eventEndDate={event?.endDate ? new Date(event.endDate).toISOString().split('T')[0] : undefined}
        />
      )}
    </div>
  );
};