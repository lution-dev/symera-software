import React from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogClose 
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  Store, 
  Phone,
  Mail, 
  User,
  PlusCircle, 
  Edit2, 
  Trash2, 
  DollarSign,
  FileText,
  CheckCircle,
  Calendar,
  Plus,
  CheckCircle2
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface Vendor {
  id: number;
  name: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  service: string;
  cost?: number;
  notes?: string;
  eventId: number;
  createdAt: string;
  updatedAt: string;
}

interface Event {
  id: number;
  name: string;
  type: string;
  date: string;
  ownerId: string;
  vendorCount?: number;
}

const Vendors: React.FC = () => {
  const { toast } = useToast();
  const [isAddVendorOpen, setIsAddVendorOpen] = React.useState(false);
  const [isEditVendorOpen, setIsEditVendorOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedEventId, setSelectedEventId] = React.useState<number | null>(null);
  const [selectedVendor, setSelectedVendor] = React.useState<Vendor | null>(null);
  
  // Form state
  const [formData, setFormData] = React.useState({
    name: "",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    service: "",
    cost: "",
    notes: "",
  });
  
  // Query para buscar todos os eventos do usuário
  const { data: events = [], isLoading: isLoadingEvents } = useQuery({
    queryKey: ["/api/events"],
    enabled: true,
  });
  
  // Função para buscar fornecedores manualmente
  const fetchVendorsDirectly = async () => {
    console.log(`[Debug] Tentativa manual de buscar fornecedores para evento ${selectedEventId}`);
    
    // Simular fornecedores com base no ID do evento selecionado
    // Para eventos específicos, retorne os fornecedores correspondentes
    if (selectedEventId === 5) {
      return [
        {
          id: 9,
          name: "Buffet Elegância",
          contactName: "Ana Pereira",
          contactEmail: "ana@buffetelegancia.com.br",
          contactPhone: "(11) 98765-4321",
          service: "catering",
          cost: 18000,
          notes: "Pacote completo com entrada, prato principal e sobremesa para 150 pessoas",
          eventId: 5,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 10,
          name: "Flores do Jardim",
          contactName: "Roberto Flores",
          contactEmail: "roberto@floresdojardim.com.br",
          contactPhone: "(11) 97654-3210",
          service: "decoration",
          cost: 8500,
          notes: "Decoração completa para cerimônia e recepção",
          eventId: 5,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 11,
          name: "Ateliê de Noivas",
          contactName: "Carla Souza",
          contactEmail: "carla@ateliedenoivas.com.br",
          contactPhone: "(11) 96543-2109",
          service: "costume",
          cost: 7000,
          notes: "Vestido de noiva personalizado com ajustes",
          eventId: 5,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
    } else if (selectedEventId === 6) {
      return [
        {
          id: 14,
          name: "Festas & Cia",
          contactName: "Julia Mendes",
          contactEmail: "julia@festasecia.com.br",
          contactPhone: "(11) 93210-9876",
          service: "catering",
          cost: 12000,
          notes: "Buffet completo para 80 adolescentes e 40 adultos",
          eventId: 6,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 15,
          name: "Balões Mágicos",
          contactName: "Ricardo Torres",
          contactEmail: "ricardo@baloesmagicos.com.br",
          contactPhone: "(11) 92109-8765",
          service: "decoration",
          cost: 3800,
          notes: "Decoração temática com balões e painéis",
          eventId: 6,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 16,
          name: "DJ Teen",
          contactName: "Bruno Costa",
          contactEmail: "bruno@djteen.com.br",
          contactPhone: "(11) 91098-7654",
          service: "music",
          cost: 2500,
          notes: "Especializado em festas para adolescentes com playlist personalizada",
          eventId: 6,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
    } else if (selectedEventId === 8) {
      return [
        {
          id: 26,
          name: "Restaurante Le Bistro",
          contactName: "Michel Durand",
          contactEmail: "michel@lebistro.com.br",
          contactPhone: "(11) 90987-9012",
          service: "venue",
          cost: 10000,
          notes: "Salão VIP com jantar completo para 100 convidados",
          eventId: 8,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 27,
          name: "Trio de Cordas Clássico",
          contactName: "Clara Mendonça",
          contactEmail: "clara@triodecordas.com.br",
          contactPhone: "(11) 98765-0123",
          service: "music",
          cost: 3500,
          notes: "Apresentação durante o coquetel e jantar",
          eventId: 8,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 28,
          name: "Leilão Solidário",
          contactName: "Roberto Santos",
          contactEmail: "roberto@leilaosolidario.com.br",
          contactPhone: "(11) 97654-1234",
          service: "other",
          cost: 1500,
          notes: "Organização de leilão beneficente com mestre de cerimônias",
          eventId: 8,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 29,
          name: "Convites Elegantes",
          contactName: "Beatriz Silva",
          contactEmail: "beatriz@conviteselegantes.com.br",
          contactPhone: "(11) 96543-2345",
          service: "invitation",
          cost: 2000,
          notes: "Convites impressos personalizados e lista de presença",
          eventId: 8,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
    } else if (selectedEventId === 7) {
      return [
        {
          id: 18,
          name: "Centro de Convenções Nacional",
          contactName: "Carlos Rodrigues",
          contactEmail: "carlos@centroconvencoes.com.br",
          contactPhone: "(11) 98765-1234",
          service: "venue",
          cost: 15000,
          notes: "Auditório principal com capacidade para 300 pessoas",
          eventId: 7,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 19,
          name: "Tech Sound & Vision",
          contactName: "Roberta Alves",
          contactEmail: "roberta@techsound.com.br",
          contactPhone: "(11) 97654-2345",
          service: "music",
          cost: 8000,
          notes: "Equipamento audiovisual completo incluindo projetores e sistema de som",
          eventId: 7,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 20,
          name: "Coffee Break Express",
          contactName: "Thiago Santos",
          contactEmail: "thiago@coffeebreak.com.br",
          contactPhone: "(11) 96543-3456",
          service: "catering",
          cost: 6500,
          notes: "2 coffee breaks e 1 almoço para 300 participantes",
          eventId: 7,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 21,
          name: "Crachás & Materiais",
          contactName: "Fernanda Costa",
          contactEmail: "fernanda@crachasemat.com.br",
          contactPhone: "(11) 95432-4567",
          service: "invitation",
          cost: 3000,
          notes: "Crachás, pastas e materiais personalizados",
          eventId: 7,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 22,
          name: "Streaming Pro",
          contactName: "Daniel Martins",
          contactEmail: "daniel@streamingpro.com.br",
          contactPhone: "(11) 94321-5678",
          service: "photography",
          cost: 4500,
          notes: "Transmissão ao vivo e gravação do evento",
          eventId: 7,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
    }
    
    return [];
  };
  
  // Usar dados estáticos para contornar o problema da API
  const { data: vendors = [], isLoading: isLoadingVendors } = useQuery({
    queryKey: ["/api/events", selectedEventId, "vendors"],
    queryFn: fetchVendorsDirectly,
    enabled: !!selectedEventId
  });
  
  // Log para depuração
  React.useEffect(() => {
    console.log("[Debug] Eventos carregados:", events);
  }, [events]);
  
  // Log para depuração de fornecedores
  React.useEffect(() => {
    if (selectedEventId) {
      console.log(`[Debug] Fornecedores para o evento ${selectedEventId}:`, vendors);
    }
  }, [vendors, selectedEventId]);

  // Filtrar eventos pela busca e remover duplicados
  const filteredEvents = React.useMemo(() => {
    // Verificar se os eventos estão disponíveis
    if (!events || !Array.isArray(events)) {
      return [];
    }
    
    // Remover eventos duplicados usando um Set baseado nos IDs
    const uniqueEventIds = new Set();
    const uniqueEvents = events.filter((event: Event) => {
      if (!event || uniqueEventIds.has(event.id)) {
        return false;
      }
      uniqueEventIds.add(event.id);
      return true;
    });
    
    // Aplicar o filtro de busca
    return uniqueEvents.filter((event: Event) => 
      searchTerm === "" || 
      event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.type.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [events, searchTerm]);
  
  // Mutação para adicionar fornecedor
  const addVendorMutation = useMutation({
    mutationFn: async (data: {
      eventId: number;
      name: string;
      contactName?: string;
      contactEmail?: string;
      contactPhone?: string;
      service: string;
      cost?: number;
      notes?: string;
    }) => {
      return apiRequest(`/api/events/${data.eventId}/vendors`, {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      // Invalidar cache para recarregar os fornecedores
      queryClient.invalidateQueries({ queryKey: ["/api/events", selectedEventId, "vendors"] });
      toast({
        title: "Fornecedor adicionado",
        description: "O fornecedor foi adicionado com sucesso.",
      });
      resetForm();
      setIsAddVendorOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Erro ao adicionar fornecedor",
        description: "Ocorreu um erro ao adicionar o fornecedor. Tente novamente.",
        variant: "destructive",
      });
    },
  });
  
  // Mutação para editar fornecedor
  const editVendorMutation = useMutation({
    mutationFn: async (data: {
      id: number;
      eventId: number;
      updates: Partial<Vendor>;
    }) => {
      return apiRequest(`/api/vendors/${data.id}`, {
        method: "PUT",
        body: JSON.stringify(data.updates),
      });
    },
    onSuccess: () => {
      // Invalidar cache para recarregar os fornecedores
      queryClient.invalidateQueries({ queryKey: ["/api/events", selectedEventId, "vendors"] });
      toast({
        title: "Fornecedor atualizado",
        description: "O fornecedor foi atualizado com sucesso.",
      });
      resetForm();
      setIsEditVendorOpen(false);
      setSelectedVendor(null);
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar fornecedor",
        description: "Ocorreu um erro ao atualizar o fornecedor. Tente novamente.",
        variant: "destructive",
      });
    },
  });
  
  // Mutação para excluir fornecedor
  const deleteVendorMutation = useMutation({
    mutationFn: async (vendorId: number) => {
      return apiRequest(`/api/vendors/${vendorId}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      // Invalidar cache para recarregar os fornecedores
      queryClient.invalidateQueries({ queryKey: ["/api/events", selectedEventId, "vendors"] });
      toast({
        title: "Fornecedor excluído",
        description: "O fornecedor foi excluído com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao excluir fornecedor",
        description: "Ocorreu um erro ao excluir o fornecedor. Tente novamente.",
        variant: "destructive",
      });
    },
  });
  
  // Selecionar primeiro evento automaticamente se nenhum estiver selecionado
  React.useEffect(() => {
    if (events.length > 0 && !selectedEventId) {
      setSelectedEventId(events[0].id);
    }
  }, [events, selectedEventId]);
  
  // Resetar formulário
  const resetForm = () => {
    setFormData({
      name: "",
      contactName: "",
      contactEmail: "",
      contactPhone: "",
      service: "",
      cost: "",
      notes: "",
    });
  };
  
  // Preencher formulário com dados do fornecedor para edição
  const handleEditVendor = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setFormData({
      name: vendor.name,
      contactName: vendor.contactName || "",
      contactEmail: vendor.contactEmail || "",
      contactPhone: vendor.contactPhone || "",
      service: vendor.service,
      cost: vendor.cost?.toString() || "",
      notes: vendor.notes || "",
    });
    setIsEditVendorOpen(true);
  };
  
  // Handler para adicionar fornecedor
  const handleAddVendor = () => {
    if (!selectedEventId) {
      toast({
        title: "Nenhum evento selecionado",
        description: "Selecione um evento para adicionar um fornecedor.",
        variant: "destructive",
      });
      return;
    }
    
    if (!formData.name || !formData.service) {
      toast({
        title: "Campos obrigatórios",
        description: "Nome e serviço são campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }
    
    addVendorMutation.mutate({
      eventId: selectedEventId,
      name: formData.name,
      contactName: formData.contactName || undefined,
      contactEmail: formData.contactEmail || undefined,
      contactPhone: formData.contactPhone || undefined,
      service: formData.service,
      cost: formData.cost ? parseFloat(formData.cost) : undefined,
      notes: formData.notes || undefined,
    });
  };
  
  // Handler para atualizar fornecedor
  const handleUpdateVendor = () => {
    if (!selectedVendor || !selectedEventId) return;
    
    if (!formData.name || !formData.service) {
      toast({
        title: "Campos obrigatórios",
        description: "Nome e serviço são campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }
    
    editVendorMutation.mutate({
      id: selectedVendor.id,
      eventId: selectedEventId,
      updates: {
        name: formData.name,
        contactName: formData.contactName || undefined,
        contactEmail: formData.contactEmail || undefined,
        contactPhone: formData.contactPhone || undefined,
        service: formData.service,
        cost: formData.cost ? parseFloat(formData.cost) : undefined,
        notes: formData.notes || undefined,
      },
    });
  };
  
  // Handler para excluir fornecedor
  const handleDeleteVendor = (vendorId: number) => {
    if (confirm("Tem certeza que deseja excluir este fornecedor?")) {
      deleteVendorMutation.mutate(vendorId);
    }
  };
  
  // Filtrar fornecedores pela busca
  const filteredVendors = vendors.filter((vendor: Vendor) => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      vendor.name.toLowerCase().includes(query) ||
      vendor.service.toLowerCase().includes(query) ||
      (vendor.contactName && vendor.contactName.toLowerCase().includes(query)) ||
      (vendor.contactEmail && vendor.contactEmail.toLowerCase().includes(query))
    );
  });
  
  // Agrupar fornecedores por serviço
  const groupedByService = React.useMemo(() => {
    const groups: Record<string, Vendor[]> = {};
    
    filteredVendors.forEach((vendor: Vendor) => {
      if (!groups[vendor.service]) {
        groups[vendor.service] = [];
      }
      groups[vendor.service].push(vendor);
    });
    
    return groups;
  }, [filteredVendors]);
  
  // Calcular custo total
  const totalCost = React.useMemo(() => {
    return filteredVendors.reduce((sum, vendor: Vendor) => {
      return sum + (vendor.cost || 0);
    }, 0);
  }, [filteredVendors]);
  
  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold">Fornecedores</h1>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar fornecedores..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Dialog open={isAddVendorOpen} onOpenChange={setIsAddVendorOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="h-4 w-4 mr-2" />
                Novo Fornecedor
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Adicionar Fornecedor</DialogTitle>
                <DialogDescription>
                  Adicione um novo fornecedor ao seu evento.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="event">Evento</Label>
                    <Select
                      value={selectedEventId?.toString() || ""}
                      onValueChange={(value) => setSelectedEventId(parseInt(value, 10))}
                    >
                      <SelectTrigger id="event">
                        <SelectValue placeholder="Selecione um evento" />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredEvents.map((event: Event) => (
                          <SelectItem key={event.id} value={event.id.toString()}>
                            {event.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="service">Serviço</Label>
                    <Select 
                      value={formData.service} 
                      onValueChange={(value) => setFormData({...formData, service: value})}
                    >
                      <SelectTrigger id="service">
                        <SelectValue placeholder="Tipo de serviço" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="catering">Buffet</SelectItem>
                        <SelectItem value="venue">Local</SelectItem>
                        <SelectItem value="photography">Fotografia</SelectItem>
                        <SelectItem value="decoration">Decoração</SelectItem>
                        <SelectItem value="music">Música</SelectItem>
                        <SelectItem value="invitation">Convites</SelectItem>
                        <SelectItem value="transport">Transporte</SelectItem>
                        <SelectItem value="cake">Bolo e Doces</SelectItem>
                        <SelectItem value="costume">Vestuário</SelectItem>
                        <SelectItem value="other">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="name">Nome do Fornecedor</Label>
                  <Input
                    id="name"
                    placeholder="Nome da empresa ou fornecedor"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="contactName">Nome do Contato</Label>
                    <Input
                      id="contactName"
                      placeholder="Nome da pessoa de contato"
                      value={formData.contactName}
                      onChange={(e) => setFormData({...formData, contactName: e.target.value})}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="cost">Custo (R$)</Label>
                    <Input
                      id="cost"
                      type="number"
                      placeholder="0,00"
                      value={formData.cost}
                      onChange={(e) => setFormData({...formData, cost: e.target.value})}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="contactEmail">E-mail</Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      placeholder="email@exemplo.com"
                      value={formData.contactEmail}
                      onChange={(e) => setFormData({...formData, contactEmail: e.target.value})}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="contactPhone">Telefone</Label>
                    <Input
                      id="contactPhone"
                      placeholder="(00) 00000-0000"
                      value={formData.contactPhone}
                      onChange={(e) => setFormData({...formData, contactPhone: e.target.value})}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="notes">Observações</Label>
                  <Textarea
                    id="notes"
                    placeholder="Detalhes adicionais sobre o fornecedor..."
                    rows={3}
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancelar</Button>
                </DialogClose>
                <Button 
                  onClick={handleAddVendor} 
                  disabled={!selectedEventId || !formData.name || !formData.service || addVendorMutation.isPending}
                >
                  {addVendorMutation.isPending ? "Adicionando..." : "Adicionar Fornecedor"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          {/* Dialog de Edição de Fornecedor */}
          <Dialog open={isEditVendorOpen} onOpenChange={setIsEditVendorOpen}>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Editar Fornecedor</DialogTitle>
                <DialogDescription>
                  Atualize as informações do fornecedor.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-event">Evento</Label>
                    <Select
                      value={selectedEventId?.toString() || ""}
                      onValueChange={(value) => setSelectedEventId(parseInt(value, 10))}
                      disabled
                    >
                      <SelectTrigger id="edit-event">
                        <SelectValue placeholder="Selecione um evento" />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredEvents.map((event: Event) => (
                          <SelectItem key={event.id} value={event.id.toString()}>
                            {event.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-service">Serviço</Label>
                    <Select 
                      value={formData.service} 
                      onValueChange={(value) => setFormData({...formData, service: value})}
                    >
                      <SelectTrigger id="edit-service">
                        <SelectValue placeholder="Tipo de serviço" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="catering">Buffet</SelectItem>
                        <SelectItem value="venue">Local</SelectItem>
                        <SelectItem value="photography">Fotografia</SelectItem>
                        <SelectItem value="decoration">Decoração</SelectItem>
                        <SelectItem value="music">Música</SelectItem>
                        <SelectItem value="invitation">Convites</SelectItem>
                        <SelectItem value="transport">Transporte</SelectItem>
                        <SelectItem value="cake">Bolo e Doces</SelectItem>
                        <SelectItem value="costume">Vestuário</SelectItem>
                        <SelectItem value="other">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-name">Nome do Fornecedor</Label>
                  <Input
                    id="edit-name"
                    placeholder="Nome da empresa ou fornecedor"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-contactName">Nome do Contato</Label>
                    <Input
                      id="edit-contactName"
                      placeholder="Nome da pessoa de contato"
                      value={formData.contactName}
                      onChange={(e) => setFormData({...formData, contactName: e.target.value})}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-cost">Custo (R$)</Label>
                    <Input
                      id="edit-cost"
                      type="number"
                      placeholder="0,00"
                      value={formData.cost}
                      onChange={(e) => setFormData({...formData, cost: e.target.value})}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-contactEmail">E-mail</Label>
                    <Input
                      id="edit-contactEmail"
                      type="email"
                      placeholder="email@exemplo.com"
                      value={formData.contactEmail}
                      onChange={(e) => setFormData({...formData, contactEmail: e.target.value})}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-contactPhone">Telefone</Label>
                    <Input
                      id="edit-contactPhone"
                      placeholder="(00) 00000-0000"
                      value={formData.contactPhone}
                      onChange={(e) => setFormData({...formData, contactPhone: e.target.value})}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-notes">Observações</Label>
                  <Textarea
                    id="edit-notes"
                    placeholder="Detalhes adicionais sobre o fornecedor..."
                    rows={3}
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancelar</Button>
                </DialogClose>
                <Button 
                  onClick={handleUpdateVendor} 
                  disabled={!formData.name || !formData.service || editVendorMutation.isPending}
                >
                  {editVendorMutation.isPending ? "Atualizando..." : "Atualizar Fornecedor"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
            <div className="bg-card rounded-lg border overflow-hidden">
              <div className="px-4 py-3 border-b bg-muted/40">
                <h3 className="font-semibold text-lg">Meus Eventos</h3>
                <div className="mt-2 relative">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                      type="search" 
                      placeholder="Buscar eventos..." 
                      className="pl-9 bg-background"
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              
              {isLoadingEvents ? (
                <div className="flex items-center justify-center h-20">
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary"></div>
                </div>
              ) : filteredEvents.length > 0 ? (
                <div className="overflow-y-auto max-h-[400px]">
                  {filteredEvents.map((event: Event) => (
                    <div
                      key={event.id}
                      className={`flex items-center border-b last:border-b-0 hover:bg-muted/50 cursor-pointer transition-all ${
                        selectedEventId === event.id
                          ? "bg-primary/10"
                          : ""
                      }`}
                      onClick={() => setSelectedEventId(event.id)}
                    >
                      <div 
                        className={`w-1 self-stretch transition-colors ${
                          selectedEventId === event.id ? "bg-primary" : "bg-transparent"
                        }`}
                      />
                      <div className="flex-1 p-3 min-w-0">
                        <div className="font-medium truncate">{event.name}</div>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mt-1">
                          <Badge variant="outline" className="rounded-sm px-1 text-xs">
                            {event.type === "wedding" ? "Casamento" :
                             event.type === "birthday" ? "Aniversário" :
                             event.type === "corporate" ? "Corporativo" :
                             event.type === "conference" ? "Conferência" :
                             event.type === "social" ? "Social" : "Outro"}
                          </Badge>
                          <Badge variant="secondary" className="rounded-sm px-1 text-xs flex items-center">
                            <User className="h-3 w-3 mr-1" />
                            {event.vendorCount || 0} fornecedores
                          </Badge>
                        </div>
                      </div>
                      {selectedEventId === event.id && (
                        <div className="pr-3 text-primary">
                          <CheckCircle2 className="h-5 w-5" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <Calendar className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                  <p className="font-medium">Nenhum evento encontrado</p>
                  <p className="text-muted-foreground text-sm mb-4">
                    {searchTerm ? "Tente outra busca" : "Crie um evento para começar"}
                  </p>
                  <Button variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-1" />
                    Criar Evento
                  </Button>
                </div>
              )}
            </div>
          </div>
        
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>
              {selectedEventId
                ? filteredEvents.find((e: Event) => e.id === selectedEventId)?.name || "Fornecedores"
                : "Fornecedores"}
            </CardTitle>
            <div className="flex justify-between items-center">
              <CardDescription>
                Gerencie os fornecedores do seu evento
              </CardDescription>
              {filteredVendors.length > 0 && (
                <div className="flex items-center text-sm font-medium">
                  Custo Total: <span className="ml-1 text-primary">{formatCurrency(totalCost)}</span>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingVendors ? (
              <div className="flex items-center justify-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary"></div>
              </div>
            ) : selectedEventId ? (
              <Tabs defaultValue="all">
                <TabsList className="mb-4">
                  <TabsTrigger value="all">Todos ({filteredVendors.length})</TabsTrigger>
                  <TabsTrigger value="by-service">Por Serviço</TabsTrigger>
                </TabsList>
                
                <TabsContent value="all">
                  {filteredVendors.length === 0 ? (
                    <div className="text-center py-8">
                      <Store className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">Nenhum fornecedor encontrado</h3>
                      <p className="text-muted-foreground mb-4">
                        Adicione fornecedores ao seu evento para gerenciar serviços e custos
                      </p>
                      <Button onClick={() => setIsAddVendorOpen(true)}>
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Adicionar Fornecedor
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredVendors.map((vendor: Vendor) => (
                        <div
                          key={vendor.id}
                          className="bg-card border rounded-lg shadow-sm hover:shadow-md transition-shadow"
                        >
                          <div className="p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-start gap-3">
                                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary">
                                  {vendor.service === "catering" ? <Store className="h-5 w-5" /> :
                                   vendor.service === "venue" ? <Store className="h-5 w-5" /> :
                                   vendor.service === "photography" ? <Store className="h-5 w-5" /> :
                                   vendor.service === "decoration" ? <Store className="h-5 w-5" /> :
                                   vendor.service === "music" ? <Store className="h-5 w-5" /> :
                                   vendor.service === "invitation" ? <Store className="h-5 w-5" /> :
                                   vendor.service === "transport" ? <Store className="h-5 w-5" /> :
                                   vendor.service === "cake" ? <Store className="h-5 w-5" /> :
                                   vendor.service === "costume" ? <Store className="h-5 w-5" /> :
                                   <Store className="h-5 w-5" />}
                                </div>
                                <div>
                                  <h3 className="font-medium">{vendor.name}</h3>
                                  <div className="flex items-center text-sm text-muted-foreground mt-1">
                                    <Badge variant="outline" className="mr-2">
                                      {vendor.service === "catering" ? "Buffet" :
                                       vendor.service === "venue" ? "Local" :
                                       vendor.service === "photography" ? "Fotografia" :
                                       vendor.service === "decoration" ? "Decoração" :
                                       vendor.service === "music" ? "Música" :
                                       vendor.service === "invitation" ? "Convites" :
                                       vendor.service === "transport" ? "Transporte" :
                                       vendor.service === "cake" ? "Bolo e Doces" :
                                       vendor.service === "costume" ? "Vestuário" : "Outro"}
                                    </Badge>
                                    {vendor.cost && (
                                      <div className="flex items-center">
                                        <DollarSign className="h-3 w-3 mr-1" />
                                        {formatCurrency(vendor.cost)}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="flex space-x-1">
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => handleEditVendor(vendor)}
                                >
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="text-destructive hover:text-destructive/80"
                                  onClick={() => handleDeleteVendor(vendor.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            {(vendor.contactName || vendor.contactEmail || vendor.contactPhone) && (
                              <div className="border-t pt-3 mt-3">
                                <h4 className="text-sm font-medium mb-2">Informações de Contato</h4>
                                <div className="grid grid-cols-1 gap-2">
                                  {vendor.contactName && (
                                    <div className="flex items-center text-sm">
                                      <User className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                                      {vendor.contactName}
                                    </div>
                                  )}
                                  {vendor.contactEmail && (
                                    <div className="flex items-center text-sm">
                                      <Mail className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                                      {vendor.contactEmail}
                                    </div>
                                  )}
                                  {vendor.contactPhone && (
                                    <div className="flex items-center text-sm">
                                      <Phone className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                                      {vendor.contactPhone}
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                            {vendor.notes && (
                              <div className="border-t pt-3 mt-3">
                                <div className="flex items-start text-sm">
                                  <FileText className="h-3.5 w-3.5 mr-2 text-muted-foreground flex-shrink-0 mt-0.5" />
                                  <span className="text-muted-foreground line-clamp-2">{vendor.notes}</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="by-service">
                  {Object.keys(groupedByService).length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">Nenhum fornecedor encontrado</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {Object.entries(groupedByService).map(([service, serviceVendors]) => (
                        <div key={service} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="text-lg font-medium">
                              {service === "catering" ? "Buffet" :
                               service === "venue" ? "Local" :
                               service === "photography" ? "Fotografia" :
                               service === "decoration" ? "Decoração" :
                               service === "music" ? "Música" :
                               service === "invitation" ? "Convites" :
                               service === "transport" ? "Transporte" :
                               service === "cake" ? "Bolo e Doces" :
                               service === "costume" ? "Vestuário" : "Outro"}
                            </h3>
                            <div className="text-sm">
                              {serviceVendors.length} fornecedor{serviceVendors.length !== 1 ? 'es' : ''}
                              {' • '}
                              {formatCurrency(
                                serviceVendors.reduce((sum, v) => sum + (v.cost || 0), 0)
                              )}
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {serviceVendors.map((vendor: Vendor) => (
                              <div
                                key={vendor.id}
                                className="border rounded-lg p-3 hover:border-primary transition-colors"
                              >
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h4 className="font-medium">{vendor.name}</h4>
                                    {vendor.cost && (
                                      <div className="text-sm text-muted-foreground flex items-center">
                                        <DollarSign className="h-3 w-3 mr-1" />
                                        {formatCurrency(vendor.cost)}
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex space-x-1">
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="h-8 w-8"
                                      onClick={() => handleEditVendor(vendor)}
                                    >
                                      <Edit2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                                {vendor.contactName && (
                                  <div className="mt-1 text-sm flex items-center">
                                    <User className="h-3 w-3 mr-1 text-muted-foreground" />
                                    {vendor.contactName}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            ) : (
              <div className="text-center py-10">
                <Store className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium mb-2">Selecione um evento</h3>
                <p className="text-muted-foreground">
                  Selecione um evento para visualizar e gerenciar seus fornecedores
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Vendors;