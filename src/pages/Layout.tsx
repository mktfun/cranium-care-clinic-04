
import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { useIsMobile } from "@/hooks/use-mobile";

interface LayoutProps {
  title?: string;
}

export default function Layout({ title = "Dashboard" }: LayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const isMobile = useIsMobile();
  
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Close sidebar when clicking outside of it on mobile
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (isMobile && !sidebarCollapsed) {
        const sidebar = document.querySelector('.sidebar-container');
        const toggleButton = document.querySelector('.sidebar-toggle');
        
        if (
          sidebar && 
          !sidebar.contains(event.target as Node) && 
          toggleButton && 
          !toggleButton.contains(event.target as Node)
        ) {
          setSidebarCollapsed(true);
        }
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isMobile, sidebarCollapsed]);

  return (
    <div className="flex h-screen overflow-hidden relative">
      {/* Overlay for mobile when sidebar is open */}
      {isMobile && !sidebarCollapsed && (
        <div 
          className="fixed inset-0 bg-black/30 z-10 lg:hidden transition-all duration-300"
          onClick={() => setSidebarCollapsed(true)}
        />
      )}

      {/* Sidebar */}
      <div className={`sidebar-container fixed lg:relative z-20 h-full transition-transform duration-300 ${
        isMobile ? (sidebarCollapsed ? '-translate-x-full' : 'translate-x-0') : 'translate-x-0'
      }`}>
        <Sidebar 
          className={`h-full ${sidebarCollapsed && !isMobile ? 'w-[70px]' : 'w-[250px]'}`} 
        />
      </div>
      
      {/* Main content area */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${
        isMobile ? 'w-full' : (sidebarCollapsed ? 'ml-[70px]' : 'ml-[250px]')
      }`}>
        <Header 
          title={title}
          toggleSidebar={toggleSidebar}
          sidebarCollapsed={sidebarCollapsed}
          className="z-10"
        />
        <main className="flex-1 overflow-auto p-4 sm:p-6 mt-16 bg-background">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
