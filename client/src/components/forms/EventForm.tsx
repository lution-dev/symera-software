import React, { useState, useEffect, useRef, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { eventFormSchema } from "@shared/schema";
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
import { apiRequest, queryClient } from "@/lib/queryClient";
import { authManager } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Image, Upload, Users, Video, UserCog, Cloud, CloudOff, Loader2 } from "lucide-react";

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
    resolver: zodResolver(eventFormSchema),
    defaultValues,
  });

  const [imagePreview, setImagePreview] = useState<string | null>(defaultValues.coverImageUrl || null);
  const [imageUploading, setImageUploading] = useState(false);
  // Inicializar o estado do formato com o valor do evento ou "in_person" como padrão
  const initialFormat = defaultValues.format || "in_person";
  console.log("[Debug EventForm] Formato recebido:", defaultValues.format);
  const [eventFormat, setEventFormat] = useState<string>(initialFormat);
  
  // Auto-save states
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [draftLoaded, setDraftLoaded] = useState(false);
  const [draftId, setDraftId] = useState<number | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedDataRef = useRef<string>('');
  
  // Load draft on mount (only for new events, not editing existing ones)
  useEffect(() => {
    if (!isEdit) {
      loadDraft();
    }
  }, [isEdit]);
  
  const loadDraft = async () => {
    try {
      console.log("[AutoSave] Buscando rascunho existente...");
      const token = authManager.getAccessToken();
      if (!token) {
        console.log("[AutoSave] Sem token de autenticação, pulando carregamento de rascunho");
        return;
      }
      
      const response = await fetch('/api/events/draft', {
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const draft = await response.json();
        console.log("[AutoSave] Rascunho encontrado:", draft);
        
        // Formatar datas para o formato do formulário
        const startDate = draft.startDate ? new Date(draft.startDate).toISOString().split('T')[0] : defaultDate;
        const endDate = draft.endDate ? new Date(draft.endDate).toISOString().split('T')[0] : startDate;
        
        // Preencher formulário com dados do rascunho
        form.reset({
          name: draft.name || '',
          type: draft.type || '',
          format: draft.format || 'in_person',
          date: startDate,
          startDate: startDate,
          endDate: endDate,
          startTime: draft.startTime || '09:00',
          endTime: draft.endTime || '18:00',
          location: draft.location || '',
          meetingUrl: draft.meetingUrl || '',
          description: draft.description || '',
          budget: draft.budget || undefined,
          attendees: draft.attendees || undefined,
          coverImageUrl: draft.coverImageUrl || '',
          generateAIChecklist: true,
        });
        
        setEventFormat(draft.format || 'in_person');
        if (draft.coverImageUrl) {
          setImagePreview(draft.coverImageUrl);
        }
        setDraftId(draft.id);
        setDraftLoaded(true);
        setSaveStatus('saved');
        
        // Salvar referência dos dados carregados
        lastSavedDataRef.current = JSON.stringify(form.getValues());
      } else if (response.status === 404) {
        console.log("[AutoSave] Nenhum rascunho encontrado");
      }
    } catch (error) {
      console.error("[AutoSave] Erro ao carregar rascunho:", error);
    }
  };
  
  // Save draft function
  const saveDraft = useCallback(async (data: any) => {
    // Não salvar se estiver editando um evento existente
    if (isEdit) return;
    
    // Verificar se os dados mudaram
    const currentDataStr = JSON.stringify(data);
    if (currentDataStr === lastSavedDataRef.current) {
      console.log("[AutoSave] Dados não mudaram, pulando salvamento");
      return;
    }
    
    // Não salvar se o formulário estiver praticamente vazio
    if (!data.name && !data.description && !data.type) {
      console.log("[AutoSave] Formulário muito vazio para salvar");
      return;
    }
    
    try {
      setSaveStatus('saving');
      console.log("[AutoSave] Salvando rascunho...", data);
      
      const draftPayload = {
        name: data.name,
        type: data.type,
        format: data.format,
        startDate: data.startDate,
        endDate: data.endDate,
        startTime: data.startTime,
        endTime: data.endTime,
        location: data.location,
        meetingUrl: data.meetingUrl,
        description: data.description,
        budget: data.budget,
        attendees: data.attendees,
        coverImageUrl: data.coverImageUrl,
      };
      
      const token = authManager.getAccessToken();
      if (!token) {
        console.log("[AutoSave] Sem token de autenticação, pulando salvamento");
        setSaveStatus('idle');
        return;
      }
      
      const response = await fetch('/api/events/draft', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify(draftPayload),
      });
      
      if (response.ok) {
        const savedDraft = await response.json();
        setDraftId(savedDraft.id);
        lastSavedDataRef.current = currentDataStr;
        setSaveStatus('saved');
        console.log("[AutoSave] Rascunho salvo com sucesso");
      } else {
        throw new Error('Falha ao salvar rascunho');
      }
    } catch (error) {
      console.error("[AutoSave] Erro ao salvar rascunho:", error);
      setSaveStatus('error');
    }
  }, [isEdit]);
  
  // Debounced auto-save on form changes
  useEffect(() => {
    if (isEdit) return;
    
    const subscription = form.watch((data) => {
      // Limpar timer anterior
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      
      // Configurar novo timer de 2 segundos
      debounceTimerRef.current = setTimeout(() => {
        saveDraft(data);
      }, 2000);
    });
    
    return () => {
      subscription.unsubscribe();
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [form, saveDraft, isEdit]);
  
  // Delete draft after successful event creation
  const deleteDraft = async () => {
    try {
      await apiRequest('/api/events/draft', { method: 'DELETE' });
      console.log("[AutoSave] Rascunho deletado após criação do evento");
    } catch (error) {
      console.error("[AutoSave] Erro ao deletar rascunho:", error);
    }
  };

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
    console.log("[Debug EventForm] Iniciando submit com dados:", data);
    setIsSubmitting(true);
    try {
      // Preparar os dados para envio com garantia de tipo correto
      const formData = {
        ...data,
        // Garantir que o formato seja explicitamente definido
        format: data.format || 'in_person',
        // Converter datas corretamente
        startDate: data.startDate,
        endDate: data.endDate || data.startDate,
        // Incluir a URL da imagem de capa
        coverImageUrl: data.coverImageUrl || "",
      };
      
      // Garantir que o meetingUrl seja incluído quando o formato for online ou híbrido
      if (formData.format === "online" || formData.format === "hybrid") {
        formData.meetingUrl = data.meetingUrl || "";
      } else {
        // Para eventos presenciais, limpar o meetingUrl
        formData.meetingUrl = "";
      }
      
      console.log("[Debug EventForm] Dados finais para envio:", formData);
      console.log("[Debug EventForm] isEdit:", isEdit, "eventId:", eventId);

      if (isEdit && eventId) {
        // Update existing event
        console.log("[Debug EventForm] Enviando dados para atualização:", formData);
        const response = await apiRequest(
          `/api/events/${eventId}`, 
          { 
            method: "PUT", 
            body: formData
          }
        );
        
        if (!response.ok) {
          const errorData = await response.text();
          console.error("[Debug EventForm] Erro na resposta:", response.status, errorData);
          throw new Error(`Erro ${response.status}: ${errorData}`);
        }
        
        const updatedEvent = await response.json();
        console.log("[Debug EventForm] Evento atualizado com sucesso:", updatedEvent);
        
        toast({
          title: "Evento atualizado",
          description: "O evento foi atualizado com sucesso!",
        });
        navigate(`/events/${eventId}`);
      } else {
        // Create new event
        console.log("[Debug EventForm] Enviando dados para criação:", formData);
        const response = await apiRequest(
          "/api/events", 
          { 
            method: "POST", 
            body: formData
          }
        );
        
        if (!response.ok) {
          const errorData = await response.text();
          console.error("[Debug EventForm] Erro na resposta:", response.status, errorData);
          throw new Error(`Erro ${response.status}: ${errorData}`);
        }
        
        const newEvent = await response.json();
        console.log("[Debug EventForm] Evento criado com sucesso:", newEvent);
        
        // Deletar o rascunho após criar o evento
        await deleteDraft();
        
        toast({
          title: "Evento criado",
          description: "O evento foi criado com sucesso!",
        });
        navigate(`/events/${newEvent.id}`);
      }
    } catch (error) {
      console.error("[Debug EventForm] Erro detalhado ao salvar evento:", error);
      toast({
        title: "Erro ao salvar evento",
        description: error instanceof Error ? error.message : "Não foi possível salvar o evento. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    console.log("[Debug EventForm] Form submit triggered");
    console.log("[Debug EventForm] Form state:", form.formState);
    console.log("[Debug EventForm] Form errors:", form.formState.errors);
    console.log("[Debug EventForm] Form values:", form.getValues());
    e.preventDefault();
    form.handleSubmit(onSubmit, (errors) => {
      console.log("[Debug EventForm] Validation errors:", errors);
    })(e);
  };

  // Render save status indicator
  const renderSaveStatus = () => {
    if (isEdit) return null;
    
    return (
      <div className="flex items-center gap-2 text-sm">
        {saveStatus === 'saving' && (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
            <span className="text-muted-foreground">Salvando...</span>
          </>
        )}
        {saveStatus === 'saved' && (
          <>
            <Cloud className="w-4 h-4 text-green-500" />
            <span className="text-green-500">Salvo automaticamente</span>
          </>
        )}
        {saveStatus === 'error' && (
          <>
            <CloudOff className="w-4 h-4 text-red-500" />
            <span className="text-red-500">Erro ao salvar</span>
          </>
        )}
      </div>
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={handleFormSubmit} className="space-y-6">
        {/* Auto-save status indicator */}
        {!isEdit && (
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Cloud className="w-4 h-4" />
              <span>Salvamento automático ativado</span>
            </div>
            {renderSaveStatus()}
          </div>
        )}
        
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
                              <i className="fas fa-spinner text-2xl text-foreground" />
                            </div>
                            <p className="text-sm text-muted-foreground">Carregando imagem...</p>
                          </div>
                        ) : (
                          <>
                            <Upload className="w-10 h-10 text-foreground mb-2" />
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
            
        {/* Grid otimizado para mobile - colunas únicas no mobile, duas colunas no desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {/* Formato do evento - como primeiro campo usando chips/badges */}
          <FormField
            control={form.control}
            name="format"
            render={({ field }) => (
              <FormItem className="col-span-full">
                <FormLabel>Formato do evento</FormLabel>
                <div className="flex flex-wrap gap-3 mt-1.5">
                  <Badge 
                    variant={field.value === "in_person" ? "default" : "outline"}
                    className={`px-4 py-3 md:py-2 cursor-pointer hover:bg-primary/90 transition-colors flex items-center gap-2 ${field.value === "in_person" ? "bg-primary text-white" : "bg-background hover:bg-secondary/40"}`}
                    onClick={() => {
                      field.onChange("in_person");
                      setEventFormat("in_person");
                    }}
                  >
                    <Users className="w-4 h-4 text-current" />
                    Presencial
                  </Badge>
                  <Badge 
                    variant={field.value === "online" ? "default" : "outline"}
                    className={`px-4 py-3 md:py-2 cursor-pointer hover:bg-primary/90 transition-colors flex items-center gap-2 ${field.value === "online" ? "bg-primary text-white" : "bg-background hover:bg-secondary/40"}`}
                    onClick={() => {
                      field.onChange("online");
                      setEventFormat("online");
                    }}
                  >
                    <Video className="w-4 h-4 text-current" />
                    Online
                  </Badge>
                  <Badge 
                    variant={field.value === "hybrid" ? "default" : "outline"}
                    className={`px-4 py-3 md:py-2 cursor-pointer hover:bg-primary/90 transition-colors flex items-center gap-2 ${field.value === "hybrid" ? "bg-primary text-white" : "bg-background hover:bg-secondary/40"}`}
                    onClick={() => {
                      field.onChange("hybrid");
                      setEventFormat("hybrid");
                    }}
                  >
                    <UserCog className="w-4 h-4 text-current" />
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
                    {/* Eventos Sociais */}
                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground bg-muted/50 sticky top-0">
                      🎉 Eventos Sociais
                    </div>
                    <SelectItem value="wedding">Casamento</SelectItem>
                    <SelectItem value="birthday">Aniversário</SelectItem>
                    <SelectItem value="baby_shower">Chá Revelação</SelectItem>
                    <SelectItem value="bachelor_party">Despedida de Solteiro(a)</SelectItem>
                    <SelectItem value="kids_party">Festa Infantil</SelectItem>
                    <SelectItem value="sweet_15">Festa de 15 Anos</SelectItem>
                    <SelectItem value="graduation">Formatura</SelectItem>
                    <SelectItem value="family_reunion">Encontro de Família</SelectItem>
                    <SelectItem value="religious_celebration">Celebração Religiosa</SelectItem>
                    <SelectItem value="special_dinner">Jantar Especial</SelectItem>
                    
                    {/* Eventos Profissionais */}
                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground bg-muted/50 sticky top-0 mt-1">
                      🧑‍💼 Eventos Profissionais
                    </div>
                    <SelectItem value="corporate">Corporativo</SelectItem>
                    <SelectItem value="conference">Conferência</SelectItem>
                    <SelectItem value="convention">Convenção</SelectItem>
                    <SelectItem value="workshop">Workshop</SelectItem>
                    <SelectItem value="training">Treinamento</SelectItem>
                    <SelectItem value="product_launch">Lançamento de Produto</SelectItem>
                    <SelectItem value="trade_show">Feira / Exposição</SelectItem>
                    <SelectItem value="hackathon">Hackathon</SelectItem>
                    <SelectItem value="business_cocktail">Coquetel Empresarial</SelectItem>
                    <SelectItem value="networking">Encontro de Networking</SelectItem>
                    
                    {/* Outros Eventos */}
                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground bg-muted/50 sticky top-0 mt-1">
                      🎭 Outros Eventos
                    </div>
                    <SelectItem value="festival">Festival</SelectItem>
                    <SelectItem value="show">Show / Espetáculo</SelectItem>
                    <SelectItem value="sports_event">Evento Esportivo</SelectItem>
                    <SelectItem value="academic_event">Evento Acadêmico</SelectItem>
                    <SelectItem value="charity_event">Evento Beneficente</SelectItem>
                    <SelectItem value="online_event">Evento Online</SelectItem>
                    <SelectItem value="hybrid_event">Evento Híbrido</SelectItem>
                    <SelectItem value="other">Outro</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Date/Time fields reorganized for better mobile responsiveness */}
          {/* Col-span-full for mobile, but md:col-span-1 for desktop to maintain grid */}
          <div className="col-span-full md:col-span-1 space-y-4">
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data de início</FormLabel>
                  <FormControl>
                    <Input 
                      type="date" 
                      className="date-input text-foreground dark:text-white dark:bg-slate-900 [&::-webkit-calendar-picker-indicator]:bg-transparent [&::-webkit-calendar-picker-indicator]:dark:filter-none dark:[&::-webkit-calendar-picker-indicator]:opacity-100 dark:[&::-webkit-calendar-picker-indicator]:invert"
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
              name="startTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Horário de início</FormLabel>
                  <FormControl>
                    <Input 
                      type="time" 
                      className="time-input text-foreground dark:text-white dark:bg-slate-900 [&::-webkit-calendar-picker-indicator]:bg-transparent [&::-webkit-calendar-picker-indicator]:dark:filter-none dark:[&::-webkit-calendar-picker-indicator]:opacity-100 dark:[&::-webkit-calendar-picker-indicator]:invert"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="col-span-full md:col-span-1 space-y-4">
            <FormField
              control={form.control}
              name="endDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data de término</FormLabel>
                  <FormControl>
                    <Input 
                      type="date" 
                      className="date-input text-foreground dark:text-white dark:bg-slate-900 [&::-webkit-calendar-picker-indicator]:bg-transparent [&::-webkit-calendar-picker-indicator]:dark:filter-none dark:[&::-webkit-calendar-picker-indicator]:opacity-100 dark:[&::-webkit-calendar-picker-indicator]:invert"
                      {...field} 
                    />
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
                    <Input 
                      type="time" 
                      className="time-input text-foreground dark:text-white dark:bg-slate-900 [&::-webkit-calendar-picker-indicator]:bg-transparent [&::-webkit-calendar-picker-indicator]:dark:filter-none dark:[&::-webkit-calendar-picker-indicator]:opacity-100 dark:[&::-webkit-calendar-picker-indicator]:invert"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

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
                  className="h-20 md:h-24"
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

        {/* Action buttons that stack on mobile */}
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(isEdit && eventId ? `/events/${eventId}` : "/events")}
            disabled={isSubmitting}
            className="w-full sm:w-auto"
          >
            Cancelar
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full sm:w-auto"
          >
            {isSubmitting ? (
              <>
                <span className="animate-spin mr-2">
                  <i className="fas fa-spinner text-current" />
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
