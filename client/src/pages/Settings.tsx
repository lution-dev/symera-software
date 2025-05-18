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
import MobileProfileCard from "@/components/profile/MobileProfileCard";
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
  const { user } = useAuth();
  const [activeTheme, setActiveTheme] = React.useState<"light" | "dark" | "system">("system");
  
  // Formulário de perfil
  const [profileForm, setProfileForm] = React.useState<ProfileForm>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    profileImageUrl: ""
  });
  
  // Referência para o input de arquivo
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  
  // Configurações de notificações
  const [notificationSettings, setNotificationSettings] = React.useState<NotificationSettings>({
    emailNotifications: true,
    taskReminders: true,
    eventUpdates: true,
    teamMessages: true,
    marketingEmails: false
  });
  
  // Query para buscar dados do usuário
  const { data: userData, isLoading: isLoadingUser } = useQuery<ProfileForm>({
    queryKey: ["/api/auth/user"],
    enabled: !!user,
  });
  
  // Mutation para atualizar perfil
  const updateProfileMutation = useMutation({
    mutationFn: async (data: Partial<ProfileForm>) => {
      return apiRequest("/api/user/profile", {
        method: "PUT",
        body: data, // Removed JSON.stringify - apiRequest already handles this
        headers: {
          "Content-Type": "application/json"
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Perfil atualizado",
        description: "Suas informações de perfil foram atualizadas com sucesso.",
      });
    },
    onError: (error) => {
      console.error("Profile update error:", error);
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
        headers: {
          "Content-Type": "application/json"
        }
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
  
  // Handler para upload de imagem de perfil
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Verifica o tamanho do arquivo (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Arquivo muito grande",
        description: "Por favor, selecione uma imagem com menos de 5MB.",
        variant: "destructive",
      });
      return;
    }
    
    // Verifica o tipo do arquivo
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Formato inválido",
        description: "Por favor, selecione um arquivo de imagem válido.",
        variant: "destructive",
      });
      return;
    }
    
    // Converter para base64 para preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setProfileForm({...profileForm, profileImageUrl: result});
    };
    reader.readAsDataURL(file);
  };
  
  // Trigger para abrir o seletor de arquivo
  const handleChooseImage = () => {
    fileInputRef.current?.click();
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
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Configurações</h1>
      </div>
      
      <Tabs defaultValue="profile" className="w-full">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-64 shrink-0">
            <Card className="border shadow-sm">
              <div className="px-3 py-4 border-b">
                <h3 className="text-lg font-semibold">Configurações</h3>
              </div>
              <TabsList className="flex flex-col h-auto p-0 bg-transparent rounded-none w-full items-start">
                <TabsTrigger
                  value="profile"
                  className="justify-start py-3 px-4 h-12 rounded-none border-l-2 border-l-transparent data-[state=active]:border-l-primary data-[state=active]:bg-primary/5 data-[state=active]:text-primary font-medium w-full text-left"
                >
                  <User className="h-5 w-5 mr-3" />
                  Perfil
                </TabsTrigger>
                <TabsTrigger
                  value="notifications"
                  className="justify-start py-3 px-4 h-12 rounded-none border-l-2 border-l-transparent data-[state=active]:border-l-primary data-[state=active]:bg-primary/5 data-[state=active]:text-primary font-medium w-full text-left"
                >
                  <Bell className="h-5 w-5 mr-3" />
                  Notificações
                </TabsTrigger>
                <TabsTrigger
                  value="appearance"
                  className="justify-start py-3 px-4 h-12 rounded-none border-l-2 border-l-transparent data-[state=active]:border-l-primary data-[state=active]:bg-primary/5 data-[state=active]:text-primary font-medium w-full text-left"
                >
                  <Palette className="h-5 w-5 mr-3" />
                  Aparência
                </TabsTrigger>
                <TabsTrigger
                  value="security" 
                  className="justify-start py-3 px-4 h-12 rounded-none border-l-2 border-l-transparent data-[state=active]:border-l-primary data-[state=active]:bg-primary/5 data-[state=active]:text-primary font-medium w-full text-left"
                >
                  <Shield className="h-5 w-5 mr-3" />
                  Segurança
                </TabsTrigger>
              </TabsList>
            </Card>
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
                  {/* Versão para dispositivo móvel */}
                  <div className="block sm:hidden">
                    <MobileProfileCard 
                      firstName={profileForm.firstName}
                      lastName={profileForm.lastName}
                      profileImageUrl={profileForm.profileImageUrl}
                      onChooseImage={handleChooseImage}
                      onRemoveImage={() => setProfileForm({...profileForm, profileImageUrl: ""})}
                      fileInputRef={fileInputRef}
                      handleImageUpload={handleImageUpload}
                    />
                  </div>
                  
                  {/* Versão para desktop */}
                  <div className="hidden sm:block">
                    <div className="p-4 bg-primary/5 rounded-xl border border-primary/10">
                      <div className="flex flex-row gap-6 items-center">
                        <Avatar className="h-24 w-24 ring-2 ring-primary/20 ring-offset-2">
                          {profileForm.profileImageUrl ? (
                            <AvatarImage 
                              src={profileForm.profileImageUrl} 
                              alt={`${profileForm.firstName} ${profileForm.lastName}`} 
                            />
                          ) : null}
                          <AvatarFallback className="text-2xl bg-gradient-primary text-white">
                            {getInitials(`${profileForm.firstName} ${profileForm.lastName}`)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="space-y-2 w-full">
                          <h3 className="font-bold text-lg text-primary">Foto de Perfil</h3>
                          <p className="text-sm text-muted-foreground">
                            Sua foto será exibida em seu perfil e nas notificações
                          </p>
                          <div className="flex gap-2 mt-2">
                            <input
                              type="file"
                              ref={fileInputRef}
                              accept="image/*"
                              onChange={handleImageUpload}
                              className="hidden"
                            />
                            <Button 
                              variant="default"
                              size="sm"
                              onClick={handleChooseImage}
                            >
                              Alterar Foto
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => setProfileForm({...profileForm, profileImageUrl: ""})}
                              disabled={!profileForm.profileImageUrl}
                            >
                              Remover Foto
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="grid gap-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName" className="font-medium">Nome</Label>
                        <Input
                          id="firstName"
                          value={profileForm.firstName}
                          onChange={(e) => setProfileForm({...profileForm, firstName: e.target.value})}
                          className="h-10"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName" className="font-medium">Sobrenome</Label>
                        <Input
                          id="lastName"
                          value={profileForm.lastName}
                          onChange={(e) => setProfileForm({...profileForm, lastName: e.target.value})}
                          className="h-10"
                        />
                      </div>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="email" className="font-medium">E-mail</Label>
                        <Input
                          id="email"
                          type="email"
                          value={profileForm.email}
                          disabled
                          className="h-10 opacity-80"
                        />
                        <p className="text-xs text-muted-foreground">
                          O e-mail não pode ser alterado
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone" className="font-medium">Telefone</Label>
                        <Input
                          id="phone"
                          value={profileForm.phone}
                          onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})}
                          placeholder="(00) 00000-0000"
                          className="h-10"
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
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Tema da Interface</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Personalize a aparência da plataforma de acordo com sua preferência
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      <div 
                        className={`border rounded-lg overflow-hidden shadow-sm cursor-pointer transition-all ${
                          activeTheme === 'light' 
                            ? 'ring-2 ring-primary' 
                            : 'hover:border-primary/50'
                        }`}
                        onClick={() => handleThemeChange('light')}
                      >
                        <div className="bg-gradient-to-b from-blue-50 to-white dark:from-gray-800 dark:to-gray-900 p-4 border-b">
                          <Sun className="h-8 w-8 text-amber-500" />
                        </div>
                        <div className="p-4">
                          <div className="flex items-center space-x-3">
                            <div className={`w-4 h-4 rounded-full border ${activeTheme === 'light' ? 'bg-primary border-primary' : 'border-gray-300'}`}>
                              {activeTheme === 'light' && <div className="w-2 h-2 bg-white rounded-full m-[3px]"></div>}
                            </div>
                            <span className="font-medium">Tema Claro</span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-2">
                            Ideal para ambientes bem iluminados
                          </p>
                        </div>
                      </div>
                      
                      <div 
                        className={`border rounded-lg overflow-hidden shadow-sm cursor-pointer transition-all ${
                          activeTheme === 'dark' 
                            ? 'ring-2 ring-primary' 
                            : 'hover:border-primary/50'
                        }`}
                        onClick={() => handleThemeChange('dark')}
                      >
                        <div className="bg-gradient-to-b from-gray-800 to-gray-900 p-4 border-b">
                          <Moon className="h-8 w-8 text-purple-400" />
                        </div>
                        <div className="p-4">
                          <div className="flex items-center space-x-3">
                            <div className={`w-4 h-4 rounded-full border ${activeTheme === 'dark' ? 'bg-primary border-primary' : 'border-gray-300'}`}>
                              {activeTheme === 'dark' && <div className="w-2 h-2 bg-white rounded-full m-[3px]"></div>}
                            </div>
                            <span className="font-medium">Tema Escuro</span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-2">
                            Melhor para uso noturno e economia de energia
                          </p>
                        </div>
                      </div>
                      
                      <div 
                        className={`border rounded-lg overflow-hidden shadow-sm cursor-pointer transition-all ${
                          activeTheme === 'system' 
                            ? 'ring-2 ring-primary' 
                            : 'hover:border-primary/50'
                        }`}
                        onClick={() => handleThemeChange('system')}
                      >
                        <div className="bg-gradient-to-b from-blue-100 to-blue-50 dark:from-blue-900 dark:to-blue-800 p-4 border-b">
                          <Laptop className="h-8 w-8 text-blue-500 dark:text-blue-400" />
                        </div>
                        <div className="p-4">
                          <div className="flex items-center space-x-3">
                            <div className={`w-4 h-4 rounded-full border ${activeTheme === 'system' ? 'bg-primary border-primary' : 'border-gray-300'}`}>
                              {activeTheme === 'system' && <div className="w-2 h-2 bg-white rounded-full m-[3px]"></div>}
                            </div>
                            <span className="font-medium">Sistema</span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-2">
                            Segue as configurações do seu dispositivo
                          </p>
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
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Segurança da Conta</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Gerencie as informações de acesso e segurança da sua conta
                      </p>
                    </div>
                    
                    <div className="rounded-xl border shadow-sm divide-y">
                      <div className="p-5">
                        <div className="flex items-center gap-5">
                          <div className="flex-shrink-0 bg-blue-50 dark:bg-blue-900/30 p-3 rounded-full">
                            <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-base">E-mail</div>
                            <div className="text-sm text-muted-foreground mt-1">
                              {userData?.email || 'Seu e-mail de acesso'}
                            </div>
                          </div>
                          <div className="flex-shrink-0">
                            <div className="inline-flex items-center px-2.5 py-0.5 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 text-xs font-medium rounded-full">
                              <div className="h-1.5 w-1.5 mr-1.5 rounded-full bg-green-500"></div>
                              Verificado
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-5">
                        <div className="flex items-center gap-5">
                          <div className="flex-shrink-0 bg-amber-50 dark:bg-amber-900/30 p-3 rounded-full">
                            <Key className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-base">Senha</div>
                            <div className="text-sm text-muted-foreground mt-1">
                              Última alteração há 30 dias. Recomendamos a troca periódica para maior segurança.
                            </div>
                          </div>
                          <div className="flex-shrink-0">
                            <Button variant="outline" size="sm" className="font-medium h-9">
                              <Key className="h-3.5 w-3.5 mr-1.5" />
                              Alterar Senha
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-8">
                      <h3 className="text-lg font-semibold mb-4">Atividade da Conta</h3>
                      <div className="rounded-xl border shadow-sm divide-y">
                        <div className="p-4 flex justify-between items-center bg-muted/50">
                          <div className="font-medium">Sessões Ativas</div>
                          <Button variant="ghost" size="sm">Ver Todas</Button>
                        </div>
                        <div className="p-5">
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                              <Laptop className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between">
                                <div className="font-medium">Este dispositivo</div>
                                <div className="text-xs text-muted-foreground">Ativo agora</div>
                              </div>
                              <div className="flex text-xs text-muted-foreground mt-1">
                                <span className="mr-3">Chrome em Windows</span>
                                <span>São Paulo, BR</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-6 pt-6 border-t">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Gerenciamento de Conta</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Opções para gerenciar sua sessão e conta
                      </p>
                    </div>
                    
                    <div className="rounded-xl border shadow-sm">
                      <div className="p-4 bg-muted/50 border-b">
                        <div className="font-medium">Sessão Atual</div>
                      </div>
                      
                      <div className="p-5">
                        <div className="flex items-center gap-5">
                          <div className="flex-shrink-0 bg-sky-50 dark:bg-sky-900/30 p-3 rounded-full">
                            <LogOut className="h-5 w-5 text-sky-600 dark:text-sky-400" />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-base">Encerrar Sessão</div>
                            <div className="text-sm text-muted-foreground mt-1">
                              Sair da sua conta em todos os dispositivos
                            </div>
                          </div>
                          <div className="flex-shrink-0">
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="font-medium h-9"
                              onClick={() => window.location.href = "/api/logout"}
                            >
                              <LogOut className="h-3.5 w-3.5 mr-1.5" />
                              Sair
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-8">
                      <h3 className="text-lg font-semibold text-destructive mb-4">Zona de Perigo</h3>
                      <div className="rounded-xl border border-destructive/15 bg-destructive/5 p-5">
                        <div className="flex flex-col sm:flex-row gap-4 items-center sm:items-start">
                          <div className="bg-destructive/10 p-3 rounded-full">
                            <Trash2 className="h-5 w-5 text-destructive" />
                          </div>
                          <div className="flex-1 text-center sm:text-left">
                            <h4 className="font-medium text-destructive text-lg">Excluir Conta</h4>
                            <p className="text-sm text-muted-foreground mt-2">
                              Ao excluir sua conta, todos os seus dados serão permanentemente removidos de nossos servidores. 
                              Esta ação não pode ser desfeita, então tenha certeza antes de prosseguir.
                            </p>
                            <div className="mt-4 flex justify-center sm:justify-start">
                              <Button 
                                variant="destructive" 
                                size="sm"
                                className="h-9 px-4"
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
                                <Trash2 className="h-4 w-4 mr-2" />
                                Excluir Permanentemente
                              </Button>
                            </div>
                          </div>
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