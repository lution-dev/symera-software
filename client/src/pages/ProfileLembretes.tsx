import React from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// Componentes UI
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Ícones
import { ChevronLeft, Bell, Calendar, Clock, Plus } from "lucide-react";

interface Reminder {
  id: number;
  title: string;
  dueDate: string;
  description?: string;
  priority: string;
  isCompleted: boolean;
}

const ProfileLembretes: React.FC = () => {
  const { user } = useAuth();
  const [, navigate] = useLocation();

  // Query para buscar lembretes do usuário
  const { data: reminders, isLoading } = useQuery<Reminder[]>({
    queryKey: ["/api/reminders"],
    enabled: !!user,
    initialData: [],
  });

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    } catch (e) {
      return "Data desconhecida";
    }
  };

  const getPriorityLabel = (priority: string) => {
    const priorities: Record<string, string> = {
      "high": "Alta",
      "medium": "Média",
      "low": "Baixa"
    };
    return priorities[priority] || "Normal";
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400";
      case "medium":
        return "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400";
      case "low":
        return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400";
      default:
        return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400";
    }
  };

  const renderRemindersList = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
        </div>
      );
    }

    if (!reminders || reminders.length === 0) {
      return (
        <div className="text-center py-12">
          <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Nenhum lembrete encontrado</h3>
          <p className="text-sm text-muted-foreground mb-6">
            Você ainda não criou nenhum lembrete na plataforma.
          </p>
          <Button onClick={() => navigate("/reminders/new")}>
            <Plus className="mr-2 h-4 w-4" />
            Criar Novo Lembrete
          </Button>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {reminders.map((reminder) => (
          <Card key={reminder.id} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-start space-x-4">
                <div className={`p-2 rounded-full ${reminder.isCompleted ? 'bg-green-100' : 'bg-primary/10'}`}>
                  {reminder.isCompleted ? (
                    <Clock className="h-5 w-5 text-green-600" />
                  ) : (
                    <Bell className="h-5 w-5 text-primary" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-medium pr-2">{reminder.title}</h3>
                    <Badge variant="outline" className={`${getPriorityColor(reminder.priority)}`}>
                      {getPriorityLabel(reminder.priority)}
                    </Badge>
                  </div>
                  {reminder.description && (
                    <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                      {reminder.description}
                    </p>
                  )}
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5 mr-1" />
                    {formatDate(reminder.dueDate)}
                  </div>
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
        <h1 className="text-2xl font-bold">Meus Lembretes</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Lembretes</CardTitle>
          <CardDescription>
            Gerencie todos os seus lembretes na plataforma
          </CardDescription>
        </CardHeader>
        <CardContent>
          {renderRemindersList()}
        </CardContent>
        {reminders && reminders.length > 0 && (
          <CardFooter className="border-t px-6 py-4">
            <Button variant="outline" className="w-full" onClick={() => navigate("/reminders/new")}>
              <Plus className="mr-2 h-4 w-4" />
              Criar Novo Lembrete
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
};

export default ProfileLembretes;