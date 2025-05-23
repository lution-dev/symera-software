import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { 
  Select, 
  SelectContent, 
  SelectGroup, 
  SelectItem, 
  SelectLabel, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { 
  ChevronLeft, 
  UserPlus, 
  MoreVertical, 
  Trash, 
  Edit, 
  CheckCircle2, 
  Shield, 
  UserCog
} from "lucide-react";

const EventTeam: React.FC = () => {
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Estado para o modal de adicionar membros
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [role, setRole] = useState("team_member");
  
  // Extrair ID do evento da URL
  const eventId = location.split("/")[2];
  
  // Buscar evento
  const { data: event, isLoading: eventLoading } = useQuery({
    queryKey: [`/api/events/${eventId}`],
    enabled: !!eventId
  });
  
  // Buscar membros da equipe atual
  const { data: team, isLoading: teamLoading, refetch: refetchTeam } = useQuery({
    queryKey: [`/api/events/${eventId}/team`],
    enabled: !!eventId
  });
  
  // Buscar todos os usuários disponíveis
  const { data: availableUsers, isLoading: usersLoading } = useQuery({
    queryKey: ["/api/users"],
    enabled: !!eventId
  });
  
  // Mutation para adicionar membro à equipe
  const addTeamMemberMutation = useMutation({
    mutationFn: async (data: { userId: string; role: string }) => {
      return apiRequest(`/api/events/${eventId}/team`, {
        method: "POST",
        body: data
      });
    },
    onSuccess: () => {
      toast({
        title: "Membro adicionado",
        description: "O membro foi adicionado à equipe com sucesso",
      });
      setIsAddMemberOpen(false);
      setSelectedUserId("");
      queryClient.invalidateQueries({ queryKey: [`/api/events/${eventId}/team`] });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o membro à equipe. Tente novamente.",
        variant: "destructive",
      });
    },
  });
  
  // Mutation para remover membro da equipe
  const removeTeamMemberMutation = useMutation({
    mutationFn: async (userId: string) => {
      return apiRequest(`/api/events/${eventId}/team/${userId}`, {
        method: "DELETE"
      });
    },
    onSuccess: () => {
      toast({
        title: "Membro removido",
        description: "O membro foi removido da equipe com sucesso",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/events/${eventId}/team`] });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Não foi possível remover o membro da equipe. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  // Mutation para atualizar função do membro na equipe
  const updateTeamMemberRoleMutation = useMutation({
    mutationFn: async ({ userId, newRole }: { userId: string; newRole: string }) => {
      return apiRequest(`/api/events/${eventId}/team/${userId}`, {
        method: "PATCH",
        body: { role: newRole }
      });
    },
    onSuccess: () => {
      toast({
        title: "Função atualizada",
        description: "A função do membro foi atualizada com sucesso",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/events/${eventId}/team`] });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a função do membro. Tente novamente.",
        variant: "destructive",
      });
    },
  });
  
  // Handler para adicionar membro
  const handleAddMember = () => {
    if (!selectedUserId) {
      toast({
        title: "Seleção obrigatória",
        description: "Selecione um usuário para adicionar à equipe.",
        variant: "destructive",
      });
      return;
    }
    
    addTeamMemberMutation.mutate({
      userId: selectedUserId,
      role
    });
  };
  
  // Handler para remover membro
  const handleRemoveMember = (userId: string) => {
    if (confirm("Tem certeza que deseja remover este membro da equipe?")) {
      removeTeamMemberMutation.mutate(userId);
    }
  };

  // Handler para mudar função
  const handleChangeRole = (userId: string, newRole: string) => {
    updateTeamMemberRoleMutation.mutate({ 
      userId,
      newRole
    });
  };
  
  // Verificar se o usuário atual é organizador do evento
  const isOrganizer = () => {
    if (!team || !user) return false;
    
    const currentUserMember = team.find((member: any) => 
      member.userId === user.id && member.role === 'organizer'
    );
    
    return !!currentUserMember;
  };

  // Obter o nome da função em português
  const getRoleName = (role: string) => {
    switch(role) {
      case 'organizer': return 'Organizador';
      case 'team_member': return 'Membro da Equipe';
      case 'vendor': return 'Fornecedor';
      default: return 'Membro';
    }
  };

  // Filtrar membros (excluindo fornecedores)
  const teamMembers = team?.filter((member: any) => member.role !== 'vendor') || [];
  
  if (eventLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }
  
  if (!event) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Evento não encontrado</h2>
          <p className="mb-6">O evento que você está procurando não existe ou você não tem permissão para acessá-lo.</p>
          <Button onClick={() => navigate("/events")}>
            Voltar para Eventos
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate(`/events/${eventId}`)} className="mr-2">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Voltar
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Equipe do Evento</h1>
          <p className="text-muted-foreground">{event.name}</p>
        </div>
      </div>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle>Membros da Equipe</CardTitle>
            <CardDescription>
              Gerencie quem pode acessar e colaborar no evento
            </CardDescription>
          </div>
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
                  Adicione um novo membro à equipe do evento. Os membros podem visualizar e editar o evento conforme suas permissões.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="userId">Selecione um membro</Label>
                  <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um usuário" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Usuários disponíveis</SelectLabel>
                        {availableUsers?.filter(user => 
                          // Filtra os usuários que já estão na equipe
                          !team?.some((member: any) => member.user.id === user.id)
                        ).map((user: any) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.firstName} {user.lastName}
                          </SelectItem>
                        ))}
                        {(!availableUsers || availableUsers.length === 0) && (
                          <SelectItem value="" disabled>
                            Nenhum usuário disponível
                          </SelectItem>
                        )}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Função</Label>
                  <Select value={role} onValueChange={setRole}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma função" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Funções</SelectLabel>
                        <SelectItem value="organizer">Organizador</SelectItem>
                        <SelectItem value="team_member">Membro da Equipe</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddMemberOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleAddMember}>
                  Adicionar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {teamLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : teamMembers.length === 0 ? (
            <div className="text-center py-8">
              <div className="flex justify-center mb-4">
                <UserCog className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">Nenhum membro na equipe</h3>
              <p className="text-muted-foreground mb-6">
                Adicione membros para colaborar no evento
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {teamMembers.map((member: any) => (
                <div key={member.id} className="bg-card border rounded-lg p-4 flex flex-col">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      {member.user.profileImageUrl ? (
                        <Avatar>
                          <AvatarImage src={member.user.profileImageUrl} alt={`${member.user.firstName} ${member.user.lastName}`} />
                          <AvatarFallback>{member.user.firstName?.[0]}{member.user.lastName?.[0]}</AvatarFallback>
                        </Avatar>
                      ) : (
                        <Avatar>
                          <AvatarFallback>{member.user.firstName?.[0]}{member.user.lastName?.[0]}</AvatarFallback>
                        </Avatar>
                      )}
                      <div>
                        <div className="font-medium">{member.user.firstName} {member.user.lastName}</div>
                        <div className="text-sm text-muted-foreground">{member.user.email}</div>
                        <div className="flex items-center mt-1">
                          {member.role === 'organizer' && (
                            <div className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                              <Shield className="h-3 w-3 mr-1" />
                              Organizador
                            </div>
                          )}
                          {member.role === 'team_member' && (
                            <div className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                              <UserCog className="h-3 w-3 mr-1" />
                              Membro da Equipe
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    {isOrganizer() && member.user.id !== user?.id && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleChangeRole(member.user.id, member.role === 'organizer' ? 'team_member' : 'organizer')}>
                            <Edit className="h-4 w-4 mr-2" />
                            {member.role === 'organizer' ? 'Tornar Membro' : 'Tornar Organizador'}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-destructive focus:text-destructive" 
                            onClick={() => handleRemoveMember(member.user.id)}
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
        </CardContent>
      </Card>
    </div>
  );
};

export default EventTeam;