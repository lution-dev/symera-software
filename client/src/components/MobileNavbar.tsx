import React from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

const MobileNavbar: React.FC = () => {
  const [location] = useLocation();

  const navItems = [
    { path: "/", label: "Home", icon: "home" },
    { path: "/events", label: "Eventos", icon: "calendar-alt" },
    { path: "/events/new", label: "Novo", icon: "plus", highlight: true },
    { path: "/schedule", label: "Agenda", icon: "calendar-day" },
    { path: "/profile", label: "Perfil", icon: "user" },
  ];
  
  const isActivePath = (path: string) => {
    if (path === '/') return location === '/';
    // Para /events, verificar se é exatamente /events ou detalhes de evento, mas não /events/new
    if (path === '/events') return location === '/events' || (location.startsWith('/events/') && location !== '/events/new');
    return location === path;
  };

  return (
    <div className="fixed inset-x-0 bottom-0 h-16 bg-card md:hidden z-40 flex items-center justify-around shadow-lg border-t border-border">
      {navItems.map((item) => (
        <div key={item.path} className="touch-target">
          <Link href={item.path}>
            <div className="flex flex-col items-center cursor-pointer min-w-[44px] min-h-[44px] justify-center">
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
  );
};

export default MobileNavbar;
