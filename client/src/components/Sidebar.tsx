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
  ClipboardList,
  Users,
  Store,
  DollarSign,
  Settings,
  LogOut,
  Pin,
  PinOff
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
  const [isPinned, setIsPinned] = useState<boolean>(() => {
    return localStorage.getItem('sidebar_pinned') === 'true';
  });
  const [isHovered, setIsHovered] = useState<boolean>(false);

  const expanded = isPinned || isHovered;

  // Update layout and localStorage when pinned state changes
  useEffect(() => {
    localStorage.setItem('sidebar_pinned', isPinned.toString());
    // Also update the old 'sidebar_collapsed' if it's used elsewhere
    localStorage.setItem('sidebar_collapsed', (!isPinned).toString());

    // Notify layout
    window.dispatchEvent(new CustomEvent('sidebarStateChange', {
      detail: { collapsed: !isPinned }
    }));
  }, [isPinned]);

  // Notify layout specifically for hover changes when not pinned
  useEffect(() => {
    if (!isPinned) {
      window.dispatchEvent(new CustomEvent('sidebarStateChange', {
        detail: { collapsed: !isHovered }
      }));
    }
  }, [isHovered, isPinned]);

  const togglePin = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPinned(!isPinned);
  };

  // Handle mouse enter - expand the sidebar
  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  // Handle mouse leave - collapse the sidebar
  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const navItems = [
    { path: "/", label: "Dashboard", icon: Home },
    { path: "/events", label: "Meus Eventos", icon: Calendar },
    { path: "/events/new", label: "Criar Evento", icon: Plus, highlight: true },
    { path: "/schedule", label: "Agenda", icon: ClipboardList },
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
        "hidden md:flex flex-col bg-card border-r border-border overflow-y-auto transition-all duration-300 fixed top-0 bottom-0 left-0 z-40 h-screen",
        expanded ? "w-64" : "w-16"
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Logo section */}
      <div className={cn(
        "relative flex items-center border-b border-border",
        expanded ? "p-4" : "p-4 justify-center"
      )}>
        <div className={cn(
          "flex items-center w-full",
          !expanded ? "justify-center" : "justify-between"
        )}>
          <Link href="/">
            <div className="flex items-center cursor-pointer hover:opacity-80 transition-opacity">
              <Logo className="h-8 w-auto" />
              {expanded && <h1 className="text-xl font-bold gradient-text ml-3">Symera</h1>}
            </div>
          </Link>

          {expanded && (
            <button
              onClick={togglePin}
              className={cn(
                "p-1.5 rounded-md transition-colors hover:bg-muted text-muted-foreground hover:text-primary",
                isPinned && "text-primary bg-primary/10"
              )}
              title={isPinned ? "Desafixar" : "Fixar"}
            >
              {isPinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
            </button>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className={cn(
        "flex-1 py-4",
        expanded ? "px-4" : "px-2"
      )}>
        <div className="flex flex-col gap-3">
          {navItems.map((item) => (
            <TooltipProvider key={item.path} delayDuration={!expanded ? 100 : 1000}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link href={item.path}>
                    <div
                      className={cn(
                        "flex items-center rounded-md transition-colors cursor-pointer h-10 px-3",
                        !expanded ? "justify-center w-full" : "",
                        isActivePath(item.path)
                          ? "bg-primary text-white"
                          : item.highlight
                            ? (!expanded ? "text-primary hover:bg-muted" : "border border-primary/50 text-primary hover:bg-muted")
                            : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      )}
                    >
                      <item.icon className="w-5 h-5 min-w-5" />
                      {expanded && <span className="ml-3">{item.label}</span>}
                    </div>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right" className={cn("bg-card", expanded && "hidden")}>
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
        expanded ? "p-4" : "p-4"
      )}>
        <div className={cn(
          "flex items-center",
          !expanded ? "justify-center" : "justify-between w-full"
        )}>
          {expanded && (
            <Link href="/profile" className="flex-1 min-w-0 mr-2">
              <div className="flex items-center cursor-pointer hover:opacity-80 transition-opacity">
                <Avatar className="h-10 w-10 flex-shrink-0">
                  {user?.profileImageUrl ? (
                    <AvatarImage src={user.profileImageUrl} alt={`${user.firstName || ''} ${user.lastName || ''}`} />
                  ) : null}
                  <AvatarFallback className="bg-gradient-primary text-white">
                    {getInitials(`${user?.firstName || ''} ${user?.lastName || ''}`)}
                  </AvatarFallback>
                </Avatar>
                <div className="ml-3 min-w-0 flex-1 overflow-hidden">
                  <p className="text-sm font-medium truncate w-[130px]">
                    {user?.firstName || ''} {user?.lastName || ''}
                  </p>
                  <p className="text-xs text-muted-foreground truncate w-[130px]">{user?.email || ''}</p>
                </div>
              </div>
            </Link>
          )}

          {/* Logout button */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <div
                className={cn(
                  "text-muted-foreground hover:text-foreground cursor-pointer flex-shrink-0",
                  expanded ? "ml-2" : ""
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
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
