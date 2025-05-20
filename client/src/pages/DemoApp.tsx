import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Calendar, Clock, Users, Plus, Home, Menu, Bell, ClipboardList, CalendarDays } from "lucide-react";

// Usuário de demonstração
const demoUser = {
  id: "123456789",
  firstName: "Usuário",
  lastName: "Demonstração",
  email: "usuario@exemplo.com",
  profileImageUrl: "https://i.pravatar.cc/300",
  createdAt: "2023-01-15T10:30:00Z"
};

// Dados demo de eventos
const demoEvents = [
  { id: 1, name: "Conferência Anual", date: "2023-06-15", type: "conference", status: "upcoming" },
  { id: 2, name: "Workshop de Marketing", date: "2023-06-25", type: "workshop", status: "upcoming" },
  { id: 3, name: "Jantar Corporativo", date: "2023-05-10", type: "dinner", status: "completed" }
];

const DemoApp: React.FC = () => {
  const [location, setLocation] = useLocation();
  const [hasScrolled, setHasScrolled] = useState(false);
  const [showNavbarTop, setShowNavbarTop] = useState(true);

  // Função para simular a navegação
  const handleNavigation = (path: string) => {
    if (path === "/profile") {
      window.location.href = "/demo-profile";
      return;
    }
    setLocation(path);
  };

  // Verifica se um caminho está ativo
  const isActivePath = (path: string) => {
    if (path === '/') return location === '/';
    if (path === '/events') return location === '/events' || (location.startsWith('/events/') && location !== '/events/new');
    return location === path;
  };

  // Determinar título da página atual
  const getPageTitle = () => {
    if (location === '/') return 'Symera';
    if (location === '/events') return 'Meus Eventos';
    if (location === '/events/new') return 'Criar Evento';
    if (location.startsWith('/events/')) return 'Detalhes do Evento';
    if (location === '/schedule') return 'Agenda';
    if (location === '/settings') return 'Configurações';
    if (location === '/profile') return 'Meu Perfil';
    return 'Demonstração';
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Top Navigation */}
      <div className="fixed top-0 inset-x-0 md:hidden z-40 bg-card border-b border-border">
        <div className="flex items-center justify-between h-14 px-4">
          <div className="flex items-center">
            <button className="h-9 w-9 flex items-center justify-center mr-3 text-foreground">
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-lg font-semibold">
              {getPageTitle()}
            </h1>
          </div>
          
          {/* Ícone de notificações (substituindo a foto de perfil) */}
          <div className="flex items-center">
            <button className="h-9 w-9 flex items-center justify-center text-foreground">
              <Bell className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-14 md:pt-0 pb-16 md:pb-0 md:ml-64">
        <div className="container mx-auto p-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {demoEvents.map((event) => (
              <Card key={event.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{event.name}</CardTitle>
                  <CardDescription>
                    {event.date} • {event.type}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <Calendar className="h-4 w-4 text-primary" />
                    </div>
                    <span>{event.status === 'upcoming' ? 'Próximo evento' : 'Evento concluído'}</span>
                  </div>
                </CardContent>
                <CardFooter className="border-t pt-3 flex justify-between">
                  <Button variant="outline" size="sm">Ver detalhes</Button>
                  <Button variant="ghost" size="sm">Editar</Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="fixed inset-x-0 bottom-0 h-16 bg-card md:hidden z-40 flex items-center justify-around shadow-lg border-t border-border">
        <div className="flex-1 flex justify-center touch-action-manipulation">
          <button onClick={() => handleNavigation("/")} className="w-full flex justify-center">
            <div className="flex flex-col items-center cursor-pointer min-w-[56px] min-h-[48px] justify-center py-1 px-1">
              <Home className={cn(
                "h-6 w-6",
                isActivePath('/') ? "text-primary" : "text-foreground"
              )} />
              <span className={cn(
                "text-xs mt-1",
                isActivePath('/') ? "text-primary" : "text-foreground"
              )}>
                Início
              </span>
            </div>
          </button>
        </div>
        
        <div className="flex-1 flex justify-center touch-action-manipulation">
          <button onClick={() => handleNavigation("/events")} className="w-full flex justify-center">
            <div className="flex flex-col items-center cursor-pointer min-w-[56px] min-h-[48px] justify-center py-1 px-1">
              <Calendar className={cn(
                "h-6 w-6",
                isActivePath('/events') ? "text-primary" : "text-foreground"
              )} />
              <span className={cn(
                "text-xs mt-1",
                isActivePath('/events') ? "text-primary" : "text-foreground"
              )}>
                Eventos
              </span>
            </div>
          </button>
        </div>
        
        {/* Botão de adicionar no centro */}
        <div className="flex-1 flex justify-center touch-action-manipulation">
          <button onClick={() => handleNavigation("/events/new")} className="w-full flex justify-center">
            <div className="flex flex-col items-center cursor-pointer min-w-[56px] min-h-[48px] justify-center">
              <div className="gradient-primary rounded-full p-3 shadow-lg -mt-6 w-12 h-12 flex items-center justify-center">
                <Plus className="h-5 w-5 text-white" />
              </div>
              <span className={cn(
                "text-xs mt-1",
                isActivePath('/events/new') ? "text-primary" : "text-foreground"
              )}>
                Novo
              </span>
            </div>
          </button>
        </div>
        
        <div className="flex-1 flex justify-center touch-action-manipulation">
          <button onClick={() => handleNavigation("/schedule")} className="w-full flex justify-center">
            <div className="flex flex-col items-center cursor-pointer min-w-[56px] min-h-[48px] justify-center py-1 px-1">
              <CalendarDays className={cn(
                "h-6 w-6",
                isActivePath('/schedule') ? "text-primary" : "text-foreground"
              )} />
              <span className={cn(
                "text-xs mt-1",
                isActivePath('/schedule') ? "text-primary" : "text-foreground"
              )}>
                Agenda
              </span>
            </div>
          </button>
        </div>
        
        {/* Perfil com foto do usuário */}
        <div className="flex-1 flex justify-center touch-action-manipulation">
          <button onClick={() => handleNavigation("/profile")} className="w-full flex justify-center">
            <div className="flex flex-col items-center cursor-pointer min-w-[56px] min-h-[48px] justify-center py-1 px-1">
              {demoUser.profileImageUrl ? (
                <div className={cn(
                  "h-6 w-6 rounded-full overflow-hidden border-2",
                  isActivePath('/profile') ? "border-primary" : "border-transparent"
                )}>
                  <img src={demoUser.profileImageUrl} alt="Perfil" className="h-full w-full object-cover" />
                </div>
              ) : (
                <div className={cn(
                  "h-6 w-6 rounded-full overflow-hidden flex items-center justify-center bg-gradient-primary",
                  isActivePath('/profile') ? "border-2 border-primary" : ""
                )}>
                  <span className="text-xs text-white">
                    {getInitials(`${demoUser.firstName} ${demoUser.lastName}`)}
                  </span>
                </div>
              )}
              <span className={cn(
                "text-xs mt-1",
                isActivePath('/profile') ? "text-primary" : "text-foreground"
              )}>
                Perfil
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* Desktop Sidebar (simulated) */}
      <div className="hidden md:flex flex-col bg-card border-r border-border overflow-y-auto fixed top-0 bottom-0 left-0 z-40 h-screen w-64">
        <div className="flex items-center border-b border-border p-4">
          <h1 className="text-xl font-bold gradient-text">Symera</h1>
        </div>
        
        <nav className="flex-1 p-4">
          <div className="space-y-1">
            {[
              { path: "/", label: "Dashboard", icon: Home },
              { path: "/events", label: "Meus Eventos", icon: Calendar },
              { path: "/events/new", label: "Criar Evento", icon: Plus, highlight: true },
              { path: "/schedule", label: "Agenda", icon: ClipboardList },
            ].map((item) => (
              <div key={item.path}>
                <button 
                  onClick={() => handleNavigation(item.path)}
                  className={cn(
                    "flex items-center rounded-md transition-colors cursor-pointer px-4 py-2 w-full",
                    isActivePath(item.path)
                      ? "bg-primary text-white"
                      : item.highlight
                      ? "border border-primary/50 text-primary hover:bg-muted"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="ml-3">{item.label}</span>
                </button>
              </div>
            ))}
          </div>
        </nav>
        
        {/* User profile section */}
        <div className="border-t border-border p-4">
          <button 
            onClick={() => handleNavigation("/profile")}
            className="flex items-center flex-grow cursor-pointer hover:opacity-80 transition-opacity"
          >
            <Avatar className="h-10 w-10 flex-shrink-0">
              {demoUser.profileImageUrl ? (
                <AvatarImage src={demoUser.profileImageUrl} alt={`${demoUser.firstName} ${demoUser.lastName}`} />
              ) : null}
              <AvatarFallback className="bg-gradient-primary text-white">
                {getInitials(`${demoUser.firstName} ${demoUser.lastName}`)}
              </AvatarFallback>
            </Avatar>
            <div className="ml-3 min-w-0 overflow-hidden">
              <p className="text-sm font-medium truncate">
                {demoUser.firstName} {demoUser.lastName}
              </p>
              <p className="text-xs text-muted-foreground truncate">{demoUser.email}</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DemoApp;