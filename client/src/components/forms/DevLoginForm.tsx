import React, { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation } from "wouter";
import { queryClient } from "@/lib/queryClient";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader2, Mail, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  email: z.string().email("Digite um e-mail válido").min(1, "E-mail é obrigatório"),
});

type FormValues = z.infer<typeof formSchema>;

const LoginForm: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/dev-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(values),
        credentials: "include"
      });
      
      if (response.ok) {
        // Invalidar a query atual para que os dados sejam buscados novamente
        queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
        toast({
          title: "Login bem-sucedido!",
          description: "Bem-vindo de volta ao EventMaster.",
        });
        navigate("/");
      } else {
        throw new Error("Falha no login");
      }
    } catch (error) {
      console.error("Erro no login:", error);
      toast({
        title: "Erro no login",
        description: "Não foi possível fazer login. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Opção alternativa para login institucional (escondida e sem referência ao Replit)
  const handleAlternativeLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-700">E-mail</FormLabel>
              <FormControl>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input 
                    placeholder="seu@email.com" 
                    className="pl-10 py-6" 
                    {...field}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button 
          type="submit" 
          className="w-full py-6 text-base font-medium transition-all bg-purple-600 hover:bg-purple-700" 
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Entrando...
            </>
          ) : (
            "Entrar"
          )}
        </Button>
        
        <div className="text-center space-y-3">
          <p className="text-sm text-gray-500">
            Sem cadastro? Entre com seu e-mail para criar uma conta.
          </p>
          
          {/* Link escondido para login alternativo */}
          <button 
            type="button"
            onClick={handleAlternativeLogin}
            className="text-xs text-gray-400 hover:text-gray-500 hover:underline hidden"
          >
            Login institucional
          </button>
        </div>
      </form>
    </Form>
  );
};

export default LoginForm;