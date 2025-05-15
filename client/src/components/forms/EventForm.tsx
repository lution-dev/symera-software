import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createEventSchema } from "@shared/schema";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

interface EventFormProps {
  defaultValues?: {
    name?: string;
    type?: string;
    date?: string;
    location?: string;
    description?: string;
    budget?: number;
    attendees?: number;
    generateAIChecklist?: boolean;
  };
  isEdit?: boolean;
  eventId?: number;
}

const EventForm: React.FC<EventFormProps> = ({
  defaultValues = {
    name: "",
    type: "",
    date: new Date().toISOString().split("T")[0],
    location: "",
    description: "",
    budget: undefined,
    attendees: undefined,
    generateAIChecklist: true,
  },
  isEdit = false,
  eventId,
}) => {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm({
    resolver: zodResolver(createEventSchema),
    defaultValues,
  });

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      if (isEdit && eventId) {
        // Update existing event
        await apiRequest("PUT", `/api/events/${eventId}`, data);
        toast({
          title: "Evento atualizado",
          description: "O evento foi atualizado com sucesso!",
        });
        navigate(`/events/${eventId}`);
      } else {
        // Create new event
        const response = await apiRequest("POST", "/api/events", data);
        const newEvent = await response.json();
        toast({
          title: "Evento criado",
          description: "O evento foi criado com sucesso!",
        });
        navigate(`/events/${newEvent.id}`);
      }
    } catch (error) {
      console.error("Error saving event:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o evento. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome do evento</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ex: Lançamento Produto XYZ"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de evento</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="wedding">Casamento</SelectItem>
                    <SelectItem value="birthday">Aniversário</SelectItem>
                    <SelectItem value="corporate">Corporativo</SelectItem>
                    <SelectItem value="conference">Conferência</SelectItem>
                    <SelectItem value="social">Social</SelectItem>
                    <SelectItem value="other">Outro</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data do evento</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Local</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Hotel Meridien" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="attendees"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número de convidados</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Ex: 100"
                    {...field}
                    onChange={(e) => field.onChange(e.target.valueAsNumber || undefined)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="budget"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Orçamento estimado (R$)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Ex: 30000"
                    {...field}
                    onChange={(e) => field.onChange(e.target.valueAsNumber || undefined)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição do evento</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Descreva detalhes específicos do seu evento..."
                  className="h-24"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {!isEdit && (
          <FormField
            control={form.control}
            name="generateAIChecklist"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Gerar checklist inteligente com IA</FormLabel>
                  <p className="text-sm text-muted-foreground">
                    Crie automaticamente um checklist com tarefas baseadas nos detalhes do evento
                  </p>
                </div>
              </FormItem>
            )}
          />
        )}

        <div className="flex justify-end space-x-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(isEdit && eventId ? `/events/${eventId}` : "/events")}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <span className="animate-spin mr-2">
                  <i className="fas fa-spinner" />
                </span>
                {isEdit ? "Atualizando..." : "Criando..."}
              </>
            ) : (
              isEdit ? "Atualizar Evento" : "Criar Evento"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default EventForm;
