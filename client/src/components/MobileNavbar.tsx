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
    return location.startsWith(path);
  };

  return (
    <div className="fixed inset-x-0 bottom-0 h-16 bg-card md:hidden z-10 flex items-center justify-around shadow-lg">
      {navItems.map((item) => (
        <Link key={item.path} href={item.path}>
          <a className="flex flex-col items-center">
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
          </a>
        </Link>
      ))}
    </div>
  );
};

export default MobileNavbar;
