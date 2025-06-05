import { useState, useEffect } from "react";
import { useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "@/hooks/use-toast";
import { Calendar, Shield, Check } from "lucide-react";

const feedbackSchema = z.object({
  name: z.string().optional(),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  rating: z.number().min(1, "Por favor, selecione uma avaliação").max(5),
  comment: z.string().min(10, "O comentário deve ter pelo menos 10 caracteres"),
  isAnonymous: z.boolean().default(true),
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
  const [isAnonymous, setIsAnonymous] = useState(true);

  const form = useForm<FeedbackFormData>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      name: "",
      email: "",
      rating: 0,
      comment: "",
      isAnonymous: true,
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
          rating: selectedRating,
          comment: data.comment,
          isAnonymous: isAnonymous,
          email: isAnonymous ? undefined : data.email || undefined,
          name: isAnonymous ? undefined : data.name || undefined,
        }),
      });

      if (response.ok) {
        setIsSubmitted(true);
        // Não usar toast aqui, vamos mostrar o modal customizado
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
      // Eventos Sociais
      'wedding': 'Casamento',
      'birthday': 'Aniversário',
      'baby_shower': 'Chá Revelação',
      'bachelor_party': 'Despedida de Solteiro(a)',
      'kids_party': 'Festa Infantil',
      'sweet_15': 'Festa de 15 Anos',
      'graduation': 'Formatura',
      'family_reunion': 'Encontro de Família',
      'religious_celebration': 'Celebração Religiosa',
      'special_dinner': 'Jantar Especial',
      
      // Eventos Profissionais
      'corporate': 'Corporativo',
      'conference': 'Conferência',
      'convention': 'Convenção',
      'workshop': 'Workshop',
      'training': 'Treinamento',
      'product_launch': 'Lançamento de Produto',
      'trade_show': 'Feira / Exposição',
      'hackathon': 'Hackathon',
      'business_cocktail': 'Coquetel Empresarial',
      'networking': 'Encontro de Networking',
      
      // Outros Eventos
      'festival': 'Festival',
      'show': 'Show / Espetáculo',
      'sports_event': 'Evento Esportivo',
      'academic_event': 'Evento Acadêmico',
      'charity_event': 'Evento Beneficente',
      'online_event': 'Evento Online',
      'hybrid_event': 'Evento Híbrido',
      'social': 'Social',
      'other': 'Outro'
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
          <CardContent className="pt-6 pb-8">
            <div className="text-6xl mb-6">🎉</div>
            <h2 className="text-2xl font-bold text-white font-sora mb-4">
              Obrigado pelo seu feedback!
            </h2>
            <p className="text-white/80 mb-6 font-work-sans leading-relaxed">
              Ele é essencial para melhorarmos os próximos eventos
            </p>
            <Button 
              onClick={() => window.open('https://symera.com.br', '_blank')}
              className="w-full bg-gradient-to-r from-[#FF8800] to-[#EC4130] hover:from-[#FF9933] hover:to-[#F05545] text-white font-sora font-semibold py-3 transition-all duration-200"
            >
              Conheça a Symera →
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#120922] to-[#1C0E2D] flex items-center justify-center p-4 py-8">
      <Card className="w-full max-w-2xl bg-white/10 backdrop-blur-sm border-white/20 overflow-hidden">
        {/* Event Image - fills the top of the main card */}
        <div className="w-full h-48 relative">
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
          
          {/* Gradient overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
          
          {/* Event Info - overlaid on image */}
          <div className="absolute bottom-0 left-0 right-0 p-6 text-left">
            <h3 className="font-semibold text-xl text-white font-sora mb-1">{eventInfo.name}</h3>
            <p className="text-sm text-white/80 font-work-sans">
              {getEventTypeLabel(eventInfo.type)} • São Paulo, SP
            </p>
          </div>
        </div>

        <CardHeader className="text-center pb-6 pt-8">
          <CardTitle className="text-2xl font-bold text-white font-sora mb-4">
            Avalie o Evento
          </CardTitle>
          <p className="text-white/80 font-work-sans text-base leading-relaxed max-w-md mx-auto">
            Seu feedback é muito importante para nós. Ele nos ajuda a melhorar os próximos eventos.
          </p>
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

              {/* Toggle de Anonimato */}
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Switch
                    id="anonymous-mode"
                    checked={isAnonymous}
                    onCheckedChange={setIsAnonymous}
                    className="data-[state=checked]:bg-green-600"
                  />
                  <label htmlFor="anonymous-mode" className="text-white font-work-sans font-medium">
                    Enviar como anônimo
                  </label>
                </div>

                {isAnonymous ? (
                  /* Mensagem quando anônimo */
                  <div className="flex items-start gap-2 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                    <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-green-200 font-work-sans">
                      Seu feedback será enviado de forma anônima. Nenhuma informação pessoal será exibida publicamente.
                    </p>
                  </div>
                ) : (
                  /* Campos de identificação quando não anônimo */
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white font-work-sans">Nome (opcional)</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Digite seu nome completo" 
                              {...field} 
                              className="bg-white/10 border-white/20 text-white placeholder:text-white/50 font-work-sans"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

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
                  </div>
                )}
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