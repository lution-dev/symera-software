import React, { useState, useEffect } from "react";
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
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-gray-600">Link de feedback inválido.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoadingEvent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-gray-600">Carregando informações do evento...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!eventInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-gray-600">Evento não encontrado.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Obrigado!</h2>
            <p className="text-gray-600 mb-4">
              Seu feedback sobre o evento "{eventInfo.name}" foi enviado com sucesso.
            </p>
            <p className="text-sm text-gray-500">
              Sua opinião é muito importante para nós e nos ajuda a melhorar nossos eventos.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center pb-6">
          <div className="w-20 h-20 mx-auto mb-4 bg-purple-100 rounded-full flex items-center justify-center">
            <span className="text-2xl">📝</span>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Avalie o Evento
          </CardTitle>
          <div className="mt-4 p-4 bg-white rounded-lg border">
            <h3 className="font-semibold text-lg text-gray-900">{eventInfo.name}</h3>
            <p className="text-sm text-gray-600 mt-1">
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
                    <FormLabel className="text-base font-semibold">
                      Como você avalia este evento? *
                    </FormLabel>
                    <FormControl>
                      <div className="flex flex-col items-center space-y-2">
                        {renderStarRating()}
                        <p className="text-sm text-gray-500">
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
                    <FormLabel className="text-base font-semibold">
                      Conte-nos mais sobre sua experiência *
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Compartilhe detalhes sobre o que você achou do evento..."
                        {...field}
                        rows={4}
                        className="resize-none"
                      />
                    </FormControl>
                    <FormDescription>
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
                    <FormLabel>Nome (opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Seu nome" {...field} />
                    </FormControl>
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
                    <FormLabel>Email (opcional)</FormLabel>
                    <FormControl>
                      <Input 
                        type="email" 
                        placeholder="seu@email.com" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Para caso queiramos entrar em contato sobre seu feedback
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="w-full bg-purple-600 hover:bg-purple-700"
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