import React, { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { formatDate } from "@/lib/utils";
import { Star, MoreVertical, Copy, Trash2, Eye, Lock, Mail, ExternalLink, Search, Filter, Link, StarIcon } from "lucide-react";

interface FeedbackManagerProps {
  eventId: number;
}

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

interface Event {
  id: number;
  name: string;
  status: string;
  endDate: string | null;
}

export function FeedbackManager({ eventId }: FeedbackManagerProps) {
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [ratingFilter, setRatingFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [feedbackToDelete, setFeedbackToDelete] = useState<number | null>(null);
  const [selectedFeedback, setSelectedFeedback] = useState<EventFeedback | null>(null);

  // Função para copiar link
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Link copiado!",
        description: "O link foi copiado para a área de transferência.",
      });
    } catch (error) {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o link. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  // Buscar evento para verificar status
  const { data: event } = useQuery<Event>({
    queryKey: ['/api/events', eventId],
  });

  // Buscar feedbacks do evento
  const { data: feedbacks = [], isLoading: loadingFeedbacks, refetch } = useQuery<EventFeedback[]>({
    queryKey: ['/api/events', eventId, 'feedbacks'],
    queryFn: async () => {
      const response = await fetch(`/api/events/${eventId}/feedbacks`, {
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    },
    enabled: !!eventId
  });

  // Gerar link de feedback
  const generateLinkMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/events/${eventId}/generate-feedback-link`, { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return response.json();
    },
    onSuccess: (data: { feedbackUrl: string }) => {
      setGeneratedLink(data.feedbackUrl);
      toast({
        title: "Link gerado com sucesso!",
        description: "O link de feedback foi criado e está pronto para ser compartilhado.",
      });
    },
    onError: (error) => {
      console.error('Erro ao gerar link:', error);
      toast({
        title: "Erro ao gerar link",
        description: "Não foi possível gerar o link de feedback. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  // Deletar feedback
  const deleteFeedbackMutation = useMutation({
    mutationFn: async (feedbackId: number) => {
      const response = await apiRequest(`/api/events/${eventId}/feedbacks/${feedbackId}`, {
        method: 'DELETE',
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/events', eventId, 'feedbacks'] });
      toast({
        title: "Feedback excluído",
        description: "O feedback foi removido com sucesso.",
      });
      setFeedbackToDelete(null);
    },
    onError: () => {
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir o feedback. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  // Filtrar feedbacks
  const filteredFeedbacks = useMemo(() => {
    return feedbacks.filter(feedback => {
      const matchesSearch = searchTerm === "" || 
        feedback.comment.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (feedback.name && feedback.name.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesRating = ratingFilter === "all" || 
        feedback.rating.toString() === ratingFilter;

      const matchesType = typeFilter === "all" ||
        (typeFilter === "anonymous" && (feedback.isAnonymous || (!feedback.name && !feedback.email))) ||
        (typeFilter === "identified" && !feedback.isAnonymous && (feedback.name || feedback.email));

      return matchesSearch && matchesRating && matchesType;
    });
  }, [feedbacks, searchTerm, ratingFilter, typeFilter]);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        className={`w-4 h-4 ${i < rating ? "text-yellow-400 fill-current" : "text-gray-300"}`}
      />
    ));
  };

  const calculateStats = () => {
    if (feedbacks.length === 0) return { average: 0, total: 0, anonymousPercent: 0, distribution: {} };
    
    const total = feedbacks.length;
    const sum = feedbacks.reduce((acc, feedback) => acc + feedback.rating, 0);
    const average = sum / total;
    
    const anonymousCount = feedbacks.filter(f => f.isAnonymous || (!f.name && !f.email)).length;
    const anonymousPercent = (anonymousCount / total) * 100;
    
    const distribution = feedbacks.reduce((acc, feedback) => {
      acc[feedback.rating] = (acc[feedback.rating] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);
    
    return { average, total, anonymousPercent, distribution };
  };

  const stats = calculateStats();

  // Verificar se evento terminou
  const eventEnded = event?.status === 'completed' || 
    (event?.endDate && new Date(event.endDate) < new Date());

  if (loadingFeedbacks) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-xl font-semibold font-sora">Feedback pós-evento</h2>
          <p className="text-sm text-muted-foreground mt-1 font-work-sans">
            Colete e gerencie feedbacks dos participantes
          </p>
        </div>
        
        {eventEnded && (
          <Dialog open={showGenerateDialog} onOpenChange={setShowGenerateDialog}>
            <DialogTrigger asChild>
              <Button variant="default" className="w-full sm:w-auto">
                <Link className="w-4 h-4 mr-2" />
                Gerar Link de Feedback
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Gerar Link de Feedback</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Gere um link único para que os participantes possam enviar feedback sobre o evento.
                </p>
                
                {generatedLink ? (
                  <div className="space-y-3">
                    <Label>Link gerado:</Label>
                    <div className="flex gap-2">
                      <Input 
                        value={generatedLink} 
                        readOnly 
                        className="font-mono text-xs"
                      />
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => copyToClipboard(generatedLink)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => window.open(generatedLink, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Compartilhe este link com os participantes do evento para coletar feedbacks.
                    </p>
                  </div>
                ) : (
                  <div className="flex justify-center">
                    <Button 
                      onClick={() => generateLinkMutation.mutate()}
                      disabled={generateLinkMutation.isPending}
                      className="w-full"
                    >
                      {generateLinkMutation.isPending ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Gerando...
                        </>
                      ) : (
                        <>
                          <Link className="w-4 h-4 mr-2" />
                          Gerar Link
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Indicadores no topo */}
      {feedbacks.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground font-work-sans">
                Média geral de estrelas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold font-sora">{stats.average.toFixed(1)}</span>
                <div className="flex">
                  {renderStars(Math.round(stats.average))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground font-work-sans">
                Total de feedbacks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-sora">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground font-work-sans">
                % anônimos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-sora">{stats.anonymousPercent.toFixed(0)}%</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filtros e busca */}
      {feedbacks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="font-sora">Filtros e busca</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Buscar por nome ou comentário..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Select value={ratingFilter} onValueChange={setRatingFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filtrar por nota" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as notas</SelectItem>
                  <SelectItem value="5">5 estrelas</SelectItem>
                  <SelectItem value="4">4 estrelas</SelectItem>
                  <SelectItem value="3">3 estrelas</SelectItem>
                  <SelectItem value="2">2 estrelas</SelectItem>
                  <SelectItem value="1">1 estrela</SelectItem>
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filtrar por tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="anonymous">Anônimos</SelectItem>
                  <SelectItem value="identified">Identificados</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de Feedbacks */}
      <Card>
        <CardHeader>
          <CardTitle className="font-sora">
            Feedbacks Recebidos 
            {filteredFeedbacks.length !== feedbacks.length && (
              <span className="text-sm font-normal text-muted-foreground">
                ({filteredFeedbacks.length} de {feedbacks.length})
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredFeedbacks.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl text-muted-foreground/30 mb-4">💬</div>
              <h3 className="font-medium text-lg mb-2 font-sora">
                {feedbacks.length === 0 ? "Nenhum feedback recebido" : "Nenhum resultado encontrado"}
              </h3>
              <p className="text-sm text-muted-foreground mb-6 font-work-sans">
                {feedbacks.length === 0 
                  ? eventEnded 
                    ? "Gere um link de feedback e compartilhe com os participantes para começar a coletar avaliações."
                    : "O link de feedback estará disponível após o evento terminar."
                  : "Tente ajustar os filtros para encontrar os feedbacks desejados."
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredFeedbacks.map((feedback) => (
                <div key={feedback.id} className="border rounded-lg p-4 hover:shadow-md hover:border-gray-300 transition-all duration-200 bg-white">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div className="flex">
                        {renderStars(feedback.rating)}
                      </div>
                      <Badge variant="secondary" className="font-work-sans">
                        {feedback.rating}/5
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground font-work-sans">
                        {formatDate(feedback.createdAt)}
                      </span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setSelectedFeedback(feedback)}>
                            <Eye className="w-4 h-4 mr-2" />
                            Ver detalhes
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => copyToClipboard(feedback.comment)}>
                            <Copy className="w-4 h-4 mr-2" />
                            Copiar comentário
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => setFeedbackToDelete(feedback.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Excluir feedback
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  
                  <div className="mb-3 flex items-center gap-2">
                    {feedback.isAnonymous || (!feedback.name && !feedback.email) ? (
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Lock className="w-4 h-4" />
                        <span className="text-sm font-work-sans">Anônimo</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium font-work-sans">
                          {feedback.name || "Participante"}
                        </span>
                        {feedback.email && (
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Mail className="w-3 h-3" />
                            <span className="text-xs font-work-sans">{feedback.email}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <p className="text-sm text-muted-foreground leading-relaxed font-work-sans">
                    {feedback.comment}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de detalhes */}
      <Dialog open={!!selectedFeedback} onOpenChange={() => setSelectedFeedback(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Detalhes do Feedback</DialogTitle>
          </DialogHeader>
          {selectedFeedback && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex">
                  {renderStars(selectedFeedback.rating)}
                </div>
                <Badge variant="secondary">
                  {selectedFeedback.rating}/5
                </Badge>
              </div>
              
              <div className="space-y-2">
                <Label>Participante:</Label>
                <div className="flex items-center gap-2">
                  {selectedFeedback.isAnonymous || (!selectedFeedback.name && !selectedFeedback.email) ? (
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Lock className="w-4 h-4" />
                      <span>Anônimo</span>
                    </div>
                  ) : (
                    <div>
                      <p className="font-medium">{selectedFeedback.name || "Nome não informado"}</p>
                      {selectedFeedback.email && (
                        <p className="text-sm text-muted-foreground">{selectedFeedback.email}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Comentário:</Label>
                <p className="text-sm bg-gray-50 p-3 rounded-md">
                  {selectedFeedback.comment}
                </p>
              </div>
              
              <div className="space-y-2">
                <Label>Data de envio:</Label>
                <p className="text-sm text-muted-foreground">
                  {formatDate(selectedFeedback.createdAt)}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de confirmação de exclusão */}
      <AlertDialog open={!!feedbackToDelete} onOpenChange={() => setFeedbackToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir feedback</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este feedback? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => feedbackToDelete && deleteFeedbackMutation.mutate(feedbackToDelete)}
              className="bg-red-600 hover:bg-red-700"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}