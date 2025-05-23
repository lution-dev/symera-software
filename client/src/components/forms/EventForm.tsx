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
      // Preparar os dados para envio com garantia de tipo correto
      const formData = {
        ...data,
        // Garantir que o formato seja explicitamente definido
        format: data.format || 'in_person',
      };
      
      // Garantir que o meetingUrl seja incluído quando o formato for online ou híbrido
      if (formData.format === "online" || formData.format === "hybrid") {
        formData.meetingUrl = data.meetingUrl || "";
      } else {
        // Para eventos presenciais, limpar o meetingUrl
        formData.meetingUrl = "";
      }
      
      console.log("[Debug EventForm] Dados finais para envio:", formData);
      console.log("[Debug EventForm] Formato sendo enviado:", formData.format);
      console.log("[Debug EventForm] MeetingUrl sendo enviado:", formData.meetingUrl);

      if (isEdit && eventId) {
        // Update existing event
        console.log("[Debug EventForm] Enviando dados para atualização:", formData);
        const response = await apiRequest(
          `/api/events/${eventId}`, 
          { 
            method: "PUT", 
            body: formData  // O apiRequest já faz a serialização correta
          }
        );
        const updatedEvent = await response.json();
        console.log("[Debug EventForm] Evento atualizado:", updatedEvent);
        
        toast({
          title: "Evento atualizado",
          description: "O evento foi atualizado com sucesso!",
        });
        navigate(`/events/${eventId}`);
      } else {
        // Create new event
        console.log("[Debug EventForm] Enviando dados para criação:", data);
        const response = await apiRequest(
          "/api/events", 
          { 
            method: "POST", 
            body: data  // O apiRequest já faz a serialização correta
          }
        );
        const newEvent = await response.json();
        console.log("[Debug EventForm] Evento criado:", newEvent);
        
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
        <FormField
          control={form.control}
          name="coverImageUrl"
          render={({ field }) => (
            <FormItem className="col-span-full mb-4 sm:mb-6">
              <FormLabel className="text-sm font-medium">Imagem de capa</FormLabel>
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
                    <div className="relative w-full h-36 sm:h-48 rounded-lg overflow-hidden bg-secondary">
                      <img
                        src={imagePreview}
                        alt="Prévia da imagem"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-0 left-0 right-0 flex justify-between p-2 bg-gradient-to-t from-black/70 to-transparent">
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="h-8 text-xs"
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
                          className="h-8 text-xs"
                          onClick={() => document.getElementById("coverImage")?.click()}
                        >
                          Trocar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <label htmlFor="coverImage" className="cursor-pointer w-full block">
                      <div className="w-full h-32 sm:h-48 flex flex-col items-center justify-center border-2 border-dashed border-muted-foreground/50 rounded-lg bg-secondary/50 hover:bg-secondary/70 transition-colors">
                        {imageUploading ? (
                          <div className="flex flex-col items-center">
                            <div className="animate-spin mb-2">
                              <i className="fas fa-spinner text-xl" />
                            </div>
                            <p className="text-xs sm:text-sm text-muted-foreground">Carregando imagem...</p>
                          </div>
                        ) : (
                          <>
                            <Upload className="w-8 h-8 sm:w-10 sm:h-10 text-muted-foreground mb-1 sm:mb-2" />
                            <p className="text-xs sm:text-sm text-muted-foreground px-2 text-center">Toque para adicionar uma foto de capa</p>
                          </>
                        )}
                      </div>
                    </label>
                  )}
                </div>
              </FormControl>
              <FormDescription className="text-xs mt-1.5">
                Adicione uma imagem de capa para seu evento (opcional). Máx: 5MB.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
            
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {/* Formato do evento - redesenhado para mobile */}
          <FormField
            control={form.control}
            name="format"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel className="text-sm font-medium mb-1">Formato do evento</FormLabel>
                <div className="grid grid-cols-3 gap-1 sm:flex sm:flex-wrap sm:gap-2 mt-1">
                  <Badge 
                    variant={field.value === "in_person" ? "default" : "outline"}
                    className={`py-3 sm:py-2 px-1 sm:px-4 cursor-pointer touch-action-manipulation hover:bg-primary/90 transition-colors flex flex-col sm:flex-row items-center justify-center sm:justify-start sm:gap-2 ${field.value === "in_person" ? "bg-primary text-white" : "bg-background hover:bg-secondary/40"}`}
                    onClick={() => {
                      field.onChange("in_person");
                      setEventFormat("in_person");
                    }}
                  >
                    <Users className="w-4 h-4 mb-1 sm:mb-0" />
                    <span className="text-xs sm:text-sm">Presencial</span>
                  </Badge>
                  <Badge 
                    variant={field.value === "online" ? "default" : "outline"}
                    className={`py-3 sm:py-2 px-1 sm:px-4 cursor-pointer touch-action-manipulation hover:bg-primary/90 transition-colors flex flex-col sm:flex-row items-center justify-center sm:justify-start sm:gap-2 ${field.value === "online" ? "bg-primary text-white" : "bg-background hover:bg-secondary/40"}`}
                    onClick={() => {
                      field.onChange("online");
                      setEventFormat("online");
                    }}
                  >
                    <Video className="w-4 h-4 mb-1 sm:mb-0" />
                    <span className="text-xs sm:text-sm">Online</span>
                  </Badge>
                  <Badge 
                    variant={field.value === "hybrid" ? "default" : "outline"}
                    className={`py-3 sm:py-2 px-1 sm:px-4 cursor-pointer touch-action-manipulation hover:bg-primary/90 transition-colors flex flex-col sm:flex-row items-center justify-center sm:justify-start sm:gap-2 ${field.value === "hybrid" ? "bg-primary text-white" : "bg-background hover:bg-secondary/40"}`}
                    onClick={() => {
                      field.onChange("hybrid");
                      setEventFormat("hybrid");
                    }}
                  >
                    <UserCog className="w-4 h-4 mb-1 sm:mb-0" />
                    <span className="text-xs sm:text-sm">Híbrido</span>
                  </Badge>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">Nome do evento</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ex: Lançamento Produto XYZ"
                    {...field}
                    className="h-10 text-sm"
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
                <FormLabel className="text-sm font-medium">Tipo de evento</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="h-10 text-sm">
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

          {/* Seção de data e hora - Layout otimizado para mobile */}
          <div className="col-span-1 md:col-span-2 rounded-lg border border-muted p-3 bg-muted/10 mb-1 mt-2">
            <h3 className="text-sm font-medium mb-3">Data e horário</h3>
            
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-medium">Data de início</FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        {...field} 
                        className="h-9 text-sm"
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
                name="startTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-medium">Hora início</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} className="h-9 text-sm" />
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
                    <FormLabel className="text-xs font-medium">Data de término</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} className="h-9 text-sm" />
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
                    <FormLabel className="text-xs font-medium">Hora término</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} className="h-9 text-sm" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Seção de localização - com base no formato do evento */}
          <div className="col-span-1 md:col-span-2 mt-2 mb-1">
            {/* Mostrar campo de local apenas para eventos presenciais ou híbridos */}
            {(eventFormat === "in_person" || eventFormat === "hybrid") && (
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Local</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Hotel Meridien" {...field} className="h-10 text-sm" />
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
                    <FormLabel className="text-sm font-medium">Link da reunião</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: https://meet.google.com/abc-defg-hij" {...field} className="h-10 text-sm" />
                    </FormControl>
                    <FormDescription className="text-xs">
                      Link para Zoom, Google Meet, MS Teams, etc.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>

          {/* Seção de detalhes financeiros */}
          <div className="col-span-1 md:col-span-2 rounded-lg border border-muted p-3 bg-muted/10 mt-4 mb-1">
            <h3 className="text-sm font-medium mb-3">Detalhes do planejamento</h3>
            
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="attendees"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-medium">Número de convidados</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Ex: 100"
                        {...field}
                        className="h-9 text-sm"
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
                    <FormLabel className="text-xs font-medium">Orçamento (R$)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Ex: 30000"
                        {...field}
                        className="h-9 text-sm"
                        onChange={(e) => field.onChange(e.target.valueAsNumber || undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem className="mt-4">
              <FormLabel className="text-sm font-medium">Descrição do evento</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Descreva detalhes específicos do seu evento..."
                  className="h-20 sm:h-24 text-sm resize-none"
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
              <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-3 sm:p-4 mt-4">
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="text-sm font-medium">Gerar checklist com IA</FormLabel>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Crie automaticamente um checklist com tarefas baseadas nos detalhes do evento
                  </p>
                </div>
              </FormItem>
            )}
          />
        )}

        <div className="flex justify-between sm:justify-end mt-6 space-x-3">
          <Button
            type="button"
            variant="outline"
            className="flex-1 sm:flex-initial text-xs sm:text-sm h-10"
            onClick={() => navigate(isEdit && eventId ? `/events/${eventId}` : "/events")}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="flex-1 sm:flex-initial text-xs sm:text-sm h-10 font-medium"
          >
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
