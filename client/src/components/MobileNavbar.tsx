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

  // Determinar título da página atual - mostrando sempre para garantir consistência visual
  const getPageTitle = () => {
    if (location === '/') return 'Symera'; // Mostrar Symera na home/dashboard
    if (location === '/events') return 'Meus Eventos';
    if (location === '/events/new') return 'Criar Evento';
    if (location.startsWith('/events/')) return 'Detalhes do Evento';
    if (location === '/schedule') return 'Agenda';
    if (location === '/settings') return 'Configurações';
    if (location === '/profile') return 'Meu Perfil';
    return 'Symera';
  };
  
  // Todas as páginas terão título na navbar, seguindo o padrão de apps profissionais
  const shouldShowNavbarTitle = () => {
    return true;
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
        {/* Header Principal - sempre visível */}
        <div className="flex items-center justify-between h-14 px-4">
          <div className="flex items-center">
            {!location.includes('/events/') && location !== '/events/new' ? (
              <>
                {/* Menu toggle no estilo dos exemplos */}
                <Sheet>
                  <SheetTrigger asChild>
                    <button className="h-9 w-9 flex items-center justify-center mr-3 text-foreground">
                      <i className="fas fa-bars"></i>
                    </button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-[280px] sm:w-[320px] p-0">
                    <div className="p-4 bg-primary/10">
                      <h2 className="text-lg font-semibold">Symera</h2>
                      <p className="text-sm text-muted-foreground">Gerenciamento de Eventos</p>
                    </div>
                    <div className="p-3">
                      <div className="space-y-1">
                        {mainNavItems.concat(menuItems).map((item) => (
                          <SheetClose asChild key={item.path}>
                            <Link href={item.path}>
                              <div className={cn(
                                "flex items-center py-2 px-3 rounded-md",
                                isActivePath(item.path) && "bg-primary/10"
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
                    </div>
                  </SheetContent>
                </Sheet>
              
                <h1 className="text-lg font-semibold">
                  {getPageTitle()}
                </h1>
              </>
            ) : (
              <Link href={location === '/events/new' ? '/events' : '/events'}>
                <div className="flex items-center">
                  <i className="fas fa-chevron-left mr-2 text-primary"></i>
                  <span>{location === '/events/new' ? 'Eventos' : 'Voltar'}</span>
                </div>
              </Link>
            )}
          </div>
          
          {/* Perfil do usuário - interface simplificada */}
          <div className="flex items-center">
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
      
      {/* Barra de navegação inferior - redesenhada para evitar duplicação com menu lateral */}
      <div className="fixed inset-x-0 bottom-0 h-16 bg-card md:hidden z-40 flex items-center justify-around shadow-lg border-t border-border">
        {/* Mudamos para apenas 4 itens principais, sem o menu duplicado */}
        <div className="flex-1 flex justify-center touch-action-manipulation">
          <Link href="/" className="w-full flex justify-center">
            <div className="flex flex-col items-center cursor-pointer min-w-[56px] min-h-[48px] justify-center py-1 px-1">
              <i className={cn(
                "fas fa-home h-6 w-6",
                isActivePath('/') ? "text-primary" : "text-foreground"
              )}></i>
              <span className={cn(
                "text-xs mt-1",
                isActivePath('/') ? "text-primary" : "text-foreground"
              )}>
                Início
              </span>
            </div>
          </Link>
        </div>
        
        <div className="flex-1 flex justify-center touch-action-manipulation">
          <Link href="/events" className="w-full flex justify-center">
            <div className="flex flex-col items-center cursor-pointer min-w-[56px] min-h-[48px] justify-center py-1 px-1">
              <i className={cn(
                "fas fa-calendar-alt h-6 w-6",
                isActivePath('/events') || location.startsWith('/events/') ? "text-primary" : "text-foreground"
              )}></i>
              <span className={cn(
                "text-xs mt-1",
                isActivePath('/events') || location.startsWith('/events/') ? "text-primary" : "text-foreground"
              )}>
                Eventos
              </span>
            </div>
          </Link>
        </div>
        
        {/* Botão de adicionar no centro */}
        <div className="flex-1 flex justify-center touch-action-manipulation">
          <Link href="/events/new" className="w-full flex justify-center">
            <div className="flex flex-col items-center cursor-pointer min-w-[56px] min-h-[48px] justify-center">
              <div className="gradient-primary rounded-full p-3 shadow-lg -mt-6 w-12 h-12 flex items-center justify-center">
                <i className="fas fa-plus text-white"></i>
              </div>
              <span className={cn(
                "text-xs mt-1",
                isActivePath('/events/new') ? "text-primary" : "text-foreground"
              )}>
                Novo
              </span>
            </div>
          </Link>
        </div>
        
        <div className="flex-1 flex justify-center touch-action-manipulation">
          <Link href="/schedule" className="w-full flex justify-center">
            <div className="flex flex-col items-center cursor-pointer min-w-[56px] min-h-[48px] justify-center py-1 px-1">
              <i className={cn(
                "fas fa-calendar-day h-6 w-6",
                isActivePath('/schedule') ? "text-primary" : "text-foreground"
              )}></i>
              <span className={cn(
                "text-xs mt-1",
                isActivePath('/schedule') ? "text-primary" : "text-foreground"
              )}>
                Agenda
              </span>
            </div>
          </Link>
        </div>
        
        <div className="flex-1 flex justify-center touch-action-manipulation">
          <Link href="/profile" className="w-full flex justify-center">
            <div className="flex flex-col items-center cursor-pointer min-w-[56px] min-h-[48px] justify-center py-1 px-1">
              <i className={cn(
                "fas fa-user h-6 w-6",
                isActivePath('/profile') ? "text-primary" : "text-foreground"
              )}></i>
              <span className={cn(
                "text-xs mt-1",
                isActivePath('/profile') ? "text-primary" : "text-foreground"
              )}>
                Perfil
              </span>
            </div>
          </Link>
        </div>
      </div>
    </>
  );
};

export default MobileNavbar;
