import React from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";

// Componentes UI
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";

// Ícones
import { ChevronLeft, Users, UserPlus } from "lucide-react";

interface TeamMember {
  id: number;
  userId: string;
  eventId: number;
  role: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    profileImageUrl?: string;
  };
}

const ProfileEquipe: React.FC = () => {
  const { user } = useAuth();
  const [, navigate] = useLocation();

  // Query para buscar membros da equipe
  const { data: teamMembers, isLoading } = useQuery<TeamMember[]>({
    queryKey: ["/api/team"],
    enabled: !!user,
    initialData: [],
  });

  const getRoleLabel = (role: string) => {
    const roles: Record<string, string> = {
      "owner": "Proprietário",
      "admin": "Administrador",
      "member": "Membro",
      "guest": "Convidado"
    };
    return roles[role] || "Membro";
  };

  const renderTeamList = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
        </div>
      );
    }

    if (!teamMembers || teamMembers.length === 0) {
      return (
        <div className="text-center py-12">
          <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Nenhuma equipe encontrada</h3>
          <p className="text-sm text-muted-foreground mb-6">
            Você ainda não participa de nenhuma equipe na plataforma.
          </p>
          <Button onClick={() => navigate("/team/new")}>
            <UserPlus className="mr-2 h-4 w-4" />
            Criar Nova Equipe
          </Button>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {teamMembers.map((member) => (
          <Card key={member.id} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                <Avatar>
                  {member.user.profileImageUrl ? (
                    <AvatarImage src={member.user.profileImageUrl} alt={`${member.user.firstName} ${member.user.lastName}`} />
                  ) : null}
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {getInitials(`${member.user.firstName} ${member.user.lastName}`)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">
                    {member.user.firstName} {member.user.lastName}
                  </p>
                  <p className="text-sm text-muted-foreground truncate">
                    {member.user.email}
                  </p>
                </div>
                <div className="text-sm px-2.5 py-0.5 rounded-full bg-primary/10 text-primary">
                  {getRoleLabel(member.role)}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-3xl space-y-6">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate("/profile")} className="mr-2">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Voltar
        </Button>
        <h1 className="text-2xl font-bold">Minha Equipe</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Equipe</CardTitle>
          <CardDescription>
            Gerencie todas as suas equipes na plataforma
          </CardDescription>
        </CardHeader>
        <CardContent>
          {renderTeamList()}
        </CardContent>
        {teamMembers && teamMembers.length > 0 && (
          <CardFooter className="border-t px-6 py-4">
            <Button variant="outline" className="w-full" onClick={() => navigate("/team/new")}>
              <UserPlus className="mr-2 h-4 w-4" />
              Criar Nova Equipe
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
};

export default ProfileEquipe;