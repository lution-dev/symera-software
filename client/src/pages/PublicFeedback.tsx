import { useState, useEffect } from "react";
import { useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "@/hooks/use-toast";
import { Calendar, Shield } from "lucide-react";

const feedbackSchema = z.object({
  name: z.string().optional(),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  rating: z.number().min(1, "Por favor, selecione uma avaliação").max(5),
  comment: z.string().min(10, "O comentário deve ter pelo menos 10 caracteres"),
});

type FeedbackFormData = z.infer<typeof feedbackSchema>;

interface EventInfo {
  id: number;
  name: string;
  coverImageUrl?: string;
  type: string;
}

export default function PublicFeedback() {
  const [, params] = useRoute("/feedback/:feedbackId");
  const feedbackId = params?.feedbackId;
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [selectedRating, setSelectedRating] = useState<number>(0);
  const [eventInfo, setEventInfo] = useState<EventInfo | null>(null);
  const [isLoadingEvent, setIsLoadingEvent] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FeedbackFormData>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      name: "",
      email: "",
      rating: 0,
      comment: "",
    },
  });

  // Buscar informações do evento via feedback ID
  useEffect(() => {
    if (!feedbackId) return;
    
    const fetchEventInfo = async () => {
      try {
        setIsLoadingEvent(true);
        const response = await fetch(`/api/feedback/${feedbackId}/event`);
        if (response.ok) {
          const data = await response.json();
          setEventInfo(data);
        } else {
          console.error('Erro ao buscar informações do evento:', response.status);
        }
      } catch (error) {
        console.error('Erro na requisição:', error);
      } finally {
        setIsLoadingEvent(false);
      }
    };

    fetchEventInfo();
  }, [feedbackId]);

  // Função para enviar feedback
  const onSubmit = async (data: FeedbackFormData) => {
    try {
      setIsSubmitting(true);
      const response = await fetch(`/api/feedback/${feedbackId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          rating: selectedRating,
          email: data.email || undefined,
          name: data.name || undefined,
        }),
      });

      if (response.ok) {
        setIsSubmitted(true);
        toast({
          title: "Feedback enviado com sucesso!",
          description: "Obrigado por compartilhar sua opinião sobre o evento.",
        });
      } else {
        toast({
          title: "Erro ao enviar feedback",
          description: "Não foi possível enviar o feedback. Tente novamente.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erro ao enviar feedback:', error);
      toast({
        title: "Erro ao enviar feedback",
        description: "Não foi possível enviar o feedback. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStarRating = () => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className={`text-3xl transition-colors ${
              star <= selectedRating 
                ? "text-yellow-400 hover:text-yellow-500" 
                : "text-gray-300 hover:text-yellow-300"
            }`}
            onClick={() => {
              setSelectedRating(star);
              form.setValue("rating", star);
              form.clearErrors("rating");
            }}
          >
            ★
          </button>
        ))}
      </div>
    );
  };

  const getEventTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      wedding: "Casamento",
      birthday: "Aniversário",
      corporate: "Corporativo",
      conference: "Conferência",
      social: "Social",
      other: "Outro",
    };
    return types[type] || type;
  };

  if (!feedbackId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#120922] to-[#1C0E2D] flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white/10 backdrop-blur-sm border-white/20">
          <CardContent className="pt-6">
            <p className="text-center text-white/80 font-work-sans">Link de feedback inválido.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoadingEvent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#120922] to-[#1C0E2D] flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white/10 backdrop-blur-sm border-white/20">
          <CardContent className="pt-6">
            <p className="text-center text-white/80 font-work-sans">Carregando informações do evento...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!eventInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#120922] to-[#1C0E2D] flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white/10 backdrop-blur-sm border-white/20">
          <CardContent className="pt-6">
            <p className="text-center text-white/80 font-work-sans">Evento não encontrado.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#120922] to-[#1C0E2D] flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center bg-white/10 backdrop-blur-sm border-white/20">
          <CardContent className="pt-6">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-white font-sora mb-2">Obrigado!</h2>
            <p className="text-white/80 mb-4 font-work-sans">
              Seu feedback sobre o evento "{eventInfo.name}" foi enviado com sucesso.
            </p>
            <p className="text-sm text-white/60 font-work-sans">
              Sua opinião é muito importante para nós e nos ajuda a melhorar nossos eventos.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#120922] to-[#1C0E2D] flex items-center justify-center p-4 py-8">
      <Card className="w-full max-w-2xl bg-white/10 backdrop-blur-sm border-white/20">
        <CardHeader className="text-center pb-6 pt-8">
          {/* Event Image */}
          <div className="w-40 h-40 mx-auto mb-6 rounded-xl overflow-hidden shadow-lg">
            {eventInfo.coverImageUrl ? (
              <img 
                src={eventInfo.coverImageUrl} 
                alt={eventInfo.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-white/20 flex items-center justify-center">
                <Calendar className="w-12 h-12 text-white/60" />
              </div>
            )}
          </div>
          
          <CardTitle className="text-2xl font-bold text-white font-sora mb-4">
            Avalie o Evento
          </CardTitle>
          
          <div className="mt-4 p-4 bg-white/10 rounded-lg border border-white/20">
            <h3 className="font-semibold text-lg text-white font-sora">{eventInfo.name}</h3>
            <p className="text-sm text-white/80 mt-1 font-work-sans">
              {getEventTypeLabel(eventInfo.type)}
            </p>
          </div>
        </CardHeader>
        
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Rating */}
              <FormField
                control={form.control}
                name="rating"
                render={() => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold text-white font-sora">
                      Como você avalia este evento? *
                    </FormLabel>
                    <FormControl>
                      <div className="flex flex-col items-center space-y-2">
                        {renderStarRating()}
                        <p className="text-sm text-white/60 font-work-sans">
                          {selectedRating === 0 && "Clique nas estrelas para avaliar"}
                          {selectedRating === 1 && "Muito ruim"}
                          {selectedRating === 2 && "Ruim"}
                          {selectedRating === 3 && "Regular"}
                          {selectedRating === 4 && "Bom"}
                          {selectedRating === 5 && "Excelente"}
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
                    <FormLabel className="text-base font-semibold text-white font-sora">
                      Conte-nos mais sobre sua experiência *
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Compartilhe o que achou do evento..."
                        {...field}
                        rows={4}
                        className="resize-none bg-white/10 border-white/20 text-white placeholder:text-white/50 font-work-sans"
                      />
                    </FormControl>
                    <FormDescription className="text-white/60 font-work-sans">
                      Mínimo de 10 caracteres
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Nome (opcional) */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white font-work-sans">Nome (opcional)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Deixe em branco para permanecer anônimo" 
                        {...field} 
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/50 font-work-sans"
                      />
                    </FormControl>
                    <FormDescription className="text-white/60 text-sm font-work-sans">
                      Deixe em branco para permanecer anônimo
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Email (opcional) */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white font-work-sans">Email (opcional)</FormLabel>
                    <FormControl>
                      <Input 
                        type="email" 
                        placeholder="seu@email.com" 
                        {...field} 
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/50 font-work-sans"
                      />
                    </FormControl>
                    <FormDescription className="text-white/60 text-sm font-work-sans">
                      Só entraremos em contato se necessário
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Privacy disclaimer */}
              <div className="flex items-start gap-2 p-3 bg-white/5 rounded-lg border border-white/10">
                <Shield className="w-4 h-4 text-white/60 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-white/70 font-work-sans">
                  🔒 Seu feedback pode ser anônimo. Nenhuma informação pessoal será exibida publicamente.
                </p>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-[#FF8800] to-[#EC4130] hover:from-[#FF9933] hover:to-[#F05545] text-white font-sora font-semibold py-3 transition-all duration-200"
                disabled={isSubmitting || selectedRating === 0}
              >
                {isSubmitting ? "Enviando..." : "Enviar Feedback"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}