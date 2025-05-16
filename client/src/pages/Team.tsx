import React from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  UsersRound, 
  UserPlus, 
  Mail, 
  Phone, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit, 
  Trash, 
  Plus,
  Building, 
  CalendarClock,
  CheckCircle2,
  X, 
  Briefcase, 
  User,
  UserCog,
  Calendar
} from "lucide-react";
import { getInitials, generateProfileImageUrl, getEventTypeLabel } from "@/lib/utils";

interface Team {
  id: number;
  eventId: number;
  userId: string;
  role: string;
  permissions: Record<string, any>;
  createdAt: string;
  user: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    profileImageUrl?: string;
    phone?: string;
  };
}

interface Event {
  id: number;
  name: string;
  type: string;
  date: string;
  location?: string;
  ownerId: string;
  team?: Team[];
}

const Team: React.FC = () => {
  const { toast } = useToast();
  const [isAddMemberOpen, setIsAddMemberOpen] = React.useState(false);
  // Usamos seleção múltipla diretamente no primeiro diálogo
  const [selectedEventId, setSelectedEventId] = React.useState<number | null>(null);
  const [email, setEmail] = React.useState("");
  const [name, setName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [role, setRole] = React.useState("team_member");
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedEvents, setSelectedEvents] = React.useState<number[]>([]);
  const [filterRole, setFilterRole] = React.useState<string | null>(null);
  const [viewMode, setViewMode] = React.useState<"events" | "people">("events");
  
  // Query para buscar todos os eventos do usuário
  const { data: events = [], isLoading: isLoadingEvents } = useQuery({
    queryKey: ["/api/events"],
    enabled: true,
  });
  
  // Buscar dados da equipe a partir dos eventos
  const teamMembers = React.useMemo(() => {
    if (!events || !Array.isArray(events) || !selectedEventId) return [];
    
    const selectedEvent = events.find((event: any) => event.id === selectedEventId);
    if (!selectedEvent) return [];
    
    return selectedEvent.team || [];
  }, [events, selectedEventId]);
  
  // Selecionar primeiro evento automaticamente se nenhum estiver selecionado
  React.useEffect(() => {
    if (events.length > 0 && !selectedEventId) {
      setSelectedEventId(events[0].id);
    }
  }, [events, selectedEventId]);
  
  // Agrupar membros por função
  const organizers = teamMembers.filter((member: Team) => member.role === "organizer");
  const teamMembersOnly = teamMembers.filter((member: Team) => member.role === "team_member");
  const vendors = teamMembers.filter((member: Team) => member.role === "vendor");
  
  // Extrair todos os membros únicos de todos os eventos
  const allTeamMembers = React.useMemo(() => {
    if (!events || !Array.isArray(events)) return [];
    
    const memberMap = new Map();
    
    events.forEach((event: Event) => {
      if (event.team && Array.isArray(event.team)) {
        event.team.forEach((member: Team) => {
          if (!memberMap.has(member.user.id)) {
            memberMap.set(member.user.id, {
              ...member.user,
              events: [{
                eventId: event.id,
                eventName: event.name,
                role: member.role,
                teamMemberId: member.id
              }]
            });
          } else {
            const existing = memberMap.get(member.user.id);
            existing.events.push({
              eventId: event.id,
              eventName: event.name,
              role: member.role,
              teamMemberId: member.id
            });
            memberMap.set(member.user.id, existing);
          }
        });
      }
    });
    
    return Array.from(memberMap.values());
  }, [events]);
  
  // Estado de carregamento
  const isLoadingTeam = false;
  
  // Mutação para adicionar membro à equipe
  const addTeamMemberMutation = useMutation({
    mutationFn: async (data: { eventId: number, email: string, role: string, name?: string, phone?: string }) => {
      return apiRequest(`/api/events/${data.eventId}/team`, {
        method: "POST",
        body: JSON.stringify({
          email: data.email,
          role: data.role,
          name: data.name,
          phone: data.phone
        }),
      });
    },
    onSuccess: () => {
      // Invalidar cache para recarregar os membros da equipe
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      toast({
        title: "Membro adicionado",
        description: "O membro foi adicionado à equipe com sucesso.",
      });
      setEmail("");
      setName("");
      setPhone("");
      setRole("team_member");
      setIsAddMemberOpen(false);
      setSelectedEvents([]);
    },
    onError: (error) => {
      toast({
        title: "Erro ao adicionar membro",
        description: "Ocorreu um erro ao adicionar o membro à equipe. Tente novamente.",
        variant: "destructive",
      });
    },
  });
  
  // Mutação para adicionar membro a múltiplos eventos
  const addTeamMemberToMultipleEventsMutation = useMutation({
    mutationFn: async (data: { eventIds: number[], email: string, role: string, name?: string, phone?: string }) => {
      // Esta é uma simplificação, na verdade precisaríamos fazer múltiplas chamadas
      // ou adicionar um novo endpoint no backend para lidar com isso
      
      // Por enquanto, vamos fazer chamadas sequenciais para cada evento
      const results = [];
      for (const eventId of data.eventIds) {
        const result = await apiRequest(`/api/events/${eventId}/team`, {
          method: "POST",
          body: JSON.stringify({
            email: data.email,
            role: data.role,
            name: data.name,
            phone: data.phone
          }),
        });
        results.push(result);
      }
      return results;
    },
    onSuccess: () => {
      // Invalidar cache para recarregar os membros da equipe
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      toast({
        title: "Membro adicionado a múltiplos eventos",
        description: "O membro foi adicionado aos eventos selecionados com sucesso.",
      });
      setEmail("");
      setName("");
      setPhone("");
      setRole("team_member");
      setIsAddMemberOpen(false);
      setSelectedEvents([]);
    },
    onError: (error) => {
      toast({
        title: "Erro ao adicionar membro",
        description: "Ocorreu um erro ao adicionar o membro a um ou mais eventos. Tente novamente.",
        variant: "destructive",
      });
    },
  });
  
  // Mutação para remover membro da equipe
  const removeTeamMemberMutation = useMutation({
    mutationFn: async (data: { eventId: number, userId: string }) => {
      return apiRequest(`/api/events/${data.eventId}/team/${data.userId}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      // Invalidar cache para recarregar os membros da equipe
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      toast({
        title: "Membro removido",
        description: "O membro foi removido da equipe com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao remover membro",
        description: "Ocorreu um erro ao remover o membro da equipe. Tente novamente.",
        variant: "destructive",
      });
    },
  });
  
  // Este método não é mais usado, já que agora usamos apenas o handleAddMemberToMultipleEvents
  
  // Handler para adicionar membro a múltiplos eventos
  const handleAddMemberToMultipleEvents = () => {
    if (selectedEvents.length === 0) {
      toast({
        title: "Nenhum evento selecionado",
        description: "Selecione pelo menos um evento para adicionar um membro.",
        variant: "destructive",
      });
      return;
    }
    
    if (!email) {
      toast({
        title: "E-mail obrigatório",
        description: "Digite o e-mail do membro que deseja adicionar.",
        variant: "destructive",
      });
      return;
    }
    
    addTeamMemberToMultipleEventsMutation.mutate({
      eventIds: selectedEvents,
      email,
      role,
      name,
      phone
    });
  };
  
  // Handler para remover membro
  const handleRemoveMember = (eventId: number, userId: string) => {    
    if (confirm("Tem certeza que deseja remover este membro da equipe?")) {
      removeTeamMemberMutation.mutate({
        eventId,
        userId,
      });
    }
  };
  
  // Verificar se o usuário atual é o proprietário do evento
  const isEventOwner = (event: Event) => {
    // Implemente a lógica para verificar se o usuário atual é o proprietário
    return true; // Placeholder
  };
  
  // Filtrar eventos
  const filteredEvents = events.filter((event: Event) => 
    event.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Filtrar membros da equipe
  const filteredTeamMembers = allTeamMembers.filter((member: any) => {
    const fullName = `${member.firstName || ''} ${member.lastName || ''}`.trim();
    const searchMatch = 
      fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!searchMatch) return false;
    
    if (filterRole) {
      return member.events.some((e: any) => e.role === filterRole);
    }
    
    return true;
  });
  
  // Toggle seleção de evento para adicionar membro a múltiplos eventos
  const toggleEventSelection = (eventId: number) => {
    if (selectedEvents.includes(eventId)) {
      setSelectedEvents(selectedEvents.filter(id => id !== eventId));
    } else {
      setSelectedEvents([...selectedEvents, eventId]);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Equipe</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie membros da equipe dos seus eventos
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              type="search" 
              placeholder="Buscar..." 
              className="pl-9 w-[200px] md:w-[250px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {viewMode === "people" && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Filtrar por função</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setFilterRole(null)}>
                  Todos
                  {!filterRole && <CheckCircle2 className="ml-auto h-4 w-4" />}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterRole("organizer")}>
                  Organizadores
                  {filterRole === "organizer" && <CheckCircle2 className="ml-auto h-4 w-4" />}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterRole("team_member")}>
                  Membros da equipe
                  {filterRole === "team_member" && <CheckCircle2 className="ml-auto h-4 w-4" />}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterRole("vendor")}>
                  Fornecedores
                  {filterRole === "vendor" && <CheckCircle2 className="ml-auto h-4 w-4" />}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          
          <div className="flex border rounded-md overflow-hidden">
            <Button 
              variant={viewMode === "events" ? "default" : "ghost"} 
              className="rounded-none"
              onClick={() => setViewMode("events")}
            >
              <CalendarClock className="h-4 w-4 mr-2" />
              Eventos
            </Button>
            <Button 
              variant={viewMode === "people" ? "default" : "ghost"} 
              className="rounded-none"
              onClick={() => setViewMode("people")}
            >
              <UsersRound className="h-4 w-4 mr-2" />
              Pessoas
            </Button>
          </div>
          
          <Dialog open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Adicionar Membro
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md max-h-[75vh] overflow-y-auto mt-24 md:mt-6 p-3 md:p-6">
              <DialogHeader className="sticky top-0 bg-background pt-2 pb-2 z-10">
                <DialogTitle>Adicionar Membro à Equipe</DialogTitle>
                <DialogDescription>
                  Adicione um novo membro à equipe do seu evento. Se a pessoa não tiver uma conta, um convite será enviado.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="events" className="mb-2 block">Selecione os eventos</Label>
                  <div className="border rounded-md p-2 h-[120px] overflow-auto">
                    {events.map((event: Event) => (
                      <div 
                        key={event.id} 
                        className="flex items-center p-2 hover:bg-muted rounded mb-1"
                      >
                        <input 
                          type="checkbox" 
                          id={`event-single-${event.id}`}
                          className="mr-2 h-4 w-4"
                          checked={selectedEvents.includes(event.id)}
                          onChange={() => toggleEventSelection(event.id)}
                        />
                        <label 
                          htmlFor={`event-single-${event.id}`}
                          className="flex-1 cursor-pointer"
                        >
                          {event.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Nome completo"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="email@exemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="(00) 00000-0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="role">Função</Label>
                  <Select value={role} onValueChange={setRole}>
                    <SelectTrigger id="role">
                      <SelectValue placeholder="Selecione uma função" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="organizer">Organizador</SelectItem>
                      <SelectItem value="team_member">Membro da Equipe</SelectItem>
                      <SelectItem value="vendor">Fornecedor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button 
                  onClick={handleAddMemberToMultipleEvents} 
                  disabled={selectedEvents.length === 0 || !email || addTeamMemberToMultipleEventsMutation.isPending}
                >
                  {addTeamMemberToMultipleEventsMutation.isPending ? "Adicionando..." : `Adicionar a ${selectedEvents.length} evento${selectedEvents.length !== 1 ? 's' : ''}`}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          

        </div>
      </div>
      
      {/* Visão de Eventos */}
      {viewMode === "events" ? (
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
                      value={searchTerm}
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
                            {getEventTypeLabel(event.type)}
                          </Badge>
                          {event.team && (
                            <Badge variant="secondary" className="rounded-sm px-1 text-xs flex items-center">
                              <UsersRound className="h-3 w-3 mr-1" />
                              {event.team.length} membros
                            </Badge>
                          )}
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
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle>
                  {selectedEventId
                    ? events.find((e: Event) => e.id === selectedEventId)?.name || "Equipe"
                    : "Equipe"}
                </CardTitle>
                <CardDescription>
                  Gerencie os membros da equipe do seu evento
                </CardDescription>
              </div>
              {selectedEventId && (
                <Button variant="outline" size="sm" onClick={() => setIsAddMemberOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {isLoadingTeam ? (
                <div className="flex items-center justify-center h-40">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary"></div>
                </div>
              ) : selectedEventId ? (
                <Tabs defaultValue="all">
                  <TabsList className="mb-4">
                    <TabsTrigger value="all">Todos ({teamMembers.length})</TabsTrigger>
                    <TabsTrigger value="organizers">Organizadores ({organizers.length})</TabsTrigger>
                    <TabsTrigger value="members">Membros da Equipe ({teamMembersOnly.length})</TabsTrigger>
                    <TabsTrigger value="vendors">Fornecedores ({vendors.length})</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="all" className="space-y-6">
                    {teamMembers.length === 0 ? (
                      <div className="text-center py-8">
                        <UsersRound className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium mb-2">Nenhum membro na equipe</h3>
                        <p className="text-muted-foreground mb-4">
                          Adicione membros à equipe para colaborar neste evento
                        </p>
                        <Button onClick={() => setIsAddMemberOpen(true)}>
                          <UserPlus className="h-4 w-4 mr-2" />
                          Adicionar Membro
                        </Button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {teamMembers.map((member: Team) => (
                          <div 
                            key={member.id} 
                            className="bg-card border rounded-lg shadow-sm hover:shadow-md transition-shadow"
                          >
                            <div className="p-4">
                              <div className="flex items-start justify-between mb-3">
                                <Avatar className="h-12 w-12 mr-3">
                                  <AvatarImage 
                                    src={member.user?.profileImageUrl || 
                                        generateProfileImageUrl(`${member.user?.firstName || ''} ${member.user?.lastName || ''}`)} 
                                  />
                                  <AvatarFallback>
                                    {getInitials(`${member.user?.firstName || ''} ${member.user?.lastName || ''}`)}
                                  </AvatarFallback>
                                </Avatar>
                                
                                <Badge
                                  className={
                                    member.role === "organizer"
                                      ? "bg-purple-500"
                                      : member.role === "team_member"
                                      ? "bg-blue-500"
                                      : "bg-orange-500"
                                  }
                                >
                                  {member.role === "organizer"
                                    ? "Organizador"
                                    : member.role === "team_member"
                                    ? "Membro"
                                    : "Fornecedor"}
                                </Badge>
                              </div>
                              
                              <div className="mb-2">
                                <h3 className="font-medium text-lg">
                                  {member.user?.firstName
                                    ? `${member.user.firstName} ${member.user?.lastName || ''}`
                                    : member.user?.email?.split('@')[0] || 'Usuário'}
                                </h3>
                                <p className="text-sm text-muted-foreground">{member.user?.email || ''}</p>
                                {member.user?.phone && (
                                  <p className="text-sm text-muted-foreground flex items-center mt-1">
                                    <Phone className="h-3 w-3 mr-1" /> 
                                    {member.user.phone}
                                  </p>
                                )}
                              </div>
                            </div>
                            
                            <div className="px-4 py-2 bg-muted/40 flex justify-between items-center border-t">
                              <div className="flex space-x-2">
                                <Button size="icon" variant="ghost" className="h-8 w-8">
                                  <Mail className="h-4 w-4" />
                                </Button>
                                {member.user?.phone && (
                                  <Button size="icon" variant="ghost" className="h-8 w-8">
                                    <Phone className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                              
                              {isEventOwner(events.find((e: Event) => e.id === selectedEventId)!) && (
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => alert('Editar função')}>
                                      <Edit className="h-4 w-4 mr-2" />
                                      Alterar função
                                    </DropdownMenuItem>
                                    <DropdownMenuItem 
                                      className="text-destructive focus:text-destructive" 
                                      onClick={() => handleRemoveMember(selectedEventId!, member.user?.id || '')}
                                    >
                                      <Trash className="h-4 w-4 mr-2" />
                                      Remover da equipe
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="organizers" className="space-y-6">
                    {organizers.length === 0 ? (
                      <div className="text-center py-8">
                        <UserCog className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium mb-2">Nenhum organizador</h3>
                        <p className="text-muted-foreground mb-4">
                          Adicione organizadores para ajudar a gerenciar o evento
                        </p>
                        <Button onClick={() => {setIsAddMemberOpen(true); setRole("organizer");}}>
                          <UserPlus className="h-4 w-4 mr-2" />
                          Adicionar Organizador
                        </Button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {organizers.map((member: Team) => (
                          <div 
                            key={member.id} 
                            className="bg-card border rounded-lg shadow-sm hover:shadow-md transition-shadow"
                          >
                            <div className="p-4">
                              <div className="flex items-start justify-between mb-3">
                                <Avatar className="h-12 w-12 mr-3">
                                  <AvatarImage 
                                    src={member.user?.profileImageUrl || 
                                        generateProfileImageUrl(`${member.user?.firstName || ''} ${member.user?.lastName || ''}`)} 
                                  />
                                  <AvatarFallback>
                                    {getInitials(`${member.user?.firstName || ''} ${member.user?.lastName || ''}`)}
                                  </AvatarFallback>
                                </Avatar>
                                
                                <Badge className="bg-purple-500">Organizador</Badge>
                              </div>
                              
                              <div className="mb-2">
                                <h3 className="font-medium text-lg">
                                  {member.user?.firstName
                                    ? `${member.user.firstName} ${member.user?.lastName || ''}`
                                    : member.user?.email?.split('@')[0] || 'Usuário'}
                                </h3>
                                <p className="text-sm text-muted-foreground">{member.user?.email || ''}</p>
                                {member.user?.phone && (
                                  <p className="text-sm text-muted-foreground flex items-center mt-1">
                                    <Phone className="h-3 w-3 mr-1" /> 
                                    {member.user.phone}
                                  </p>
                                )}
                              </div>
                            </div>
                            
                            <div className="px-4 py-2 bg-muted/40 flex justify-between items-center border-t">
                              <div className="flex space-x-2">
                                <Button size="icon" variant="ghost" className="h-8 w-8">
                                  <Mail className="h-4 w-4" />
                                </Button>
                                {member.user?.phone && (
                                  <Button size="icon" variant="ghost" className="h-8 w-8">
                                    <Phone className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                              
                              {isEventOwner(events.find((e: Event) => e.id === selectedEventId)!) && (
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => alert('Editar função')}>
                                      <Edit className="h-4 w-4 mr-2" />
                                      Alterar função
                                    </DropdownMenuItem>
                                    <DropdownMenuItem 
                                      className="text-destructive focus:text-destructive" 
                                      onClick={() => handleRemoveMember(selectedEventId!, member.user?.id || '')}
                                    >
                                      <Trash className="h-4 w-4 mr-2" />
                                      Remover da equipe
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="members" className="space-y-6">
                    {teamMembersOnly.length === 0 ? (
                      <div className="text-center py-8">
                        <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium mb-2">Nenhum membro da equipe</h3>
                        <p className="text-muted-foreground mb-4">
                          Adicione membros à equipe para colaborar neste evento
                        </p>
                        <Button onClick={() => {setIsAddMemberOpen(true); setRole("team_member");}}>
                          <UserPlus className="h-4 w-4 mr-2" />
                          Adicionar Membro
                        </Button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {teamMembersOnly.map((member: Team) => (
                          <div 
                            key={member.id} 
                            className="bg-card border rounded-lg shadow-sm hover:shadow-md transition-shadow"
                          >
                            <div className="p-4">
                              <div className="flex items-start justify-between mb-3">
                                <Avatar className="h-12 w-12 mr-3">
                                  <AvatarImage 
                                    src={member.user?.profileImageUrl || 
                                        generateProfileImageUrl(`${member.user?.firstName || ''} ${member.user?.lastName || ''}`)} 
                                  />
                                  <AvatarFallback>
                                    {getInitials(`${member.user?.firstName || ''} ${member.user?.lastName || ''}`)}
                                  </AvatarFallback>
                                </Avatar>
                                
                                <Badge className="bg-blue-500">Membro</Badge>
                              </div>
                              
                              <div className="mb-2">
                                <h3 className="font-medium text-lg">
                                  {member.user?.firstName
                                    ? `${member.user.firstName} ${member.user?.lastName || ''}`
                                    : member.user?.email?.split('@')[0] || 'Usuário'}
                                </h3>
                                <p className="text-sm text-muted-foreground">{member.user?.email || ''}</p>
                                {member.user?.phone && (
                                  <p className="text-sm text-muted-foreground flex items-center mt-1">
                                    <Phone className="h-3 w-3 mr-1" /> 
                                    {member.user.phone}
                                  </p>
                                )}
                              </div>
                            </div>
                            
                            <div className="px-4 py-2 bg-muted/40 flex justify-between items-center border-t">
                              <div className="flex space-x-2">
                                <Button size="icon" variant="ghost" className="h-8 w-8">
                                  <Mail className="h-4 w-4" />
                                </Button>
                                {member.user?.phone && (
                                  <Button size="icon" variant="ghost" className="h-8 w-8">
                                    <Phone className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                              
                              {isEventOwner(events.find((e: Event) => e.id === selectedEventId)!) && (
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => alert('Editar função')}>
                                      <Edit className="h-4 w-4 mr-2" />
                                      Alterar função
                                    </DropdownMenuItem>
                                    <DropdownMenuItem 
                                      className="text-destructive focus:text-destructive" 
                                      onClick={() => handleRemoveMember(selectedEventId!, member.user?.id || '')}
                                    >
                                      <Trash className="h-4 w-4 mr-2" />
                                      Remover da equipe
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="vendors" className="space-y-6">
                    {vendors.length === 0 ? (
                      <div className="text-center py-8">
                        <Building className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium mb-2">Nenhum fornecedor</h3>
                        <p className="text-muted-foreground mb-4">
                          Adicione fornecedores para facilitar a comunicação
                        </p>
                        <Button onClick={() => {setIsAddMemberOpen(true); setRole("vendor");}}>
                          <UserPlus className="h-4 w-4 mr-2" />
                          Adicionar Fornecedor
                        </Button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {vendors.map((member: Team) => (
                          <div 
                            key={member.id} 
                            className="bg-card border rounded-lg shadow-sm hover:shadow-md transition-shadow"
                          >
                            <div className="p-4">
                              <div className="flex items-start justify-between mb-3">
                                <Avatar className="h-12 w-12 mr-3">
                                  <AvatarImage 
                                    src={member.user?.profileImageUrl || 
                                        generateProfileImageUrl(`${member.user?.firstName || ''} ${member.user?.lastName || ''}`)} 
                                  />
                                  <AvatarFallback>
                                    {getInitials(`${member.user?.firstName || ''} ${member.user?.lastName || ''}`)}
                                  </AvatarFallback>
                                </Avatar>
                                
                                <Badge className="bg-orange-500">Fornecedor</Badge>
                              </div>
                              
                              <div className="mb-2">
                                <h3 className="font-medium text-lg">
                                  {member.user?.firstName
                                    ? `${member.user.firstName} ${member.user?.lastName || ''}`
                                    : member.user?.email?.split('@')[0] || 'Usuário'}
                                </h3>
                                <p className="text-sm text-muted-foreground">{member.user?.email || ''}</p>
                                {member.user?.phone && (
                                  <p className="text-sm text-muted-foreground flex items-center mt-1">
                                    <Phone className="h-3 w-3 mr-1" /> 
                                    {member.user.phone}
                                  </p>
                                )}
                              </div>
                            </div>
                            
                            <div className="px-4 py-2 bg-muted/40 flex justify-between items-center border-t">
                              <div className="flex space-x-2">
                                <Button size="icon" variant="ghost" className="h-8 w-8">
                                  <Mail className="h-4 w-4" />
                                </Button>
                                {member.user?.phone && (
                                  <Button size="icon" variant="ghost" className="h-8 w-8">
                                    <Phone className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                              
                              {isEventOwner(events.find((e: Event) => e.id === selectedEventId)!) && (
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => alert('Editar função')}>
                                      <Edit className="h-4 w-4 mr-2" />
                                      Alterar função
                                    </DropdownMenuItem>
                                    <DropdownMenuItem 
                                      className="text-destructive focus:text-destructive" 
                                      onClick={() => handleRemoveMember(selectedEventId!, member.user?.id || '')}
                                    >
                                      <Trash className="h-4 w-4 mr-2" />
                                      Remover da equipe
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              ) : (
                <div className="text-center py-8">
                  <h3 className="text-lg font-medium mb-2">Selecione um evento</h3>
                  <p className="text-muted-foreground">
                    Selecione um evento para gerenciar sua equipe
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        // Visão de Pessoas
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Equipe de todos os Eventos</CardTitle>
              <CardDescription>
                Visualize todas as pessoas que fazem parte dos seus eventos
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredTeamMembers.length === 0 ? (
                <div className="text-center py-8">
                  <UsersRound className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Nenhuma pessoa encontrada</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchTerm ? "Tente uma busca diferente" : "Adicione membros aos seus eventos"}
                  </p>
                  <Button onClick={() => setIsAddMemberOpen(true)}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Adicionar Pessoa
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredTeamMembers.map((member: any) => (
                    <Card key={member.id} className="border-0 shadow-md hover:shadow-lg transition-shadow">
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center">
                            <Avatar className="h-14 w-14 mr-4">
                              <AvatarImage 
                                src={member.profileImageUrl || 
                                    generateProfileImageUrl(`${member.firstName || ''} ${member.lastName || ''}`)} 
                              />
                              <AvatarFallback>
                                {getInitials(`${member.firstName || ''} ${member.lastName || ''}`)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="text-xl font-medium">
                                {member.firstName
                                  ? `${member.firstName} ${member.lastName || ''}`
                                  : member.email?.split('@')[0] || 'Usuário'}
                              </h3>
                              <p className="text-sm text-muted-foreground">{member.email}</p>
                              {member.phone && (
                                <p className="text-sm text-muted-foreground flex items-center mt-1">
                                  <Phone className="h-3 w-3 mr-1" /> 
                                  {member.phone}
                                </p>
                              )}
                            </div>
                          </div>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Ações</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => setIsAddMemberToMultipleOpen(true)}>
                                <Plus className="h-4 w-4 mr-2" />
                                Adicionar a mais eventos
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Mail className="h-4 w-4 mr-2" />
                                Enviar e-mail
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardHeader>
                      
                      <CardContent>
                        <p className="text-sm font-medium mb-2">Participando de {member.events.length} eventos:</p>
                        
                        <Accordion type="multiple" className="w-full">
                          <AccordionItem value="events">
                            <AccordionTrigger className="py-2">
                              Ver todos os eventos
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="space-y-2 py-1">
                                {member.events.map((eventInfo: any) => {
                                  const event = events.find((e: Event) => e.id === eventInfo.eventId);
                                  return (
                                    <div key={eventInfo.teamMemberId} className="flex items-center justify-between p-2 bg-muted rounded-md">
                                      <div>
                                        <p className="font-medium">{event?.name}</p>
                                        <div className="flex items-center text-sm text-muted-foreground">
                                          <Badge className={
                                            eventInfo.role === "organizer"
                                              ? "bg-purple-500 mr-2"
                                              : eventInfo.role === "team_member"
                                              ? "bg-blue-500 mr-2"
                                              : "bg-orange-500 mr-2"
                                          }>
                                            {eventInfo.role === "organizer"
                                              ? "Organizador"
                                              : eventInfo.role === "team_member"
                                              ? "Membro"
                                              : "Fornecedor"}
                                          </Badge>
                                        </div>
                                      </div>
                                      
                                      <Button 
                                        variant="ghost" 
                                        size="sm"
                                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                        onClick={() => handleRemoveMember(eventInfo.eventId, member.id)}
                                      >
                                        <X className="h-4 w-4 mr-1" />
                                        Remover
                                      </Button>
                                    </div>
                                  );
                                })}
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

export default Team;