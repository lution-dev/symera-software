import React from "react";
import { Link, useLocation } from "wouter";
import Logo from "./ui/logo";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { getInitials } from "@/lib/utils";

const Sidebar: React.FC = () => {
  const [location] = useLocation();
  const { user } = useAuth();
  
  const navItems = [
    { path: "/", label: "Dashboard", icon: "home" },
    { path: "/events", label: "Meus Eventos", icon: "calendar-alt" },
    { path: "/events/new", label: "Criar Evento", icon: "plus", highlight: true },
    { path: "/schedule", label: "Cronograma", icon: "calendar-day" },
    { path: "/team", label: "Equipe", icon: "users" },
    { path: "/vendors", label: "Fornecedores", icon: "store" },
    { path: "/budget", label: "Orçamento", icon: "coins" },
    { path: "/settings", label: "Configurações", icon: "cog" },
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
                <i className={`fas fa-${item.icon} w-5 text-center`}></i>
                <span className="ml-3">{item.label}</span>
              </a>
            </Link>
          ))}
        </div>
      </nav>
      
      <div className="p-4 border-t border-border">
        <div className="flex items-center">
          {user?.profileImageUrl ? (
            <img 
              src={user.profileImageUrl} 
              alt={`${user.firstName} ${user.lastName}`}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center">
              <span className="text-white font-semibold">
                {getInitials(`${user?.firstName || ''} ${user?.lastName || ''}`)}
              </span>
            </div>
          )}
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
            <i className="fas fa-sign-out-alt"></i>
          </a>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
