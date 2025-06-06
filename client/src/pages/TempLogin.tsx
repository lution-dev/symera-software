import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useLocation } from 'wouter';

export default function TempLogin() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const handleTempLogin = async () => {
    try {
      const response = await apiRequest('/api/auth/temp-login', {
        method: 'POST',
      });
      
      if (response.user) {
        toast({
          title: "Login realizado com sucesso",
          description: "Bem-vindo ao sistema!",
        });
        setLocation('/');
      }
    } catch (error) {
      console.error('Erro no login:', error);
      toast({
        title: "Erro no login",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">
            Symera Events
          </CardTitle>
          <p className="text-gray-600 mt-2">
            Sistema de Gestão de Eventos
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-4">
              Acesso temporário para demonstração
            </p>
            <Button 
              onClick={handleTempLogin}
              className="w-full bg-blue-600 hover:bg-blue-700"
              size="lg"
            >
              Entrar no Sistema
            </Button>
          </div>
          
          <div className="pt-4 border-t">
            <p className="text-xs text-gray-400 text-center">
              Este é um login temporário para demonstração.
              Em produção, você usaria suas credenciais reais.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}