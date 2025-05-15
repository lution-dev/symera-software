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
import { UsersRound, UserPlus, Mail, Phone, Check, X } from "lucide-react";
import { getInitials } from "@/lib/utils";

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
  };
}

interface Event {
  id: number;
  name: string;
  type: string;
  ownerId: string;
}

const Team: React.FC = () => {
  const { toast } = useToast();
  const [isAddMemberOpen, setIsAddMemberOpen] = React.useState(false);
  const [selectedEventId, setSelectedEventId] = React.useState<number | null>(null);
  const [email, setEmail] = React.useState("");
  const [role, setRole] = React.useState("team_member");
  
  // Query para buscar todos os eventos do usuário
  const { data: events = [], isLoading: isLoadingEvents } = useQuery({
    queryKey: ["/api/events"],
    enabled: true,
  });
  
  // Query para buscar membros da equipe quando um evento é selecionado
  const { data: teamMembers = [], isLoading: isLoadingTeam } = useQuery({
    queryKey: ["/api/events", selectedEventId, "team"],
    enabled: !!selectedEventId,
  });
  
  // Mutação para adicionar membro à equipe
  const addTeamMemberMutation = useMutation({
    mutationFn: async (data: { eventId: number, email: string, role: string }) => {
      return apiRequest(`/api/events/${data.eventId}/team`, {
        method: "POST",
        body: JSON.stringify({
          email: data.email,
          role: data.role
        }),
      });
    },
    onSuccess: () => {
      // Invalidar cache para recarregar os membros da equipe
      queryClient.invalidateQueries({ queryKey: ["/api/events", selectedEventId, "team"] });
      toast({
        title: "Membro adicionado",
        description: "O membro foi adicionado à equipe com sucesso.",
      });
      setEmail("");
      setRole("team_member");
      setIsAddMemberOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Erro ao adicionar membro",
        description: "Ocorreu um erro ao adicionar o membro à equipe. Tente novamente.",
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
      queryClient.invalidateQueries({ queryKey: ["/api/events", selectedEventId, "team"] });
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
  
  // Handler para adicionar membro
  const handleAddMember = () => {
    if (!selectedEventId) {
      toast({
        title: "Nenhum evento selecionado",
        description: "Selecione um evento para adicionar um membro à equipe.",
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
    
    addTeamMemberMutation.mutate({
      eventId: selectedEventId,
      email,
      role,
    });
  };
  
  // Handler para remover membro
  const handleRemoveMember = (userId: string) => {
    if (!selectedEventId) return;
    
    if (confirm("Tem certeza que deseja remover este membro da equipe?")) {
      removeTeamMemberMutation.mutate({
        eventId: selectedEventId,
        userId,
      });
    }
  };
  
  // Verificar se o usuário atual é o proprietário do evento
  const isEventOwner = (event: Event) => {
    // Implemente a lógica para verificar se o usuário atual é o proprietário
    return true; // Placeholder
  };
  
  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Equipe</h1>
        <Dialog open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Adicionar Membro
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Membro à Equipe</DialogTitle>
              <DialogDescription>
                Adicione um novo membro à equipe do seu evento. Se a pessoa não tiver uma conta, um convite será enviado.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
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
                    {events.map((event: Event) => (
                      <SelectItem key={event.id} value={event.id.toString()}>
                        {event.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
              <DialogClose asChild>
                <Button variant="outline">Cancelar</Button>
              </DialogClose>
              <Button 
                onClick={handleAddMember} 
                disabled={!selectedEventId || !email || addTeamMemberMutation.isPending}
              >
                {addTeamMemberMutation.isPending ? "Adicionando..." : "Adicionar Membro"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Eventos</CardTitle>
            <CardDescription>
              Selecione um evento para ver sua equipe
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {isLoadingEvents ? (
                <div className="flex items-center justify-center h-20">
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary"></div>
                </div>
              ) : events.length > 0 ? (
                events.map((event: Event) => (
                  <div
                    key={event.id}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedEventId === event.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-card hover:bg-primary/10"
                    }`}
                    onClick={() => setSelectedEventId(event.id)}
                  >
                    <div className="font-medium">{event.name}</div>
                    <div className="text-sm opacity-80">
                      {selectedEventId === event.id
                        ? `${teamMembers.length} membros`
                        : event.type}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted-foreground">Nenhum evento encontrado</p>
                  <Button variant="outline" size="sm" className="mt-2">
                    Criar Evento
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>
              {selectedEventId
                ? events.find((e: Event) => e.id === selectedEventId)?.name || "Equipe"
                : "Equipe"}
            </CardTitle>
            <CardDescription>
              Gerencie os membros da equipe do seu evento
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingTeam ? (
              <div className="flex items-center justify-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary"></div>
              </div>
            ) : selectedEventId ? (
              <Tabs defaultValue="all">
                <TabsList className="mb-4">
                  <TabsTrigger value="all">Todos</TabsTrigger>
                  <TabsTrigger value="organizers">Organizadores</TabsTrigger>
                  <TabsTrigger value="members">Membros da Equipe</TabsTrigger>
                  <TabsTrigger value="vendors">Fornecedores</TabsTrigger>
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
                          className="border rounded-lg p-4 hover:border-primary transition-colors"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center">
                              <Avatar className="h-10 w-10 mr-3">
                                <AvatarImage src={member.user?.profileImageUrl} />
                                <AvatarFallback>
                                  {getInitials(`${member.user?.firstName || ''} ${member.user?.lastName || ''}`)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <h3 className="font-medium">
                                  {member.user?.firstName
                                    ? `${member.user.firstName} ${member.user?.lastName || ''}`
                                    : member.user?.email?.split('@')[0] || 'Usuário'}
                                </h3>
                                <p className="text-sm text-muted-foreground">{member.user?.email || ''}</p>
                              </div>
                            </div>
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
                          <div className="flex justify-between items-center mt-4 pt-2 border-t">
                            <div className="flex space-x-2">
                              <Button size="icon" variant="ghost">
                                <Mail className="h-4 w-4" />
                              </Button>
                              <Button size="icon" variant="ghost">
                                <Phone className="h-4 w-4" />
                              </Button>
                            </div>
                            {isEventOwner(events.find((e: Event) => e.id === selectedEventId)) && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:text-destructive"
                                onClick={() => handleRemoveMember(member.user?.id || '')}
                              >
                                <X className="h-4 w-4 mr-1" />
                                Remover
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="organizers">
                  {organizers.length === 0 ? (
                    <div className="text-center py-8">
                      <UsersRound className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">Nenhum organizador</h3>
                      <p className="text-muted-foreground mb-4">
                        Adicione organizadores para ajudar a gerenciar este evento
                      </p>
                      <Button onClick={() => setIsAddMemberOpen(true)}>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Adicionar Organizador
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {organizers.map((member: Team) => (
                        <div 
                          key={member.id} 
                          className="border rounded-lg p-4 hover:border-primary transition-colors"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center">
                              <Avatar className="h-10 w-10 mr-3">
                                <AvatarImage src={member.user?.profileImageUrl} />
                                <AvatarFallback>
                                  {getInitials(`${member.user?.firstName || ''} ${member.user?.lastName || ''}`)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <h3 className="font-medium">
                                  {member.user?.firstName
                                    ? `${member.user.firstName} ${member.user?.lastName || ''}`
                                    : member.user?.email?.split('@')[0] || 'Usuário'}
                                </h3>
                                <p className="text-sm text-muted-foreground">{member.user?.email || ''}</p>
                              </div>
                            </div>
                            <Badge className="bg-purple-500">Organizador</Badge>
                          </div>
                          <div className="flex justify-between items-center mt-4 pt-2 border-t">
                            <div className="flex space-x-2">
                              <Button size="icon" variant="ghost">
                                <Mail className="h-4 w-4" />
                              </Button>
                              <Button size="icon" variant="ghost">
                                <Phone className="h-4 w-4" />
                              </Button>
                            </div>
                            {isEventOwner(events.find((e: Event) => e.id === selectedEventId)) && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:text-destructive"
                                onClick={() => handleRemoveMember(member.user?.id || '')}
                              >
                                <X className="h-4 w-4 mr-1" />
                                Remover
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="members">
                  {teamMembersOnly.length === 0 ? (
                    <div className="text-center py-6">
                      <p className="text-muted-foreground">Nenhum membro da equipe encontrado</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-2" 
                        onClick={() => setIsAddMemberOpen(true)}
                      >
                        <UserPlus className="h-4 w-4 mr-2" />
                        Adicionar Membro
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {teamMembersOnly.map((member: Team) => (
                        <div 
                          key={member.id} 
                          className="border rounded-lg p-4 hover:border-primary transition-colors"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center">
                              <Avatar className="h-10 w-10 mr-3">
                                <AvatarImage src={member.user?.profileImageUrl} />
                                <AvatarFallback>
                                  {getInitials(`${member.user?.firstName || ''} ${member.user?.lastName || ''}`)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <h3 className="font-medium">
                                  {member.user?.firstName
                                    ? `${member.user.firstName} ${member.user?.lastName || ''}`
                                    : member.user?.email?.split('@')[0] || 'Usuário'}
                                </h3>
                                <p className="text-sm text-muted-foreground">{member.user?.email || ''}</p>
                              </div>
                            </div>
                            <Badge className="bg-blue-500">Membro</Badge>
                          </div>
                          <div className="flex justify-between items-center mt-4 pt-2 border-t">
                            <div className="flex space-x-2">
                              <Button size="icon" variant="ghost">
                                <Mail className="h-4 w-4" />
                              </Button>
                              <Button size="icon" variant="ghost">
                                <Phone className="h-4 w-4" />
                              </Button>
                            </div>
                            {isEventOwner(events.find((e: Event) => e.id === selectedEventId)) && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:text-destructive"
                                onClick={() => handleRemoveMember(member.user?.id || '')}
                              >
                                <X className="h-4 w-4 mr-1" />
                                Remover
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="vendors">
                  {vendors.length === 0 ? (
                    <div className="text-center py-6">
                      <p className="text-muted-foreground">Nenhum fornecedor encontrado</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-2" 
                        onClick={() => setIsAddMemberOpen(true)}
                      >
                        <UserPlus className="h-4 w-4 mr-2" />
                        Adicionar Fornecedor
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {vendors.map((member: Team) => (
                        <div 
                          key={member.id} 
                          className="border rounded-lg p-4 hover:border-primary transition-colors"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center">
                              <Avatar className="h-10 w-10 mr-3">
                                <AvatarImage src={member.user?.profileImageUrl} />
                                <AvatarFallback>
                                  {getInitials(`${member.user?.firstName || ''} ${member.user?.lastName || ''}`)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <h3 className="font-medium">
                                  {member.user?.firstName
                                    ? `${member.user.firstName} ${member.user?.lastName || ''}`
                                    : member.user?.email?.split('@')[0] || 'Fornecedor'}
                                </h3>
                                <p className="text-sm text-muted-foreground">{member.user?.email || ''}</p>
                              </div>
                            </div>
                            <Badge className="bg-orange-500">Fornecedor</Badge>
                          </div>
                          <div className="flex justify-between items-center mt-4 pt-2 border-t">
                            <div className="flex space-x-2">
                              <Button size="icon" variant="ghost">
                                <Mail className="h-4 w-4" />
                              </Button>
                              <Button size="icon" variant="ghost">
                                <Phone className="h-4 w-4" />
                              </Button>
                            </div>
                            {isEventOwner(events.find((e: Event) => e.id === selectedEventId)) && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:text-destructive"
                                onClick={() => handleRemoveMember(member.user?.id || '')}
                              >
                                <X className="h-4 w-4 mr-1" />
                                Remover
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            ) : (
              <div className="text-center py-10">
                <UsersRound className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium mb-2">Selecione um evento</h3>
                <p className="text-muted-foreground">
                  Selecione um evento para visualizar e gerenciar sua equipe
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Team;