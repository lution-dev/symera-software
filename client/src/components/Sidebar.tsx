import React from "react";
import { Link, useLocation } from "wouter";
import Logo from "./ui/logo";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { getInitials } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Home, 
  Calendar, 
  Plus, 
  CalendarDays, 
  Users, 
  Store, 
  DollarSign, 
  Settings,
  LogOut
} from "lucide-react";

const Sidebar: React.FC = () => {
  const [location] = useLocation();
  const { user } = useAuth();
  
  const navItems = [
    { path: "/", label: "Dashboard", icon: Home },
    { path: "/events", label: "Meus Eventos", icon: Calendar },
    { path: "/events/new", label: "Criar Evento", icon: Plus, highlight: true },
    { path: "/schedule", label: "Cronograma", icon: CalendarDays },
    { path: "/team", label: "Equipe", icon: Users },
    { path: "/vendors", label: "Fornecedores", icon: Store },
    { path: "/budget", label: "Orçamento", icon: DollarSign },
    { path: "/settings", label: "Configurações", icon: Settings },
  ];
  
  const isActivePath = (path: string) => {
    if (path === '/') return location === '/';
    return location.startsWith(path);
  };
  
  return (
    <aside className="hidden md:flex flex-col w-64 bg-card border-r border-border overflow-y-auto">
      <div className="p-4 flex items-center">
        <Logo className="h-8 w-auto mr-3" />
        <h1 className="text-xl font-bold gradient-text">Symera</h1>
      </div>
      
      <nav className="flex-1 p-4 space-y-6">
        <div className="space-y-1">
          {navItems.map((item) => (
            <Link key={item.path} href={item.path}>
              <a
                className={cn(
                  "flex items-center px-4 py-2 rounded-md transition-colors",
                  isActivePath(item.path)
                    ? "bg-primary text-white"
                    : item.highlight
                    ? "border border-primary/50 text-primary hover:bg-muted"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <item.icon className="w-5 h-5" />
                <span className="ml-3">{item.label}</span>
              </a>
            </Link>
          ))}
        </div>
      </nav>
      
      <div className="p-4 border-t border-border">
        <div className="flex items-center">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user?.profileImageUrl} alt={`${user?.firstName || ''} ${user?.lastName || ''}`} />
            <AvatarFallback className="bg-gradient-primary text-white">
              {getInitials(`${user?.firstName || ''} ${user?.lastName || ''}`)}
            </AvatarFallback>
          </Avatar>
          <div className="ml-3">
            <p className="text-sm font-medium">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
          </div>
          <a 
            href="/api/logout" 
            className="ml-auto text-muted-foreground hover:text-foreground"
            title="Sair"
          >
            <LogOut className="h-4 w-4" />
          </a>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
