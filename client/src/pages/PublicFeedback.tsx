import { useState } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { Star, Calendar, MapPin, MessageSquare, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const feedbackSchema = z.object({
  name: z.string().optional(),
  rating: z.number().min(1, "Selecione uma avaliação").max(5, "Avaliação máxima é 5 estrelas"),
  comment: z.string().min(1, "Comentário é obrigatório").min(10, "Comentário deve ter pelo menos 10 caracteres"),
});

type FeedbackForm = z.infer<typeof feedbackSchema>;

const StarRating = ({ rating, onRatingChange, size = 24 }: { 
  rating: number; 
  onRatingChange: (rating: number) => void;
  size?: number;
}) => {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onRatingChange(star)}
          className="transition-colors hover:scale-110"
        >
          <Star
            size={size}
            className={`${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300 hover:text-yellow-300'
            }`}
          />
        </button>
      ))}
    </div>
  );
};

export default function PublicFeedback() {
  const { eventId } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<FeedbackForm>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      name: '',
      rating: 0,
      comment: '',
    },
  });

  // Buscar dados públicos do evento
  const { data: event, isLoading: eventLoading, error: eventError } = useQuery({
    queryKey: ['public-event', eventId],
    queryFn: async () => {
      const response = await fetch(`/api/feedback/${eventId}/event`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Evento não encontrado');
        }
        throw new Error('Erro ao carregar dados do evento');
      }
      return response.json();
    },
  });

  // Mutation para enviar feedback
  const feedbackMutation = useMutation({
    mutationFn: async (data: FeedbackForm) => {
      const response = await fetch(`/api/feedback/${eventId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao enviar feedback');
      }
      
      return response.json();
    },
    onSuccess: () => {
      setIsSubmitted(true);
      toast({
        title: "Feedback enviado!",
        description: "Obrigado por compartilhar sua opinião conosco.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao enviar feedback",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FeedbackForm) => {
    feedbackMutation.mutate(data);
  };

  if (eventLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (eventError || !event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-red-600">Evento não encontrado</CardTitle>
            <CardDescription>
              O evento que você está procurando não existe ou não está mais disponível para feedback.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-green-600">Feedback Enviado!</CardTitle>
            <CardDescription>
              Obrigado por compartilhar sua experiência sobre o evento "{event.name}". 
              Seu feedback é muito importante para nós!
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const eventDate = new Date(event.startDate);
  const formattedDate = format(eventDate, "d 'de' MMMM 'de' yyyy", { locale: ptBR });

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      {/* Header com gradiente */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-2">
            <MessageSquare className="w-8 h-8" />
            <h1 className="text-2xl font-bold font-sora">Feedback do Evento</h1>
          </div>
          <p className="text-purple-100">Powered by Symera</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Card com informações do evento */}
        <Card className="mb-8 overflow-hidden">
          {event.coverImageUrl && (
            <div className="h-48 bg-gradient-to-r from-purple-400 to-blue-400 relative">
              <img 
                src={event.coverImageUrl} 
                alt={event.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-20"></div>
            </div>
          )}
          
          <CardHeader>
            <CardTitle className="text-2xl font-sora text-gray-800">{event.name}</CardTitle>
            <div className="flex flex-col gap-2 text-gray-600">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{formattedDate}</span>
                {event.startTime && <span>às {event.startTime}</span>}
              </div>
              {event.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{event.location}</span>
                </div>
              )}
            </div>
            {event.description && (
              <CardDescription className="text-gray-700 mt-3">
                {event.description}
              </CardDescription>
            )}
          </CardHeader>
        </Card>

        {/* Formulário de feedback */}
        <Card>
          <CardHeader>
            <CardTitle className="font-sora">Como foi sua experiência?</CardTitle>
            <CardDescription>
              Queremos saber sua opinião sobre este evento. Seu feedback nos ajuda a melhorar!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                
                {/* Nome (opcional) */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome (opcional)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Digite seu nome ou deixe em branco para feedback anônimo"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Avaliação por estrelas */}
                <FormField
                  control={form.control}
                  name="rating"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Avaliação geral *</FormLabel>
                      <FormControl>
                        <div className="flex flex-col gap-2">
                          <StarRating
                            rating={field.value}
                            onRatingChange={field.onChange}
                            size={32}
                          />
                          <p className="text-sm text-gray-600">
                            {field.value === 0 && "Clique nas estrelas para avaliar"}
                            {field.value === 1 && "Muito ruim"}
                            {field.value === 2 && "Ruim"}
                            {field.value === 3 && "Regular"}
                            {field.value === 4 && "Bom"}
                            {field.value === 5 && "Excelente"}
                          </p>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Comentário */}
                <FormField
                  control={form.control}
                  name="comment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Comentário *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Conte-nos sobre sua experiência no evento. O que você mais gostou? O que poderia ser melhorado?"
                          className="min-h-[120px] resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  disabled={feedbackMutation.isPending}
                >
                  {feedbackMutation.isPending ? "Enviando..." : "Enviar Feedback"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <div className="text-center mt-8 text-gray-500 text-sm">
          <p>Powered by <span className="font-semibold text-purple-600">Symera</span></p>
        </div>
      </div>
    </div>
  );
}