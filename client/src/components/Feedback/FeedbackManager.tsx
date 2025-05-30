import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { formatDate } from "@/lib/utils";

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
  createdAt: string;
}

export function FeedbackManager({ eventId }: FeedbackManagerProps) {
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);

  // Buscar feedbacks do evento
  const { data: feedbacks = [], isLoading: loadingFeedbacks } = useQuery<EventFeedback[]>({
    queryKey: ['/api/events', eventId, 'feedbacks'],
  });

  // Gerar link de feedback
  const generateLinkMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest(`/api/events/${eventId}/generate-feedback-link`, { method: 'POST' });
      return response;
    },
    onSuccess: (data: { feedbackUrl: string }) => {
      console.log('Resposta do servidor:', data);
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

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Link copiado!",
        description: "O link foi copiado para a área de transferência.",
      });
    } catch (err) {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o link. Tente selecionar e copiar manualmente.",
        variant: "destructive",
      });
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={i < rating ? "text-yellow-400" : "text-gray-300"}>
        ★
      </span>
    ));
  };

  const calculateStats = () => {
    if (feedbacks.length === 0) return { average: 0, total: 0, distribution: {} };
    
    const total = feedbacks.length;
    const sum = feedbacks.reduce((acc, feedback) => acc + feedback.rating, 0);
    const average = sum / total;
    
    const distribution = feedbacks.reduce((acc, feedback) => {
      acc[feedback.rating] = (acc[feedback.rating] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);
    
    return { average, total, distribution };
  };

  const stats = calculateStats();

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
          <h2 className="text-xl font-semibold">Feedback pós-evento</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Colete e gerencie feedbacks dos participantes
          </p>
        </div>
        <Dialog open={showGenerateDialog} onOpenChange={setShowGenerateDialog}>
          <DialogTrigger asChild>
            <Button variant="default" className="w-full sm:w-auto">
              <i className="fas fa-link mr-2"></i>
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
                      <i className="fas fa-copy"></i>
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
                        <i className="fas fa-spinner fa-spin mr-2"></i>
                        Gerando...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-magic mr-2"></i>
                        Gerar Link
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Estatísticas */}
      {feedbacks.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Avaliação Média
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">{stats.average.toFixed(1)}</span>
                <div className="flex">
                  {renderStars(Math.round(stats.average))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total de Feedbacks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Distribuição
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {[5, 4, 3, 2, 1].map(rating => (
                  <div key={rating} className="flex items-center gap-2 text-sm">
                    <span className="w-8">{rating}★</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-yellow-400 h-2 rounded-full"
                        style={{ 
                          width: `${stats.total > 0 ? ((stats.distribution[rating] || 0) / stats.total) * 100 : 0}%` 
                        }}
                      ></div>
                    </div>
                    <span className="w-8 text-right">{stats.distribution[rating] || 0}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Lista de Feedbacks */}
      <Card>
        <CardHeader>
          <CardTitle>Feedbacks Recebidos</CardTitle>
        </CardHeader>
        <CardContent>
          {feedbacks.length === 0 ? (
            <div className="text-center py-12">
              <i className="fas fa-comment-alt text-4xl text-muted-foreground/30 mb-4"></i>
              <h3 className="font-medium text-lg mb-2">Nenhum feedback recebido</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Gere um link de feedback e compartilhe com os participantes para começar a coletar avaliações.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {feedbacks.map((feedback) => (
                <div key={feedback.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div className="flex">
                        {renderStars(feedback.rating)}
                      </div>
                      <Badge variant="secondary">
                        {feedback.rating}/5
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(feedback.createdAt)}
                    </span>
                  </div>
                  
                  {(feedback.name || feedback.email) && (
                    <div className="mb-3">
                      <p className="text-sm font-medium">
                        {feedback.name || "Participante"}
                        {feedback.email && (
                          <span className="text-muted-foreground font-normal">
                            {" "}({feedback.email})
                          </span>
                        )}
                      </p>
                    </div>
                  )}
                  
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feedback.comment}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}