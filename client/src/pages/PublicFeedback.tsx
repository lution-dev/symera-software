import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { Star, Calendar, MapPin, MessageSquare, CheckCircle, Clock } from 'lucide-react';
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
                : 'text-gray-400 hover:text-yellow-300'
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

  // Marcar que o usuário veio de uma rota pública
  useEffect(() => {
    sessionStorage.setItem('cameFromPublicRoute', 'true');
  }, []);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<FeedbackForm>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      name: '',
      rating: 0,
      comment: '',
    },
  });

  const rating = watch('rating');

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
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (eventError) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800 rounded-lg shadow-xl p-8 w-full max-w-md text-center">
          <div className="text-red-400 text-xl font-bold mb-4" style={{ fontFamily: 'Sora, sans-serif' }}>
            Evento não encontrado
          </div>
          <p className="text-gray-300" style={{ fontFamily: 'Work Sans, sans-serif' }}>
            O evento que você está procurando não existe ou não está mais disponível.
          </p>
        </div>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800 rounded-lg shadow-xl p-8 w-full max-w-md text-center">
          <div className="mx-auto w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
          <h1 className="text-green-400 text-xl font-bold mb-4" style={{ fontFamily: 'Sora, sans-serif' }}>
            Feedback Enviado!
          </h1>
          <p className="text-gray-300 mb-6" style={{ fontFamily: 'Work Sans, sans-serif' }}>
            Obrigado por compartilhar sua experiência sobre o evento "{event.name}". 
            Seu feedback é muito importante para nós!
          </p>
          <div className="text-center text-gray-500 text-sm" style={{ fontFamily: 'Work Sans, sans-serif' }}>
            Powered by <span className="font-semibold text-orange-400">Symera</span>
          </div>
        </div>
      </div>
    );
  }

  const eventDate = new Date(event.startDate);
  const formattedDate = format(eventDate, "d 'de' MMMM 'de' yyyy", { locale: ptBR });

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header com gradiente oficial da Symera */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <MessageSquare className="w-10 h-10" />
              <h1 className="text-3xl font-bold" style={{ fontFamily: 'Sora, sans-serif' }}>
                Feedback do Evento
              </h1>
            </div>
            <p className="text-orange-100" style={{ fontFamily: 'Work Sans, sans-serif' }}>
              Powered by Symera
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Card com informações do evento */}
        <div className="bg-gray-800 rounded-lg shadow-xl mb-6 overflow-hidden">
          {/* Imagem de capa do evento */}
          {event.coverImageUrl && (
            <div className="w-full h-64 bg-gray-700 flex items-center justify-center">
              <img 
                src={event.coverImageUrl} 
                alt={event.name}
                className="w-full h-full object-cover rounded-t-lg"
              />
            </div>
          )}
          
          <div className="p-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-4 text-white" style={{ fontFamily: 'Sora, sans-serif' }}>
                {event.name}
              </h2>
              
              <div className="flex flex-wrap items-center justify-center gap-4 text-gray-300 mb-4" style={{ fontFamily: 'Work Sans, sans-serif' }}>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{formattedDate}</span>
                </div>
                
                {event.startTime && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{event.startTime}{event.endTime && ` - ${event.endTime}`}</span>
                  </div>
                )}
                
                {event.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>{event.location}</span>
                  </div>
                )}
              </div>
              
              {event.description && (
                <p className="text-gray-300 max-w-md mx-auto" style={{ fontFamily: 'Work Sans, sans-serif' }}>
                  {event.description}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Formulário de feedback */}
        <div className="bg-gray-800 rounded-lg shadow-xl p-6">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-white mb-2" style={{ fontFamily: 'Sora, sans-serif' }}>
              Como foi sua experiência?
            </h3>
            <p className="text-gray-300" style={{ fontFamily: 'Work Sans, sans-serif' }}>
              Queremos saber sua opinião sobre este evento. Seu feedback nos ajuda a melhorar!
            </p>
          </div>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Nome (opcional) */}
            <div>
              <label className="block text-white font-medium mb-2" style={{ fontFamily: 'Work Sans, sans-serif' }}>
                Nome (opcional)
              </label>
              <Input 
                {...register('name')}
                placeholder="Digite seu nome ou deixe em branco para feedback anônimo"
                className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-orange-500"
                style={{ fontFamily: 'Work Sans, sans-serif' }}
              />
              {errors.name && (
                <p className="text-red-400 text-sm mt-1">{errors.name.message}</p>
              )}
            </div>

            {/* Avaliação por estrelas */}
            <div>
              <label className="block text-white font-medium mb-3" style={{ fontFamily: 'Work Sans, sans-serif' }}>
                Avaliação *
              </label>
              <div className="py-2">
                <StarRating 
                  rating={rating} 
                  onRatingChange={(value) => setValue('rating', value)}
                  size={32}
                />
              </div>
              {errors.rating && (
                <p className="text-red-400 text-sm mt-1">{errors.rating.message}</p>
              )}
            </div>

            {/* Comentário */}
            <div>
              <label className="block text-white font-medium mb-2" style={{ fontFamily: 'Work Sans, sans-serif' }}>
                Comentário *
              </label>
              <Textarea
                {...register('comment')}
                placeholder="Conte-nos sobre sua experiência no evento. O que você mais gostou? O que poderia ser melhorado?"
                className="min-h-[120px] resize-none bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-orange-500"
                style={{ fontFamily: 'Work Sans, sans-serif' }}
              />
              {errors.comment && (
                <p className="text-red-400 text-sm mt-1">{errors.comment.message}</p>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-3 rounded-lg transition-all duration-200"
              style={{ fontFamily: 'Work Sans, sans-serif' }}
              disabled={feedbackMutation.isPending}
            >
              {feedbackMutation.isPending ? "Enviando..." : "Enviar Feedback"}
            </Button>
          </form>
        </div>

        <div className="text-center mt-8 text-gray-500 text-sm" style={{ fontFamily: 'Work Sans, sans-serif' }}>
          Powered by <span className="font-semibold text-orange-400">Symera</span>
        </div>
      </div>
    </div>
  );
}