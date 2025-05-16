import React, { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import Logo from "./ui/logo";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { getInitials } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { 
  Home, 
  Calendar, 
  Plus, 
  CalendarDays, 
  Users, 
  Store, 
  DollarSign, 
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

// User type definition
interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
}

const Sidebar: React.FC = () => {
  const [location] = useLocation();
  const { user } = useAuth() as { user: User | undefined | null };
  const [collapsed, setCollapsed] = useState<boolean>(false);
  
  // Load collapsed state from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('sidebar_collapsed');
    if (savedState) {
      setCollapsed(savedState === 'true');
    }
  }, []);

  // Save collapsed state to localStorage
  const toggleCollapsed = () => {
    const newState = !collapsed;
    setCollapsed(newState);
    localStorage.setItem('sidebar_collapsed', String(newState));
  };
  
  const handleLogout = () => {
    window.location.href = "/api/logout";
  };
  
  const navItems = [
    { path: "/", label: "Dashboard", icon: Home },
    { path: "/events", label: "Meus Eventos", icon: Calendar },
    { path: "/events/new", label: "Criar Evento", icon: Plus, highlight: true },
    { path: "/schedule", label: "Agenda", icon: CalendarDays },
    { path: "/team", label: "Equipe", icon: Users },
    { path: "/vendors", label: "Fornecedores", icon: Store },
    { path: "/budget", label: "Orçamento", icon: DollarSign },
    { path: "/settings", label: "Configurações", icon: Settings },
  ];
  
  const isActivePath = (path: string) => {
    if (path === '/') return location === '/';
    // For /events, check it's exactly /events or event details, but not /events/new
    if (path === '/events') return location === '/events' || (location.startsWith('/events/') && location !== '/events/new');
    return location === path;
  };
  
  return (
    <aside 
      className={cn(
        "hidden md:flex flex-col bg-card border-r border-border overflow-y-auto transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo and toggle button */}
      <div className={cn(
        "relative flex items-center border-b border-border", 
        collapsed ? "justify-center p-3 group" : "p-4"
      )}>
        <div className={cn(
          "flex items-center",
          collapsed ? "justify-center" : ""
        )}>
          <Logo className="h-8 w-auto" />
          {!collapsed && <h1 className="text-xl font-bold gradient-text ml-3">Symera</h1>}
        </div>
        
        {!collapsed && (
          <button 
            onClick={toggleCollapsed}
            className="absolute right-4 flex items-center justify-center p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            title="Recolher menu"
          >
            <ChevronLeft size={16} />
          </button>
        )}
        
        {collapsed && (
          <div className="relative">
            <button 
              onClick={toggleCollapsed}
              className="absolute flex items-center justify-center p-1 rounded-full text-muted-foreground hover:text-foreground bg-card border border-border shadow-md z-50"
              style={{ right: '-12px', top: '15px', transform: 'translateX(50%)' }}
              title="Expandir menu"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
      
      {/* Navigation */}
      <nav className={cn(
        "flex-1 space-y-6",
        "p-4" // Agora a navegação sempre tem p-4
      )}>
        <div className="space-y-1">
          {navItems.map((item) => (
            <TooltipProvider key={item.path} delayDuration={collapsed ? 100 : 1000}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <Link href={item.path}>
                      <div
                        className={cn(
                          "flex items-center rounded-md transition-colors cursor-pointer px-4 py-2",
                          collapsed && "justify-center",
                          isActivePath(item.path)
                            ? "bg-primary text-white"
                            : item.highlight
                            ? (collapsed ? "text-primary hover:bg-muted" : "border border-primary/50 text-primary hover:bg-muted")
                            : "text-muted-foreground hover:text-foreground hover:bg-muted"
                        )}
                      >
                        <item.icon className="w-5 h-5" />
                        {!collapsed && <span className="ml-3">{item.label}</span>}
                      </div>
                    </Link>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right" className={cn("bg-card", !collapsed && "hidden")}>
                  {item.label}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>
      </nav>
      
      {/* User profile */}
      <div className={cn(
        "border-t border-border",
        "p-4" // Sempre com o mesmo padding
      )}>
        <div className={cn(
          "flex items-center",
          collapsed ? "justify-center" : "justify-between"
        )}>
          {!collapsed && (
            <Link href="/settings">
              <div className="flex items-center flex-grow cursor-pointer hover:opacity-80 transition-opacity">
                <Avatar className="h-10 w-10 flex-shrink-0">
                  {user?.profileImageUrl ? (
                    <AvatarImage src={user.profileImageUrl} alt={`${user.firstName || ''} ${user.lastName || ''}`} />
                  ) : null}
                  <AvatarFallback className="bg-gradient-primary text-white">
                    {getInitials(`${user?.firstName || ''} ${user?.lastName || ''}`)}
                  </AvatarFallback>
                </Avatar>
                <div className="ml-3 min-w-0 overflow-hidden">
                  <p className="text-sm font-medium truncate">
                    {user?.firstName || ''} {user?.lastName || ''}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email || ''}</p>
                </div>
              </div>
            </Link>
          )}
          
          {/* Logout button - shown in both states but in different positions */}
          <TooltipProvider delayDuration={collapsed ? 100 : 1000}>
            <Tooltip>
              <TooltipTrigger asChild>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <div
                      className={cn(
                        "text-muted-foreground hover:text-foreground cursor-pointer",
                        collapsed ? "p-4" : "ml-2 flex-shrink-0 p-2" // Mais padding quando fechado para manter posicionamento
                      )}
                      title="Sair"
                    >
                      <LogOut className="h-4 w-4" />
                    </div>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirmar saída</AlertDialogTitle>
                      <AlertDialogDescription>
                        Tem certeza que deseja sair da sua conta?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={handleLogout}
                        className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                      >
                        Sair
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </TooltipTrigger>
              <TooltipContent side="right" className={cn(!collapsed && "hidden")}>
                Sair
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
