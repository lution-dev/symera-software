import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import MobileNavbar from "./MobileNavbar";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const [location] = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // Load sidebar collapsed state from localStorage and setup event listeners
  useEffect(() => {
    // Initial load from localStorage
    const savedState = localStorage.getItem('sidebar_collapsed');
    if (savedState) {
      setSidebarCollapsed(savedState === 'true');
    }
    
    // Setup storage event listener
    const handleStorageChange = () => {
      const savedState = localStorage.getItem('sidebar_collapsed');
      if (savedState !== null) {
        setSidebarCollapsed(savedState === 'true');
      }
    };
    
    // Setup custom event listener
    const handleSidebarChange = (e: Event) => {
      if (e instanceof CustomEvent) {
        setSidebarCollapsed(e.detail.collapsed);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('sidebarStateChange', handleSidebarChange as EventListener);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('sidebarStateChange', handleSidebarChange as EventListener);
    };
  }, []);
  
  // Skip layout when on auth page
  if (location === "/auth") {
    return <>{children}</>;
  }
  
  // Show loading indicator while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // Redirect to auth page if not authenticated
  if (!isAuthenticated && location !== "/auth") {
    window.location.href = "/auth";
    return null;
  }

  // Verificar se estamos em páginas de formulário que precisam de tratamento especial
  const isFormPage = location === '/events/new' || location.match(/\/events\/\d+\/tasks\/new/) || 
                     location.match(/\/events\/\d+\/team\/add/) || location.match(/\/events\/\d+\/vendors\/new/) || 
                     location.match(/\/events\/\d+\/budget\/new/);

  return (
    <div className="h-screen flex flex-col md:flex-row overflow-hidden">
      {/* Sidebar - hidden on mobile */}
      <Sidebar />
      
      {/* Main content area */}
      <main 
        className={`flex-1 ${isFormPage ? 'h-full' : 'overflow-y-auto'} custom-scrollbar bg-background pb-16 md:pb-0 transition-all duration-300`}
        style={{ 
          marginLeft: window.innerWidth >= 768 ? (sidebarCollapsed ? '4rem' : '16rem') : '0',
          paddingTop: window.innerWidth < 768 ? '3.5rem' : '0',  // Espaço para a navbar superior
          paddingBottom: window.innerWidth < 768 ? '4rem' : '0'  // Espaço para a navbar inferior
        }}
      >
        <div className="max-w-[1600px] mx-auto">
          {children}
        </div>
      </main>
      
      {/* Mobile navigation - visible only on small screens */}
      <MobileNavbar />
    </div>
  );
};

export default Layout;
