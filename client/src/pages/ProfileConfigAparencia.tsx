import React from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

// Componentes UI
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// Ícones
import { ChevronLeft, Sun, Moon, Laptop } from "lucide-react";

const ProfileConfigAparencia: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [activeTheme, setActiveTheme] = React.useState<"light" | "dark" | "system">("system");
  
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
      
      toast({
        title: "Tema alterado",
        description: "Aparência definida para seguir as configurações do sistema.",
      });
    } else {
      localStorage.setItem("theme", theme);
      document.documentElement.classList.remove("light", "dark");
      document.documentElement.classList.add(theme);
      
      toast({
        title: "Tema alterado",
        description: `Aparência definida para o tema ${theme === "light" ? "claro" : "escuro"}.`,
      });
    }
    
    setTimeout(() => {
      navigate("/profile/configuracoes");
    }, 1000);
  };
  
  return (
    <div className="container mx-auto px-4 py-6 max-w-3xl space-y-6">
      
      <Card>
        <CardHeader>
          <CardTitle>Aparência</CardTitle>
          <CardDescription>
            Personalize a aparência do aplicativo
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
            
            <div className="grid grid-cols-1 gap-5">
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
    </div>
  );
};

export default ProfileConfigAparencia;