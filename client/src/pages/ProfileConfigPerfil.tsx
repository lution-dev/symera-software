import React from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { getInitials } from "@/lib/utils";

// Componentes UI
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

// Ícones
import { ChevronLeft, Save } from "lucide-react";

interface ProfileForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  profileImageUrl: string;
}

const ProfileConfigPerfil: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [, navigate] = useLocation();
  
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
        body: JSON.stringify(data),
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
      navigate("/profile/configuracoes");
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

  if (isLoadingUser) {
    return (
      <div className="container mx-auto px-4 py-6 flex items-center justify-center h-[80vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando perfil...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-6 max-w-3xl space-y-6">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate("/profile/configuracoes")} className="mr-2">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Voltar
        </Button>
        <h1 className="text-2xl font-bold">Perfil</h1>
      </div>
      
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
              {profileForm.profileImageUrl ? (
                <AvatarImage 
                  src={profileForm.profileImageUrl} 
                  alt={`${profileForm.firstName} ${profileForm.lastName}`} 
                />
              ) : null}
              <AvatarFallback className="text-lg bg-gradient-primary text-white">
                {getInitials(`${profileForm.firstName} ${profileForm.lastName}`)}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1.5">
              <h3 className="font-semibold text-lg">Foto de Perfil</h3>
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
                  variant="outline" 
                  size="sm"
                  onClick={handleChooseImage}
                >
                  Alterar
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setProfileForm({...profileForm, profileImageUrl: ""})}
                  disabled={!profileForm.profileImageUrl}
                >
                  Remover
                </Button>
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
          <Button variant="outline" onClick={() => navigate("/profile/configuracoes")}>Cancelar</Button>
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
    </div>
  );
};

export default ProfileConfigPerfil;