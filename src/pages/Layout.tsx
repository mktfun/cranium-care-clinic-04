
import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";

interface LayoutProps {
  title?: string;
}

export default function Layout({ title = "Dashboard" }: LayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  useEffect(() => {
    // Verificar se a tela é móvel
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // 1024px é o breakpoint para lg no Tailwind
    };
    
    // Verificar no carregamento inicial
    checkMobile();
    
    // Adicionar listener para redimensionamento
    window.addEventListener('resize', checkMobile);
    
    // Limpar listener quando desmontar
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar 
        className={`${isMobile ? (sidebarCollapsed ? '-translate-x-full' : 'translate-x-0') : 'translate-x-0'}`} 
      />
      
      <div className={`flex-1 flex flex-col transition-all duration-300 ${isMobile ? 'w-full' : (sidebarCollapsed ? 'ml-[70px]' : 'ml-[250px]')}`}>
        <Header 
          title={title}
          toggleSidebar={toggleSidebar}
          sidebarCollapsed={sidebarCollapsed}
        />
        <main className="flex-1 overflow-auto p-6 mt-16">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
