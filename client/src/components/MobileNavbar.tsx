import React, { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";

const MobileNavbar: React.FC = () => {
  const [location] = useLocation();
  const { user } = useAuth();
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

  const navItems = [
    { path: "/", label: "Home", icon: "home" },
    { path: "/events", label: "Eventos", icon: "calendar-alt" },
    { path: "/events/new", label: "Novo", icon: "plus", highlight: true },
    { path: "/schedule", label: "Agenda", icon: "calendar-day" },
    { path: "/settings", label: "Ajustes", icon: "cog" },
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
          "fixed top-0 inset-x-0 md:hidden z-40 transition-all duration-300", 
          showNavbarTop ? "translate-y-0" : "-translate-y-full",
          hasScrolled ? "bg-card/90 backdrop-blur-md shadow-md border-b border-border" : ""
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
                  <AvatarImage src={user.profileImageUrl} alt={`${user.firstName || ''} ${user.lastName || ''}`} />
                ) : null}
                <AvatarFallback className="bg-gradient-primary text-white text-xs">
                  {getInitials(`${user?.firstName || ''} ${user?.lastName || ''}`)}
                </AvatarFallback>
              </Avatar>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Navbar inferior - estilo de apps */}
      <div className="fixed inset-x-0 bottom-0 h-16 bg-card md:hidden z-40 flex items-center justify-around shadow-lg border-t border-border">
        {navItems.map((item) => (
          <div key={item.path} className="touch-target">
            <Link href={item.path}>
              <div className="flex flex-col items-center cursor-pointer min-w-[48px] min-h-[44px] justify-center py-1">
                {item.highlight ? (
                  <div className="gradient-primary rounded-full p-3 shadow-lg -mt-6">
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
      </div>
    </>
  );
};

export default MobileNavbar;
