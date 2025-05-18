import React, { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger,
  SheetClose
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";

// Define User interface based on what we found in the codebase
interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
}

const MobileNavbar: React.FC = () => {
  const [location] = useLocation();
  const { user } = useAuth() as { user: User | null | undefined };
  const [hasScrolled, setHasScrolled] = useState(false);
  const [showNavbarTop, setShowNavbarTop] = useState(true);
  const [lastScrollTop, setLastScrollTop] = useState(0);

  // Monitorar rolagem para esconder/mostrar a navbar superior
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      
      // Determina se rolou para baixo
      if (scrollTop > lastScrollTop && scrollTop > 100) {
        setShowNavbarTop(false); // Esconder quando rolar para baixo
      } else {
        setShowNavbarTop(true); // Mostrar quando rolar para cima
      }
      
      setHasScrolled(scrollTop > 20);
      setLastScrollTop(scrollTop);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollTop]);

  // Items que estarão sempre na barra de navegação principal
  const mainNavItems = [
    { path: "/", label: "Home", icon: "home" },
    { path: "/events", label: "Eventos", icon: "calendar-alt" },
    { path: "/events/new", label: "Novo", icon: "plus", highlight: true },
    { path: "/schedule", label: "Agenda", icon: "calendar-day" },
  ];
  
  // Items adicionais que aparecerão no menu de hambúrguer
  const menuItems = [
    { path: "/vendors", label: "Fornecedores", icon: "truck" },
    { path: "/budget", label: "Orçamento", icon: "money-bill-wave" },
    { path: "/team", label: "Equipe", icon: "users" },
    { path: "/settings", label: "Configurações", icon: "cog" },
  ];
  
  const isActivePath = (path: string) => {
    if (path === '/') return location === '/';
    // Para /events, verificar se é exatamente /events ou detalhes de evento, mas não /events/new
    if (path === '/events') return location === '/events' || (location.startsWith('/events/') && location !== '/events/new');
    return location === path;
  };

  // Determinar título da página atual
  const getPageTitle = () => {
    if (location === '/') return 'Dashboard';
    if (location === '/events') return 'Meus Eventos';
    if (location === '/events/new') return 'Criar Evento';
    if (location.startsWith('/events/')) return 'Detalhes do Evento';
    if (location === '/schedule') return 'Agenda';
    if (location === '/settings') return 'Configurações';
    if (location === '/profile') return 'Meu Perfil';
    return 'Symera';
  };

  return (
    <>
      {/* Topo do App (estilo iOS/Android) */}
      <div 
        className={cn(
          "fixed top-0 inset-x-0 md:hidden z-40 transition-all duration-300 bg-card border-b border-border", 
          showNavbarTop ? "translate-y-0" : "-translate-y-full",
          hasScrolled ? "shadow-md" : ""
        )}
      >
        <div className="flex items-center justify-between h-14 px-4">
          <div className="flex items-center">
            {!location.includes('/events/') && location !== '/events/new' ? (
              <h1 className="text-lg font-semibold">{getPageTitle()}</h1>
            ) : (
              <Link href={location === '/events/new' ? '/events' : '/events'}>
                <div className="flex items-center">
                  <i className="fas fa-chevron-left mr-2 text-primary"></i>
                  <span>{location === '/events/new' ? 'Eventos' : 'Voltar'}</span>
                </div>
              </Link>
            )}
          </div>
          
          {/* Perfil do usuário ou ações do contexto */}
          <div className="flex items-center">
            {location === '/events' && (
              <button className="mr-4 w-8 h-8 flex items-center justify-center text-muted-foreground">
                <i className="fas fa-search"></i>
              </button>
            )}
            
            <Link href="/profile">
              <Avatar className="h-8 w-8 cursor-pointer">
                {user?.profileImageUrl ? (
                  <AvatarImage src={user.profileImageUrl} alt={user.firstName ? `${user.firstName} ${user.lastName || ''}` : 'Usuário'} />
                ) : null}
                <AvatarFallback className="bg-gradient-primary text-white text-xs">
                  {getInitials(user?.firstName ? `${user.firstName} ${user.lastName || ''}` : user?.email || '')}
                </AvatarFallback>
              </Avatar>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Navbar inferior - estilo de apps */}
      <div className="fixed inset-x-0 bottom-0 h-16 bg-card md:hidden z-40 flex items-center justify-around shadow-lg border-t border-border">
        {mainNavItems.map((item) => (
          <div key={item.path} className="flex-1 flex justify-center touch-action-manipulation">
            <Link href={item.path} className="w-full flex justify-center">
              <div className="flex flex-col items-center cursor-pointer min-w-[56px] min-h-[48px] justify-center py-1 px-1">
                {item.highlight ? (
                  <div className="gradient-primary rounded-full p-3 shadow-lg -mt-6 w-12 h-12 flex items-center justify-center">
                    <i className={`fas fa-${item.icon} text-white`}></i>
                  </div>
                ) : (
                  <i className={cn(
                    `fas fa-${item.icon} h-6 w-6`,
                    isActivePath(item.path) ? "text-primary" : "text-foreground"
                  )}></i>
                )}
                <span className={cn(
                  "text-xs mt-1",
                  isActivePath(item.path) ? "text-primary" : "text-foreground"
                )}>
                  {item.label}
                </span>
              </div>
            </Link>
          </div>
        ))}
        
        {/* Menu de hambúrguer */}
        <Sheet>
          <SheetTrigger asChild>
            <div className="flex-1 flex justify-center touch-action-manipulation">
              <div className="flex flex-col items-center cursor-pointer min-w-[56px] min-h-[48px] justify-center py-1 px-1">
                <i className="fas fa-bars h-6 w-6 text-foreground"></i>
                <span className="text-xs mt-1 text-foreground">
                  Menu
                </span>
              </div>
            </div>
          </SheetTrigger>
          <SheetContent side="right" className="w-[85%] sm:w-[350px] overflow-y-auto">
            <div className="py-6">
              <div className="flex items-center mb-6">
                <Avatar className="h-10 w-10 mr-3">
                  {user?.profileImageUrl ? (
                    <AvatarImage src={user.profileImageUrl} alt={user.firstName ? `${user.firstName} ${user.lastName || ''}` : 'Usuário'} />
                  ) : null}
                  <AvatarFallback className="bg-gradient-primary text-white">
                    {getInitials(user?.firstName ? `${user.firstName} ${user.lastName || ''}` : user?.email || '')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium">
                    {user?.firstName ? `${user.firstName} ${user.lastName || ''}` : user?.email}
                  </h3>
                  <Link href="/profile">
                    <span className="text-sm text-primary">Ver perfil</span>
                  </Link>
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <div className="space-y-4 mt-4">
                {menuItems.map((item) => (
                  <SheetClose asChild key={item.path}>
                    <Link href={item.path} className="block w-full">
                      <div className={cn(
                        "flex items-center py-3 px-2 rounded-md min-h-[44px] touch-action-manipulation",
                        isActivePath(item.path) && "bg-muted"
                      )}>
                        <i className={cn(
                          `fas fa-${item.icon} w-5 h-5 mr-3`,
                          isActivePath(item.path) ? "text-primary" : "text-foreground"
                        )}></i>
                        <span className={cn(
                          isActivePath(item.path) ? "text-primary" : "text-foreground"
                        )}>
                          {item.label}
                        </span>
                      </div>
                    </Link>
                  </SheetClose>
                ))}
              </div>
              
              <Separator className="my-4" />
              
              <SheetClose asChild>
                <Link href="/logout" className="block w-full">
                  <div className="flex items-center py-3 px-2 rounded-md min-h-[44px] touch-action-manipulation text-destructive">
                    <i className="fas fa-sign-out-alt w-5 h-5 mr-3"></i>
                    <span>Sair</span>
                  </div>
                </Link>
              </SheetClose>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
};

export default MobileNavbar;
