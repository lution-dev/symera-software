import React from "react";
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
  
  return (
    <div className="h-screen flex flex-col md:flex-row overflow-hidden">
      {/* Sidebar - hidden on mobile */}
      <Sidebar />
      
      {/* Main content area */}
      <main className="flex-1 overflow-y-auto custom-scrollbar bg-background pb-16 md:pb-0">
        {children}
      </main>
      
      {/* Mobile navigation - visible only on small screens */}
      <MobileNavbar />
    </div>
  );
};

export default Layout;
