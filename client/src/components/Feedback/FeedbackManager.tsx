import { useState, useMemo } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Share2, ExternalLink, Copy, Download, Star, Trash2, Filter, Search, MessageCircle, Users, BarChart3, Plus } from 'lucide-react';

interface EventFeedback {
  id: number;
  eventId: number;
  feedbackId: string;
  name: string | null;
  email: string | null;
  rating: number;
  comment: string;
  isAnonymous: boolean | null;
  createdAt: string;
}

interface FeedbackManagerProps {
  eventId: number;
}

export function FeedbackManager({ eventId }: FeedbackManagerProps) {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [generatedLink, setGeneratedLink] = useState('');
  const [showGenerateModal, setShowGenerateModal] = useState(false);

  // Buscar evento
  const { data: event } = useQuery({
    queryKey: ['/api/events', eventId],
    queryFn: () => apiRequest(`/api/events/${eventId}`)
  });

  // Buscar feedbacks
  const { data: feedbacksData = [], isLoading: feedbacksLoading, refetch: refetchFeedbacks } = useQuery({
    queryKey: ['/api/events', eventId, 'feedbacks'],
    queryFn: () => apiRequest(`/api/events/${eventId}/feedbacks`)
  });

  // Buscar link existente
  const { data: linkData, refetch: refetchLink } = useQuery({
    queryKey: ['/api/events', eventId, 'feedback-link'],
    queryFn: () => apiRequest(`/api/events/${eventId}/feedback-link`)
  });

  // Mutation para gerar link de feedback
  const generateLinkMutation = useMutation({
    mutationFn: () => apiRequest(`/api/events/${eventId}/generate-feedback-link`, { method: 'POST' }),
    onSuccess: (data: any) => {
      let newUrl = data.feedbackUrl;
      if (newUrl && !newUrl.startsWith('http')) {
        newUrl = `https://${newUrl}`;
      }
      setGeneratedLink(newUrl);
      setShowGenerateModal(false);
      
      // Invalidar TODOS os caches relacionados
      queryClient.invalidateQueries({ queryKey: ['/api/events', eventId] });
      queryClient.invalidateQueries({ queryKey: ['/api/events', eventId, 'feedback-link'] });
      refetchLink();
      
      toast({
        title: "Link gerado com sucesso!",
        description: "O link de feedback está pronto para ser compartilhado."
      });
    },
    onError: () => {
      toast({
        title: "Erro ao gerar link",
        description: "Não foi possível gerar o link de feedback.",
        variant: "destructive"
      });
    }
  });

  // Mutation para deletar feedback
  const deleteFeedbackMutation = useMutation({
    mutationFn: (feedbackId: number) => apiRequest(`/api/events/${eventId}/feedbacks/${feedbackId}`, { method: 'DELETE' }),
    onSuccess: () => {
      refetchFeedbacks();
      queryClient.invalidateQueries({ queryKey: ['/api/events', eventId, 'feedbacks'] });
      toast({
        title: "Feedback excluído",
        description: "O feedback foi removido com sucesso."
      });
    },
    onError: () => {
      toast({
        title: "Erro ao excluir feedback",
        description: "Não foi possível excluir o feedback.",
        variant: "destructive"
      });
    }
  });

  // Garantir que feedbacks seja sempre um array
  const feedbacks: EventFeedback[] = Array.isArray(feedbacksData) ? feedbacksData : [];

  // Verificar se o evento terminou
  const eventEnded = useMemo(() => {
    if (!event || typeof event !== 'object') return false;
    const eventData = event as any;
    if (!eventData.endDate) return false;
    const endDate = new Date(eventData.endDate);
    const now = new Date();
    return endDate < now || eventData.status === 'completed';
  }, [event]);

  // Estatísticas dos feedbacks
  const stats = useMemo(() => {
    if (feedbacks.length === 0) {
      return { total: 0, average: 0, anonymousPercent: 0 };
    }

    const total = feedbacks.length;
    const sum = feedbacks.reduce((acc: number, feedback: EventFeedback) => acc + feedback.rating, 0);
    const average = sum / total;
    const anonymousCount = feedbacks.filter((feedback: EventFeedback) => 
      feedback.isAnonymous || (!feedback.name && !feedback.email)
    ).length;
    const anonymousPercent = (anonymousCount / total) * 100;

    return { total, average, anonymousPercent };
  }, [feedbacks]);

  // Filtrar feedbacks
  const filteredFeedbacks = useMemo(() => {
    return feedbacks.filter((feedback: EventFeedback) => {
      // Filtro de busca
      const searchMatch = !searchTerm || 
        feedback.comment.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (feedback.name && feedback.name.toLowerCase().includes(searchTerm.toLowerCase()));

      // Filtro de rating
      const ratingMatch = ratingFilter === "all" || feedback.rating.toString() === ratingFilter;

      // Filtro de tipo
      let typeMatch = true;
      if (typeFilter === "anonymous") {
        typeMatch = feedback.isAnonymous || (!feedback.name && !feedback.email);
      } else if (typeFilter === "identified") {
        typeMatch = !feedback.isAnonymous && (feedback.name || feedback.email);
      }

      return searchMatch && ratingMatch && typeMatch;
    });
  }, [feedbacks, searchTerm, ratingFilter, typeFilter]);

  // Renderizar estrelas
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${index < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copiado!",
        description: "Link copiado para a área de transferência."
      });
    } catch (err) {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o link.",
        variant: "destructive"
      });
    }
  };

  const shareLink = async (url: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Link de Feedback - Symera',
          text: 'Compartilhe seu feedback sobre o evento',
          url: url,
        });
      } catch (err) {
        copyToClipboard(url);
      }
    } else {
      copyToClipboard(url);
    }
  };

  const downloadCSV = () => {
    const headers = ['Data', 'Nome', 'Email', 'Avaliação', 'Comentário', 'Anônimo'];
    const csvContent = [
      headers.join(','),
      ...feedbacks.map(feedback => [
        formatDate(feedback.createdAt),
        feedback.name || 'N/A',
        feedback.email || 'N/A',
        feedback.rating,
        `"${feedback.comment.replace(/"/g, '""')}"`,
        feedback.isAnonymous ? 'Sim' : 'Não'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `feedbacks_evento_${eventId}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Obter URL do link - forçar detecção
  const eventFeedbackUrl = (event as any)?.feedbackUrl;
  const linkFeedbackUrl = (linkData as any)?.feedbackUrl;
  
  // Debug para ver o que está chegando
  console.log('DEBUG - eventFeedbackUrl:', eventFeedbackUrl);
  console.log('DEBUG - linkFeedbackUrl:', linkFeedbackUrl);
  console.log('DEBUG - generatedLink:', generatedLink);
  
  // Detectar URL válida - qualquer uma que exista
  const currentFeedbackUrl = eventFeedbackUrl || linkFeedbackUrl || generatedLink;
  
  // Garantir protocolo HTTPS
  const finalFeedbackUrl = currentFeedbackUrl && !currentFeedbackUrl.startsWith('http') 
    ? `https://${currentFeedbackUrl}` 
    : currentFeedbackUrl;
  
  console.log('DEBUG - finalFeedbackUrl:', finalFeedbackUrl);
  console.log('DEBUG - !!finalFeedbackUrl:', !!finalFeedbackUrl);

  return (
    <div className="space-y-6">
      {/* Header com botões de ação */}
      <div className="flex flex-col gap-4 p-4 bg-card rounded-lg border">
        <div>
          <h2 className="text-xl font-semibold">Feedback Pós-Evento</h2>
          <p className="text-sm text-muted-foreground">Gerencie e visualize os feedbacks do seu evento</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          {!finalFeedbackUrl ? (
            /* Botão Gerar Link - visível apenas quando não há link */
            <Dialog open={showGenerateModal} onOpenChange={setShowGenerateModal}>
              <DialogTrigger asChild>
                <Button className="w-full sm:w-auto">
                  <Plus className="w-4 h-4 mr-2" />
                  Gerar Link de Feedback
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Gerar Link de Feedback</DialogTitle>
                  <DialogDescription>
                    Crie um link público para que os participantes possam deixar seus feedbacks sobre o evento.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    O link será válido permanentemente e pode ser compartilhado com todos os participantes do evento.
                  </p>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowGenerateModal(false)}
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={() => generateLinkMutation.mutate()}
                      disabled={generateLinkMutation.isPending}
                    >
                      {generateLinkMutation.isPending ? 'Gerando...' : 'Gerar Link'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          ) : (
            /* Botões de ação - aparecem após gerar link */
            <>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => shareLink(finalFeedbackUrl)}
                className="flex-1 sm:flex-none"
              >
                <Share2 className="w-4 h-4 mr-1" />
                Compartilhar
              </Button>

              <Button 
                variant="outline" 
                size="sm"
                onClick={() => copyToClipboard(finalFeedbackUrl)}
                className="flex-1 sm:flex-none"
              >
                <Copy className="w-4 h-4 mr-1" />
                Copiar
              </Button>

              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.open(finalFeedbackUrl, '_blank')}
                className="flex-1 sm:flex-none"
              >
                <ExternalLink className="w-4 h-4 mr-1" />
                Abrir
              </Button>

              <Button 
                variant="outline" 
                size="sm"
                onClick={downloadCSV}
                disabled={feedbacks.length === 0}
                className="flex-1 sm:flex-none"
              >
                <Download className="w-4 h-4 mr-1" />
                Exportar
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Feedbacks</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Feedbacks recebidos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avaliação Média</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.total > 0 ? stats.average.toFixed(1) : '0.0'}
            </div>
            <div className="flex items-center mt-1">
              {stats.total > 0 ? renderStars(Math.round(stats.average)) : renderStars(0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Feedbacks Anônimos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.total > 0 ? `${stats.anonymousPercent.toFixed(0)}%` : '0%'}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.total > 0 ? `${Math.round((stats.anonymousPercent / 100) * stats.total)} de ${stats.total}` : 'Nenhum feedback anônimo'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Link atual */}
      {currentFeedbackUrl && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Link de Feedback Ativo</CardTitle>
            <CardDescription>
              Compartilhe este link com os participantes do evento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-md">
              <code className="flex-1 text-sm break-all">{currentFeedbackUrl}</code>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(currentFeedbackUrl)}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filtros */}
      {feedbacks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nome ou comentário..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              
              <Select value={ratingFilter} onValueChange={setRatingFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filtrar por avaliação" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as avaliações</SelectItem>
                  <SelectItem value="5">5 estrelas</SelectItem>
                  <SelectItem value="4">4 estrelas</SelectItem>
                  <SelectItem value="3">3 estrelas</SelectItem>
                  <SelectItem value="2">2 estrelas</SelectItem>
                  <SelectItem value="1">1 estrela</SelectItem>
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filtrar por tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  <SelectItem value="identified">Identificados</SelectItem>
                  <SelectItem value="anonymous">Anônimos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de Feedbacks */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Feedbacks Recebidos</CardTitle>
          <CardDescription>
            {filteredFeedbacks.length} de {feedbacks.length} feedbacks
          </CardDescription>
        </CardHeader>
        <CardContent>
          {feedbacksLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Carregando feedbacks...</p>
            </div>
          ) : filteredFeedbacks.length === 0 ? (
            <div className="text-center py-8">
              <MessageCircle className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-[#fff]">
                {feedbacks.length === 0 ? 'Nenhum feedback recebido' : 'Nenhum feedback encontrado'}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {feedbacks.length === 0 
                  ? 'Os feedbacks aparecerão aqui conforme forem enviados.'
                  : 'Tente ajustar os filtros para encontrar feedbacks.'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredFeedbacks.map((feedback: EventFeedback) => (
                <div
                  key={feedback.id}
                  className="border rounded-lg p-4 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center">
                          {renderStars(feedback.rating)}
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {feedback.rating}/5
                        </Badge>
                        {(feedback.isAnonymous || (!feedback.name && !feedback.email)) && (
                          <Badge variant="outline" className="text-xs">
                            Anônimo
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-gray-900 mb-2">{feedback.comment}</p>
                      
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div>
                          {feedback.name ? (
                            <span className="font-medium">{feedback.name}</span>
                          ) : (
                            <span className="italic">Usuário anônimo</span>
                          )}
                          {feedback.email && (
                            <span className="ml-2">({feedback.email})</span>
                          )}
                        </div>
                        <span>{formatDate(feedback.createdAt)}</span>
                      </div>
                    </div>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Excluir Feedback</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja excluir este feedback? Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteFeedbackMutation.mutate(feedback.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}