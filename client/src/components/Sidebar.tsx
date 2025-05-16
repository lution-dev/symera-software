import React, { useState } from "react";
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
    <aside className="hidden md:flex flex-col w-64 bg-card border-r border-border overflow-y-auto">
      <div className="p-4 flex items-center">
        <Logo className="h-8 w-auto mr-3" />
        <h1 className="text-xl font-bold gradient-text">Symera</h1>
      </div>
      
      <nav className="flex-1 p-4 space-y-6">
        <div className="space-y-1">
          {navItems.map((item) => (
            <div key={item.path}>
              <Link href={item.path}>
                <div
                  className={cn(
                    "flex items-center px-4 py-2 rounded-md transition-colors cursor-pointer",
                    isActivePath(item.path)
                      ? "bg-primary text-white"
                      : item.highlight
                      ? "border border-primary/50 text-primary hover:bg-muted"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="ml-3">{item.label}</span>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </nav>
      
      <div className="p-4 border-t border-border">
        <div className="flex items-center justify-between">
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
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <div
                className="ml-2 flex-shrink-0 text-muted-foreground hover:text-foreground cursor-pointer"
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
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
