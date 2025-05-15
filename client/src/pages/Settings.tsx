import React from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
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
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Shield, 
  Bell, 
  User, 
  Palette, 
  Mail,
  Key,
  Save,
  Trash2,
  LogOut,
  Moon,
  Sun,
  Laptop
} from "lucide-react";
import { getInitials } from "@/lib/utils";

interface ProfileForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  profileImageUrl: string;
}

interface NotificationSettings {
  emailNotifications: boolean;
  taskReminders: boolean;
  eventUpdates: boolean;
  teamMessages: boolean;
  marketingEmails: boolean;
}

const Settings: React.FC = () => {
  const { toast } = useToast();
  const { user, logout } = useAuth();
  const [activeTheme, setActiveTheme] = React.useState<"light" | "dark" | "system">("system");
  
  // Formulário de perfil
  const [profileForm, setProfileForm] = React.useState<ProfileForm>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    profileImageUrl: ""
  });
  
  // Configurações de notificações
  const [notificationSettings, setNotificationSettings] = React.useState<NotificationSettings>({
    emailNotifications: true,
    taskReminders: true,
    eventUpdates: true,
    teamMessages: true,
    marketingEmails: false
  });
  
  // Query para buscar dados do usuário
  const { data: userData, isLoading: isLoadingUser } = useQuery({
    queryKey: ["/api/auth/user"],
    enabled: !!user,
  });
  
  // Mutation para atualizar perfil
  const updateProfileMutation = useMutation({
    mutationFn: async (data: Partial<ProfileForm>) => {
      return apiRequest("/api/user/profile", {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Perfil atualizado",
        description: "Suas informações de perfil foram atualizadas com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro ao atualizar perfil",
        description: "Ocorreu um erro ao atualizar seu perfil. Tente novamente.",
        variant: "destructive",
      });
    },
  });
  
  // Mutation para atualizar notificações
  const updateNotificationsMutation = useMutation({
    mutationFn: async (data: NotificationSettings) => {
      return apiRequest("/api/user/notifications", {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        title: "Notificações atualizadas",
        description: "Suas preferências de notificação foram atualizadas com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro ao atualizar notificações",
        description: "Ocorreu um erro ao atualizar suas preferências de notificação. Tente novamente.",
        variant: "destructive",
      });
    },
  });
  
  // Preencher formulário quando dados do usuário estiverem disponíveis
  React.useEffect(() => {
    if (userData) {
      setProfileForm({
        firstName: userData.firstName || "",
        lastName: userData.lastName || "",
        email: userData.email || "",
        phone: userData.phone || "",
        profileImageUrl: userData.profileImageUrl || ""
      });
    }
  }, [userData]);
  
  // Detectar tema do sistema
  React.useEffect(() => {
    // Verificar o tema atual
    const theme = localStorage.getItem("theme");
    if (theme === "dark" || theme === "light") {
      setActiveTheme(theme);
    } else {
      setActiveTheme("system");
    }
    
    // Observer para mudanças de tema
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "class"
        ) {
          const htmlElement = document.documentElement;
          if (htmlElement.classList.contains("dark")) {
            setActiveTheme("dark");
          } else {
            setActiveTheme("light");
          }
        }
      });
    });
    
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    
    return () => observer.disconnect();
  }, []);
  
  // Handler para atualização de tema
  const handleThemeChange = (theme: "light" | "dark" | "system") => {
    setActiveTheme(theme);
    
    if (theme === "system") {
      localStorage.removeItem("theme");
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      document.documentElement.classList.remove("light", "dark");
      document.documentElement.classList.add(systemTheme);
    } else {
      localStorage.setItem("theme", theme);
      document.documentElement.classList.remove("light", "dark");
      document.documentElement.classList.add(theme);
    }
  };
  
  // Handler para atualizar perfil
  const handleUpdateProfile = () => {
    if (!profileForm.firstName || !profileForm.lastName) {
      toast({
        title: "Campos obrigatórios",
        description: "Nome e sobrenome são campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }
    
    updateProfileMutation.mutate({
      firstName: profileForm.firstName,
      lastName: profileForm.lastName,
      phone: profileForm.phone || undefined,
      profileImageUrl: profileForm.profileImageUrl || undefined
    });
  };
  
  // Handler para atualizar notificações
  const handleUpdateNotifications = () => {
    updateNotificationsMutation.mutate(notificationSettings);
  };
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Configurações</h1>
      </div>
      
      <Tabs defaultValue="profile" className="w-full">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-64 shrink-0">
            <TabsList className="flex flex-col h-auto p-0 bg-transparent">
              <TabsTrigger
                value="profile"
                className="justify-start py-2 px-3 h-10 data-[state=active]:bg-muted"
              >
                <User className="h-4 w-4 mr-2" />
                Perfil
              </TabsTrigger>
              <TabsTrigger
                value="notifications"
                className="justify-start py-2 px-3 h-10 data-[state=active]:bg-muted"
              >
                <Bell className="h-4 w-4 mr-2" />
                Notificações
              </TabsTrigger>
              <TabsTrigger
                value="appearance"
                className="justify-start py-2 px-3 h-10 data-[state=active]:bg-muted"
              >
                <Palette className="h-4 w-4 mr-2" />
                Aparência
              </TabsTrigger>
              <TabsTrigger
                value="security"
                className="justify-start py-2 px-3 h-10 data-[state=active]:bg-muted"
              >
                <Shield className="h-4 w-4 mr-2" />
                Segurança
              </TabsTrigger>
            </TabsList>
          </div>
          
          <div className="flex-1">
            <TabsContent value="profile" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Perfil</CardTitle>
                  <CardDescription>
                    Gerencie suas informações de perfil
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                    <Avatar className="h-20 w-20">
                      <AvatarImage 
                        src={profileForm.profileImageUrl} 
                        alt={`${profileForm.firstName} ${profileForm.lastName}`} 
                      />
                      <AvatarFallback className="text-lg">
                        {getInitials(`${profileForm.firstName} ${profileForm.lastName}`)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-1.5">
                      <h3 className="font-semibold text-lg">Foto de Perfil</h3>
                      <p className="text-sm text-muted-foreground">
                        Sua foto será exibida em seu perfil e nas notificações
                      </p>
                      <div className="flex gap-2 mt-2">
                        <Button variant="outline" size="sm">Alterar</Button>
                        <Button variant="ghost" size="sm">Remover</Button>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="grid gap-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">Nome</Label>
                        <Input
                          id="firstName"
                          value={profileForm.firstName}
                          onChange={(e) => setProfileForm({...profileForm, firstName: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Sobrenome</Label>
                        <Input
                          id="lastName"
                          value={profileForm.lastName}
                          onChange={(e) => setProfileForm({...profileForm, lastName: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">E-mail</Label>
                        <Input
                          id="email"
                          type="email"
                          value={profileForm.email}
                          disabled
                        />
                        <p className="text-xs text-muted-foreground">
                          O e-mail não pode ser alterado
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Telefone</Label>
                        <Input
                          id="phone"
                          value={profileForm.phone}
                          onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})}
                          placeholder="(00) 00000-0000"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between border-t p-6">
                  <Button variant="outline">Cancelar</Button>
                  <Button onClick={handleUpdateProfile} disabled={updateProfileMutation.isPending}>
                    {updateProfileMutation.isPending ? (
                      <div className="flex items-center">
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"></div>
                        Salvando...
                      </div>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Salvar Alterações
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="notifications" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Notificações</CardTitle>
                  <CardDescription>
                    Gerencie como e quando você recebe notificações
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Preferências de E-mail</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <div className="font-medium">Notificações por E-mail</div>
                          <div className="text-sm text-muted-foreground">
                            Receba notificações por e-mail
                          </div>
                        </div>
                        <Switch
                          checked={notificationSettings.emailNotifications}
                          onCheckedChange={(checked) => 
                            setNotificationSettings({...notificationSettings, emailNotifications: checked})
                          }
                        />
                      </div>
                      
                      <Separator />
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <div className="font-medium">Lembretes de Tarefas</div>
                          <div className="text-sm text-muted-foreground">
                            Receba lembretes sobre tarefas próximas da data de vencimento
                          </div>
                        </div>
                        <Switch
                          checked={notificationSettings.taskReminders}
                          onCheckedChange={(checked) => 
                            setNotificationSettings({...notificationSettings, taskReminders: checked})
                          }
                          disabled={!notificationSettings.emailNotifications}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <div className="font-medium">Atualizações de Eventos</div>
                          <div className="text-sm text-muted-foreground">
                            Receba atualizações sobre seus eventos
                          </div>
                        </div>
                        <Switch
                          checked={notificationSettings.eventUpdates}
                          onCheckedChange={(checked) => 
                            setNotificationSettings({...notificationSettings, eventUpdates: checked})
                          }
                          disabled={!notificationSettings.emailNotifications}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <div className="font-medium">Mensagens da Equipe</div>
                          <div className="text-sm text-muted-foreground">
                            Receba notificações sobre mensagens da equipe
                          </div>
                        </div>
                        <Switch
                          checked={notificationSettings.teamMessages}
                          onCheckedChange={(checked) => 
                            setNotificationSettings({...notificationSettings, teamMessages: checked})
                          }
                          disabled={!notificationSettings.emailNotifications}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Marketing</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <div className="font-medium">E-mails de Marketing</div>
                          <div className="text-sm text-muted-foreground">
                            Receba dicas, novidades e ofertas especiais
                          </div>
                        </div>
                        <Switch
                          checked={notificationSettings.marketingEmails}
                          onCheckedChange={(checked) => 
                            setNotificationSettings({...notificationSettings, marketingEmails: checked})
                          }
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between border-t p-6">
                  <Button variant="outline">Cancelar</Button>
                  <Button 
                    onClick={handleUpdateNotifications} 
                    disabled={updateNotificationsMutation.isPending}
                  >
                    {updateNotificationsMutation.isPending ? (
                      <div className="flex items-center">
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"></div>
                        Salvando...
                      </div>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Salvar Preferências
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="appearance" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Aparência</CardTitle>
                  <CardDescription>
                    Personalize a aparência do Symera
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Tema</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div 
                        className={`border rounded-lg p-4 cursor-pointer transition-all ${
                          activeTheme === 'light' 
                            ? 'border-primary bg-primary/5 shadow-sm' 
                            : 'hover:border-primary/50'
                        }`}
                        onClick={() => handleThemeChange('light')}
                      >
                        <div className="flex flex-col items-center justify-center">
                          <Sun className="h-10 w-10 mb-3 text-amber-500" />
                          <span className="font-medium">Claro</span>
                        </div>
                      </div>
                      
                      <div 
                        className={`border rounded-lg p-4 cursor-pointer transition-all ${
                          activeTheme === 'dark' 
                            ? 'border-primary bg-primary/5 shadow-sm' 
                            : 'hover:border-primary/50'
                        }`}
                        onClick={() => handleThemeChange('dark')}
                      >
                        <div className="flex flex-col items-center justify-center">
                          <Moon className="h-10 w-10 mb-3 text-purple-500" />
                          <span className="font-medium">Escuro</span>
                        </div>
                      </div>
                      
                      <div 
                        className={`border rounded-lg p-4 cursor-pointer transition-all ${
                          activeTheme === 'system' 
                            ? 'border-primary bg-primary/5 shadow-sm' 
                            : 'hover:border-primary/50'
                        }`}
                        onClick={() => handleThemeChange('system')}
                      >
                        <div className="flex flex-col items-center justify-center">
                          <Laptop className="h-10 w-10 mb-3 text-blue-500" />
                          <span className="font-medium">Sistema</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="security" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Segurança</CardTitle>
                  <CardDescription>
                    Gerencie a segurança da sua conta
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Conta</h3>
                    
                    <div className="border rounded-lg">
                      <div className="p-4 border-b">
                        <div className="flex items-center gap-4">
                          <Mail className="h-5 w-5 text-muted-foreground" />
                          <div className="flex-1">
                            <div className="font-medium">E-mail</div>
                            <div className="text-sm text-muted-foreground mt-0.5">
                              {userData?.email || 'Seu e-mail'}
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            Verificado
                          </Button>
                        </div>
                      </div>
                      
                      <div className="p-4">
                        <div className="flex items-center gap-4">
                          <Key className="h-5 w-5 text-muted-foreground" />
                          <div className="flex-1">
                            <div className="font-medium">Senha</div>
                            <div className="text-sm text-muted-foreground mt-0.5">
                              Altere sua senha periodicamente para maior segurança
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            Alterar Senha
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Ações da Conta</h3>
                    
                    <div className="border rounded-lg">
                      <div className="p-4 border-b">
                        <div className="flex items-center gap-4">
                          <LogOut className="h-5 w-5 text-muted-foreground" />
                          <div className="flex-1">
                            <div className="font-medium">Sair da Conta</div>
                            <div className="text-sm text-muted-foreground mt-0.5">
                              Sair da sua conta em todos os dispositivos
                            </div>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => logout()}
                          >
                            Sair
                          </Button>
                        </div>
                      </div>
                      
                      <div className="p-4">
                        <div className="flex items-center gap-4">
                          <Trash2 className="h-5 w-5 text-destructive" />
                          <div className="flex-1">
                            <div className="font-medium text-destructive">Excluir Conta</div>
                            <div className="text-sm text-muted-foreground mt-0.5">
                              Excluir permanentemente sua conta e todos os seus dados
                            </div>
                          </div>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => {
                              if (confirm("Tem certeza que deseja excluir sua conta? Esta ação não pode ser desfeita.")) {
                                // Lógica para excluir conta
                                toast({
                                  title: "Conta não excluída",
                                  description: "A exclusão de conta está desabilitada nesta versão.",
                                  variant: "destructive",
                                });
                              }
                            }}
                          >
                            Excluir
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </div>
      </Tabs>
    </div>
  );
};

export default Settings;