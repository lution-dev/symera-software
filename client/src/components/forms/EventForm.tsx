import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createEventSchema } from "@shared/schema";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Form,
  FormControl,
  FormDescription,
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
import { Image, Upload, Users, Video, UserCog } from "lucide-react";

interface EventFormProps {
  defaultValues?: {
    name?: string;
    type?: string;
    format?: string;
    date?: string;
    startDate?: string;
    endDate?: string;
    startTime?: string;
    endTime?: string;
    location?: string;
    meetingUrl?: string;
    description?: string;
    budget?: number;
    attendees?: number;
    coverImageUrl?: string;
    generateAIChecklist?: boolean;
  };
  isEdit?: boolean;
  eventId?: number;
}

const EventForm: React.FC<EventFormProps> = ({
  defaultValues: inputDefaultValues,
  isEdit = false,
  eventId,
}) => {
  // Check if there's a saved date in localStorage
  const savedDate = localStorage.getItem('selectedEventDate');
  
  // Use the saved date if it exists, otherwise use today's date
  const defaultDate = savedDate || new Date().toISOString().split("T")[0];
  
  // Create the default values with the appropriate date
  const defaultValues = {
    name: "",
    type: "",
    format: "in_person",
    date: defaultDate,
    startDate: defaultDate,
    endDate: defaultDate,
    startTime: "09:00",
    endTime: "18:00",
    location: "",
    meetingUrl: "",
    description: "",
    budget: undefined,
    attendees: undefined,
    coverImageUrl: "",
    generateAIChecklist: true,
    ...(inputDefaultValues || {})
  };

  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  
  // Clear the saved date from localStorage after it's been used
  React.useEffect(() => {
    if (savedDate) {
      localStorage.removeItem('selectedEventDate');
    }
  }, [savedDate]);

  const form = useForm({
    resolver: zodResolver(createEventSchema),
    defaultValues,
  });

  const [imagePreview, setImagePreview] = useState<string | null>(defaultValues.coverImageUrl || null);
  const [imageUploading, setImageUploading] = useState(false);
  // Inicializar o estado do formato com o valor do evento ou "in_person" como padrão
  // Usar console.log para depuração do formato
  const initialFormat = defaultValues.format || "in_person";
  console.log("[Debug EventForm] Formato recebido:", defaultValues.format);
  const [eventFormat, setEventFormat] = useState<string>(initialFormat);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Tipo de arquivo inválido",
        description: "Por favor, selecione uma imagem.",
        variant: "destructive",
      });
      return;
    }

    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Arquivo muito grande",
        description: "O tamanho máximo permitido é 5MB.",
        variant: "destructive",
      });
      return;
    }

    setImageUploading(true);

    try {
      // Create a FileReader to get a data URL for preview
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        form.setValue("coverImageUrl", result);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error uploading image:", error);
      toast({
        title: "Erro no upload",
        description: "Não foi possível fazer o upload da imagem.",
        variant: "destructive",
      });
    } finally {
      setImageUploading(false);
    }
  };

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      if (isEdit && eventId) {
        // Update existing event
        await apiRequest(
          `/api/events/${eventId}`, 
          { 
            method: "PUT", 
            body: data 
          }
        );
        toast({
          title: "Evento atualizado",
          description: "O evento foi atualizado com sucesso!",
        });
        navigate(`/events/${eventId}`);
      } else {
        // Create new event
        const response = await apiRequest(
          "/api/events", 
          { 
            method: "POST", 
            body: data 
          }
        );
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
        <FormField
          control={form.control}
          name="coverImageUrl"
          render={({ field }) => (
            <FormItem className="col-span-full mb-6">
              <FormLabel>Imagem de capa</FormLabel>
              <FormControl>
                <div className="w-full">
                  <Input
                    type="file"
                    accept="image/*"
                    id="coverImage"
                    onChange={handleImageUpload}
                    disabled={imageUploading}
                    className="hidden"
                  />
                  
                  {imagePreview ? (
                    <div className="relative w-full h-48 rounded-lg overflow-hidden bg-secondary">
                      <img
                        src={imagePreview}
                        alt="Prévia da imagem"
                        className="w-full h-full object-cover"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => {
                          setImagePreview(null);
                          form.setValue("coverImageUrl", "");
                        }}
                      >
                        Remover
                      </Button>
                      
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        className="absolute bottom-2 right-2"
                        onClick={() => document.getElementById("coverImage")?.click()}
                      >
                        Trocar
                      </Button>
                    </div>
                  ) : (
                    <label htmlFor="coverImage" className="cursor-pointer w-full block">
                      <div className="w-full h-48 flex flex-col items-center justify-center border-2 border-dashed border-muted-foreground/50 rounded-lg bg-secondary/50 hover:bg-secondary/70 transition-colors">
                        {imageUploading ? (
                          <div className="flex flex-col items-center">
                            <div className="animate-spin mb-2">
                              <i className="fas fa-spinner text-2xl" />
                            </div>
                            <p className="text-sm text-muted-foreground">Carregando imagem...</p>
                          </div>
                        ) : (
                          <>
                            <Upload className="w-10 h-10 text-muted-foreground mb-2" />
                            <p className="text-sm text-muted-foreground">Clique para adicionar uma imagem de capa</p>
                          </>
                        )}
                      </div>
                    </label>
                  )}
                </div>
              </FormControl>
              <FormDescription>
                Adicione uma imagem de capa para seu evento (opcional). Tamanho máximo: 5MB.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
            
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Formato do evento - como primeiro campo usando chips/badges */}
          <FormField
            control={form.control}
            name="format"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Formato do evento</FormLabel>
                <div className="flex flex-wrap gap-2 mt-1.5">
                  <Badge 
                    variant={field.value === "in_person" ? "default" : "outline"}
                    className={`px-4 py-2 cursor-pointer hover:bg-primary/90 transition-colors flex items-center gap-2 ${field.value === "in_person" ? "bg-primary text-white" : "bg-background hover:bg-secondary/40"}`}
                    onClick={() => {
                      field.onChange("in_person");
                      setEventFormat("in_person");
                    }}
                  >
                    <Users className="w-4 h-4" />
                    Presencial
                  </Badge>
                  <Badge 
                    variant={field.value === "online" ? "default" : "outline"}
                    className={`px-4 py-2 cursor-pointer hover:bg-primary/90 transition-colors flex items-center gap-2 ${field.value === "online" ? "bg-primary text-white" : "bg-background hover:bg-secondary/40"}`}
                    onClick={() => {
                      field.onChange("online");
                      setEventFormat("online");
                    }}
                  >
                    <Video className="w-4 h-4" />
                    Online
                  </Badge>
                  <Badge 
                    variant={field.value === "hybrid" ? "default" : "outline"}
                    className={`px-4 py-2 cursor-pointer hover:bg-primary/90 transition-colors flex items-center gap-2 ${field.value === "hybrid" ? "bg-primary text-white" : "bg-background hover:bg-secondary/40"}`}
                    onClick={() => {
                      field.onChange("hybrid");
                      setEventFormat("hybrid");
                    }}
                  >
                    <UserCog className="w-4 h-4" />
                    Híbrido
                  </Badge>
                </div>
                <FormDescription>
                  Selecione o formato do seu evento
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

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
            name="startDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data de início</FormLabel>
                <FormControl>
                  <Input 
                    type="date" 
                    {...field} 
                    onChange={(e) => {
                      field.onChange(e);
                      // Atualiza o campo date para manter compatibilidade
                      form.setValue("date", e.target.value);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data de término</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="startTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Horário de início</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="endTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Horário de término</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Mostrar campo de local apenas para eventos presenciais ou híbridos */}
          {(eventFormat === "in_person" || eventFormat === "hybrid") && (
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
          )}
          
          {/* Mostrar campo de URL da reunião apenas para eventos online ou híbridos */}
          {(eventFormat === "online" || eventFormat === "hybrid") && (
            <FormField
              control={form.control}
              name="meetingUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Link da reunião</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: https://meet.google.com/abc-defg-hij" {...field} />
                  </FormControl>
                  <FormDescription>
                    Adicione o link da videoconferência (Zoom, Google Meet, Teams, etc.)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

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
