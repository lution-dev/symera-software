import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
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
import { apiRequest } from "@/lib/queryClient";

const feedbackSchema = z.object({
  name: z.string().optional(),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  rating: z.number().min(1, "Selecione uma avaliação").max(5),
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

  const form = useForm<FeedbackFormData>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      name: "",
      email: "",
      rating: 0,
      comment: "",
    },
  });

  // Buscar informações do evento - sem autenticação
  const { data: event, isLoading: loadingEvent, error } = useQuery<EventInfo>({
    queryKey: ['/api/feedback', feedbackId, 'event'],
    queryFn: async () => {
      const response = await fetch(`/api/feedback/${feedbackId}/event`);
      if (!response.ok) {
        throw new Error('Não foi possível carregar as informações do evento');
      }
      return response.json();
    },
    enabled: !!feedbackId,
  });

  // Enviar feedback
  const submitFeedbackMutation = useMutation({
    mutationFn: (data: FeedbackFormData) =>
      apiRequest(`/api/feedback/${feedbackId}`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      setIsSubmitted(true);
      toast({
        title: "Feedback enviado com sucesso!",
        description: "Obrigado por compartilhar sua opinião sobre o evento.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao enviar feedback",
        description: error.message || "Não foi possível enviar o feedback. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FeedbackFormData) => {
    submitFeedbackMutation.mutate({
      ...data,
      rating: selectedRating,
      email: data.email || undefined,
      name: data.name || undefined,
    });
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
      party: "Festa",
      meeting: "Reunião",
      workshop: "Workshop",
      seminar: "Seminário",
      other: "Outro"
    };
    return types[type] || type;
  };

  if (!feedbackId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <i className="fas fa-exclamation-triangle text-4xl text-yellow-500 mb-4"></i>
              <h2 className="text-lg font-semibold mb-2">Link inválido</h2>
              <p className="text-muted-foreground text-sm">
                O link de feedback não é válido ou expirou.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loadingEvent) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Carregando informações do evento...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <i className="fas fa-exclamation-triangle text-4xl text-red-500 mb-4"></i>
              <h2 className="text-lg font-semibold mb-2">Evento não encontrado</h2>
              <p className="text-muted-foreground text-sm">
                Não foi possível encontrar as informações do evento. Verifique se o link está correto.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <i className="fas fa-check-circle text-4xl text-green-500 mb-4"></i>
              <h2 className="text-lg font-semibold mb-2">Feedback enviado!</h2>
              <p className="text-muted-foreground text-sm mb-4">
                Obrigado por compartilhar sua opinião sobre o evento <strong>{event.name}</strong>.
              </p>
              <p className="text-xs text-muted-foreground">
                Sua avaliação é muito importante para nós e nos ajuda a melhorar futuros eventos.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header com informações do evento */}
      <div className="bg-card border-b">
        <div className="max-w-2xl mx-auto p-6">
          <div className="flex items-center gap-4">
            {event.coverImageUrl ? (
              <img 
                src={event.coverImageUrl} 
                alt={event.name}
                className="w-16 h-16 rounded-lg object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center">
                <i className="fas fa-calendar-alt text-primary text-xl"></i>
              </div>
            )}
            <div>
              <h1 className="text-xl font-semibold">{event.name}</h1>
              <p className="text-sm text-muted-foreground">
                {getEventTypeLabel(event.type)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Formulário de feedback */}
      <div className="max-w-2xl mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <i className="fas fa-star text-yellow-400"></i>
              Avalie este evento
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Sua opinião é muito importante! Compartilhe sua experiência para nos ajudar a melhorar.
            </p>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Avaliação por estrelas */}
                <FormField
                  control={form.control}
                  name="rating"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-medium">
                        Como você avalia este evento? *
                      </FormLabel>
                      <FormControl>
                        <div className="space-y-2">
                          {renderStarRating()}
                          {selectedRating > 0 && (
                            <p className="text-sm text-muted-foreground">
                              {selectedRating === 1 && "Muito ruim"}
                              {selectedRating === 2 && "Ruim"}
                              {selectedRating === 3 && "Regular"}
                              {selectedRating === 4 && "Bom"}
                              {selectedRating === 5 && "Excelente"}
                            </p>
                          )}
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
                      <FormLabel className="text-base font-medium">
                        Deixe seu comentário *
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Conte-nos sobre sua experiência no evento. O que você mais gostou? Há algo que poderia ser melhorado?"
                          className="min-h-[120px] resize-none"
                        />
                      </FormControl>
                      <FormDescription>
                        Mínimo de 10 caracteres. Seja específico sobre sua experiência.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Campos opcionais */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome (opcional)</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="Seu nome"
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
                        <FormLabel>Email (opcional)</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="email"
                            placeholder="seu@email.com"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Botão de envio */}
                <div className="pt-4">
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={submitFeedbackMutation.isPending}
                  >
                    {submitFeedbackMutation.isPending ? (
                      <>
                        <i className="fas fa-spinner fa-spin mr-2"></i>
                        Enviando feedback...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-paper-plane mr-2"></i>
                        Enviar feedback
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}