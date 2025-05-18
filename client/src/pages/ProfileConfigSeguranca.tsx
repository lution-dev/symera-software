import React from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";

// Componentes UI
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

// Ícones
import { ChevronLeft, Mail, Key, Laptop, LogOut } from "lucide-react";

interface ProfileData {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  profileImageUrl?: string;
}

const ProfileConfigSeguranca: React.FC = () => {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  
  // Query para buscar dados do usuário
  const { data: userData, isLoading: isLoadingUser } = useQuery<ProfileData>({
    queryKey: ["/api/auth/user"],
    enabled: !!user,
  });
  
  if (isLoadingUser) {
    return (
      <div className="container mx-auto px-4 py-6 flex items-center justify-center h-[80vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando configurações...</p>
        </div>
      </div>
    );
  }
  
  const handleLogout = () => {
    window.location.href = "/api/logout";
  };
  
  return (
    <div className="container mx-auto px-4 py-6 max-w-3xl space-y-6">
      
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
          
          <Separator className="my-6" />
          
          <div className="space-y-6">
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
                      onClick={handleLogout}
                    >
                      <LogOut className="h-3.5 w-3.5 mr-1.5" />
                      Sair
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileConfigSeguranca;