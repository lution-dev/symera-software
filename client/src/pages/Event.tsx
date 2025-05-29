import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import TaskList from "@/components/Dashboard/TaskList";
import ActivityFeed from "@/components/Dashboard/ActivityFeed";
import { formatDate, formatCurrency, calculateTaskProgress, getEventTypeLabel, getInitials } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { AlertTriangle, UserPlus, X, Users, Search, MoreVertical, Trash2, Mail, Phone } from "lucide-react";

interface EventProps {
  id?: string;
}

const Event: React.FC<EventProps> = ({ id }) => {
  const [location] = useLocation();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  
  // Filtering and sorting state
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [assigneeFilter, setAssigneeFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("dueDate");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Team member selection modal state
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [memberSearchQuery, setMemberSearchQuery] = useState("");
  
  // Extract ID from URL if not received as prop
  const eventId = id || location.split('/')[2];
  
  const { data: event, isLoading, error, refetch } = useQuery({
    queryKey: [`/api/events/${eventId}`],
    enabled: !!eventId && isAuthenticated,
    retry: 1,
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchOnMount: true
  });
  
  const { data: tasks, isLoading: tasksLoading } = useQuery({
    queryKey: [`/api/events/${eventId}/tasks`],
    enabled: !!eventId && !!event,
  });
  
  const { data: team, isLoading: teamLoading } = useQuery({
    queryKey: [`/api/events/${eventId}/team`],
    enabled: !!eventId && !!event,
  });
  
  const { data: activities, isLoading: activitiesLoading } = useQuery({
    queryKey: [`/api/events/${eventId}/activities`],
    enabled: !!eventId && !!event,
  });

  // Fetch all users available for adding to team
  const { data: allUsers, isLoading: usersLoading } = useQuery({
    queryKey: ["/api/users"],
    enabled: isAddMemberModalOpen,
    retry: 1,
    staleTime: 0,
  });

  // Filter available users (who are not already in the team)
  const filteredUsers = allUsers?.filter((user: any) => {
    const isNotInTeam = !team?.some((member: any) => member.user.id === user.id);
    const matchesSearch = memberSearchQuery === "" || 
      `${user.firstName} ${user.lastName}`.toLowerCase().includes(memberSearchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(memberSearchQuery.toLowerCase());
    return isNotInTeam && matchesSearch;
  }) || [];
  
  // Mutation to add team members
  const addTeamMembersMutation = useMutation({
    mutationFn: async (userIds: string[]) => {
      return apiRequest(`/api/events/${eventId}/team`, {
        method: "POST",
        body: JSON.stringify({ userIds }),
        headers: {
          'Content-Type': 'application/json'
        }
      });
    },
    onSuccess: () => {
      toast({
        title: "Membros adicionados",
        description: `${selectedMembers.length} membro(s) adicionado(s) à equipe com sucesso.`,
      });
      queryClient.invalidateQueries({ queryKey: [`/api/events/${eventId}/team`] });
      setIsAddMemberModalOpen(false);
      setSelectedMembers([]);
      setMemberSearchQuery("");
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível adicionar os membros à equipe.",
        variant: "destructive",
      });
    },
  });

  const removeTeamMemberMutation = useMutation({
    mutationFn: async (userId: string) => {
      return apiRequest(`/api/events/${eventId}/team/${userId}`, {
        method: "DELETE"
      });
    },
    onSuccess: () => {
      toast({
        title: "Membro removido",
        description: "Membro removido da equipe com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/events/${eventId}/team`] });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível remover o membro da equipe.",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
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
        <div className="bg-card rounded-xl p-8 text-center">
          <div className="mb-4 flex justify-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              <i className="fas fa-calendar-times text-destructive text-2xl"></i>
            </div>
          </div>
          <h3 className="text-lg font-medium mb-2">Evento não encontrado</h3>
          <p className="text-muted-foreground mb-6">
            O evento que você está procurando não existe ou você não tem permissão para acessá-lo.
          </p>
          <Link href="/events">
            <Button>
              <i className="fas fa-arrow-left mr-2"></i> Voltar para Eventos
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">{event.name}</h1>
        <p className="text-muted-foreground">{event.description}</p>
      </div>

      <Tabs defaultValue="resumo" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="resumo">Resumo</TabsTrigger>
          <TabsTrigger value="tarefas">Tarefas</TabsTrigger>
          <TabsTrigger value="team">Equipe</TabsTrigger>
          <TabsTrigger value="atividades">Atividades</TabsTrigger>
        </TabsList>
        
        <TabsContent value="resumo">
          <div className="bg-card rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Resumo do Evento</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p><strong>Data:</strong> {formatDate(event.startDate)}</p>
                <p><strong>Local:</strong> {event.location}</p>
                <p><strong>Formato:</strong> {event.format}</p>
              </div>
              <div>
                <p><strong>Orçamento:</strong> {formatCurrency(event.budget)}</p>
                <p><strong>Status:</strong> {event.status}</p>
                <p><strong>Participantes:</strong> {event.attendees}</p>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="tarefas">
          <TaskList
            title=""
            tasks={tasks || []}
            loading={tasksLoading}
            showEventName={false}
            showFilters={false}
          />
        </TabsContent>
        
        <TabsContent value="team">
          <div className="bg-card rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Equipe do Evento</h2>
              <Button 
                size="sm"
                onClick={() => setIsAddMemberModalOpen(true)}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Adicionar Membro
              </Button>
            </div>
            
            {/* Modal para selecionar membros da equipe */}
            <Dialog open={isAddMemberModalOpen} onOpenChange={setIsAddMemberModalOpen}>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Selecionar membros da equipe
                  </DialogTitle>
                  <DialogDescription>
                    Selecione membros da equipe geral para adicionar a este evento
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  {/* Search bar */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Pesquisar membros..."
                      value={memberSearchQuery}
                      onChange={(e) => setMemberSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  {/* List of available members */}
                  <div className="max-h-60 overflow-y-auto space-y-2">
                    {usersLoading ? (
                      <div className="flex justify-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
                      </div>
                    ) : filteredUsers && filteredUsers.length > 0 ? (
                      filteredUsers.map((user: any) => (
                        <div
                          key={user.id}
                          className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                            selectedMembers.includes(user.id) 
                              ? 'bg-primary/10 border border-primary/20' 
                              : 'bg-muted/50 hover:bg-muted'
                          }`}
                          onClick={() => {
                            setSelectedMembers(prev => 
                              prev.includes(user.id)
                                ? prev.filter(id => id !== user.id)
                                : [...prev, user.id]
                            );
                          }}
                        >
                          <Checkbox
                            checked={selectedMembers.includes(user.id)}
                            className="pointer-events-none"
                          />
                          
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user.profileImageUrl} />
                            <AvatarFallback>
                              {getInitials(user.firstName, user.lastName)}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1">
                            <p className="font-medium text-sm">
                              {user.firstName} {user.lastName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4 text-muted-foreground">
                        <p className="text-sm">Nenhum membro disponível para adicionar</p>
                      </div>
                    )}
                  </div>

                  {/* Link to add new member to general team */}
                  <div className="border-t pt-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-muted-foreground"
                      onClick={() => {
                        setIsAddMemberModalOpen(false);
                        window.open("/team", "_blank");
                      }}
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      + Adicionar novo membro à equipe geral
                    </Button>
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsAddMemberModalOpen(false);
                      setSelectedMembers([]);
                      setMemberSearchQuery("");
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={() => {
                      if (selectedMembers.length === 0) {
                        toast({
                          title: "Nenhum membro selecionado",
                          description: "Selecione pelo menos um membro para adicionar.",
                          variant: "destructive",
                        });
                        return;
                      }

                      addTeamMembersMutation.mutate(selectedMembers);
                    }}
                    disabled={selectedMembers.length === 0 || addTeamMembersMutation.isPending}
                  >
                    {addTeamMembersMutation.isPending 
                      ? "Adicionando..." 
                      : `Adicionar ${selectedMembers.length > 0 ? `(${selectedMembers.length})` : ""}`
                    }
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            
            {teamLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : team?.filter((member: any) => member.role !== 'vendor').length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {team.filter((member: any) => member.role !== 'vendor').map((member: any) => (
                  <div key={member.id} className="bg-muted/50 p-4 rounded-lg group relative border hover:border-primary/20 transition-all">
                    <div className="flex items-center">
                      <Avatar className="h-12 w-12 mr-4">
                        <AvatarImage src={member.user.profileImageUrl} />
                        <AvatarFallback>
                          {getInitials(member.user.firstName, member.user.lastName)}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <p className="font-medium">
                          {member.user.firstName} {member.user.lastName}
                        </p>
                        <Badge variant="secondary" className="text-xs mt-1">
                          {member.role === 'organizer' ? 'Organizador' : 'Membro da Equipe'}
                        </Badge>
                      </div>

                      {/* Three dots menu with only remove action */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4 text-gray-400" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem 
                            className="text-destructive focus:text-destructive" 
                            onClick={() => {
                              if (confirm(`Tem certeza que deseja remover ${member.user.firstName} da equipe deste evento?`)) {
                                removeTeamMemberMutation.mutate(member.user.id);
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Remover da equipe
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    
                    {member.user.email && (
                      <div className="mt-3 text-sm flex items-center text-muted-foreground">
                        <Mail className="h-3 w-3 mr-2" />
                        <span className="truncate">{member.user.email}</span>
                      </div>
                    )}
                    
                    {member.user.phone && (
                      <div className="mt-1 text-sm flex items-center text-muted-foreground">
                        <Phone className="h-3 w-3 mr-2" />
                        <span>{member.user.phone}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="mb-4 flex justify-center">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                    <Users className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <h3 className="text-lg font-medium mb-2">Nenhum membro na equipe</h3>
                <p className="text-muted-foreground mb-4">
                  Adicione membros à equipe para colaborar no planejamento deste evento.
                </p>
                <Button onClick={() => setIsAddMemberModalOpen(true)}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Adicionar Primeiro Membro
                </Button>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="atividades">
          <ActivityFeed 
            activities={activities || []} 
            loading={activitiesLoading}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Event;