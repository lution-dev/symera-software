import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Star, MessageSquare, Copy, Share2, Calendar, BarChart3, TrendingUp, Users } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface FeedbackManagerProps {
  eventId: number;
}

const StarRating = ({ rating, size = 16 }: { rating: number; size?: number }) => {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={size}
          className={`${
            star <= rating
              ? 'fill-yellow-400 text-yellow-400'
              : 'text-gray-300'
          }`}
        />
      ))}
    </div>
  );
};

export default function FeedbackManager({ eventId }: FeedbackManagerProps) {
  const { toast } = useToast();
  const [copiedLink, setCopiedLink] = useState(false);

  // Buscar feedbacks do evento
  const { data: feedbackData, isLoading, error } = useQuery({
    queryKey: ['event-feedbacks', eventId],
    queryFn: async () => {
      const response = await fetch(`/api/events/${eventId}/feedbacks`);
      if (!response.ok) {
        throw new Error('Erro ao carregar feedbacks');
      }
      return response.json();
    },
  });

  const feedbacks = feedbackData?.feedbacks || [];
  const stats = feedbackData?.stats || {
    total_feedbacks: 0,
    average_rating: 0,
    positive_feedbacks: 0,
    negative_feedbacks: 0
  };

  // Gerar link público de feedback
  const publicFeedbackUrl = `${window.location.origin}/feedback/${eventId}`;

  // Função para copiar link
  const copyFeedbackLink = () => {
    navigator.clipboard.writeText(publicFeedbackUrl);
    setCopiedLink(true);
    toast({
      title: "Link copiado!",
      description: "O link de feedback foi copiado para a área de transferência.",
    });
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Função para compartilhar via WhatsApp
  const shareViaWhatsApp = () => {
    const message = encodeURIComponent(
      `Olá! Sua opinião é muito importante para nós. Por favor, avalie nossa experiência no evento:\n\n${publicFeedbackUrl}`
    );
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse bg-gray-200 h-32 rounded-lg"></div>
        <div className="animate-pulse bg-gray-200 h-48 rounded-lg"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-red-600">
            Erro ao carregar feedbacks. Tente novamente.
          </div>
        </CardContent>
      </Card>
    );
  }

  const averageRating = parseFloat(stats.average_rating) || 0;
  const totalFeedbacks = parseInt(stats.total_feedbacks) || 0;
  const positiveFeedbacks = parseInt(stats.positive_feedbacks) || 0;
  const negativeFeedbacks = parseInt(stats.negative_feedbacks) || 0;

  return (
    <div className="space-y-6">
      {/* Seção de compartilhamento do link */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            Link Público de Feedback
          </CardTitle>
          <CardDescription>
            Compartilhe este link com os participantes para coletar feedbacks sobre o evento
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
            <code className="flex-1 text-sm text-gray-700 break-all">
              {publicFeedbackUrl}
            </code>
            <Button
              size="sm"
              variant="outline"
              onClick={copyFeedbackLink}
              className="shrink-0"
            >
              <Copy className="w-4 h-4 mr-1" />
              {copiedLink ? "Copiado!" : "Copiar"}
            </Button>
          </div>
          
          <div className="flex gap-2">
            <Button onClick={shareViaWhatsApp} className="flex-1" variant="default">
              <MessageSquare className="w-4 h-4 mr-2" />
              Enviar por WhatsApp
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas */}
      {totalFeedbacks > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Estatísticas de Feedback
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-blue-600">{totalFeedbacks}</div>
                <div className="text-sm text-gray-600">Total de Feedbacks</div>
              </div>
              
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Star className="w-5 h-5 text-yellow-600 fill-yellow-400" />
                </div>
                <div className="text-2xl font-bold text-yellow-600">
                  {averageRating.toFixed(1)}
                </div>
                <div className="text-sm text-gray-600">Média de Avaliação</div>
              </div>
              
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <div className="text-2xl font-bold text-green-600">{positiveFeedbacks}</div>
                <div className="text-sm text-gray-600">Feedbacks Positivos</div>
              </div>
              
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-red-600 rotate-180" />
                </div>
                <div className="text-2xl font-bold text-red-600">{negativeFeedbacks}</div>
                <div className="text-sm text-gray-600">Feedbacks Negativos</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de feedbacks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Feedbacks Recebidos ({totalFeedbacks})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {feedbacks.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="font-medium text-lg mb-2">Nenhum feedback recebido</h3>
              <p className="text-sm text-gray-600 mb-4">
                Compartilhe o link de feedback com os participantes para começar a coletar avaliações.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {feedbacks.map((feedback: any, index: number) => (
                <div key={feedback.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full flex items-center justify-center text-white font-semibold">
                        {feedback.name ? feedback.name.charAt(0).toUpperCase() : 'A'}
                      </div>
                      <div>
                        <div className="font-medium">
                          {feedback.name || 'Anônimo'}
                          {feedback.anonymous && (
                            <Badge variant="secondary" className="ml-2 text-xs">
                              Anônimo
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="w-3 h-3" />
                          {format(new Date(feedback.created_at), "d 'de' MMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
                        </div>
                      </div>
                    </div>
                    <StarRating rating={feedback.rating} size={18} />
                  </div>
                  
                  <p className="text-gray-700 leading-relaxed">{feedback.comment}</p>
                  
                  {index < feedbacks.length - 1 && <Separator className="mt-4" />}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}