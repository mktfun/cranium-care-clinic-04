
import { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { WelcomeTutorialModal } from "@/components/WelcomeTutorialModal";
import { MobileNavBar } from "@/components/MobileNavBar";
import { useIsMobile } from "@/hooks/use-mobile";

interface LayoutProps {
  title?: string;
}

export default function Layout({ title = "Dashboard" }: LayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    // Colapsar sidebar automaticamente em tablet
    const checkTablet = () => {
      if (window.innerWidth < 1024 && window.innerWidth >= 768) {
        setSidebarCollapsed(true);
      }
    };
    
    checkTablet();
    window.addEventListener('resize', checkTablet);
    
    return () => window.removeEventListener('resize', checkTablet);
  }, []);
  
  // Auto-hide sidebar on mobile when navigating
  useEffect(() => {
    if (isMobile) {
      setSidebarCollapsed(true);
    }
  }, [location.pathname, isMobile]);
  
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const navigateToDashboard = () => {
    navigate('/dashboard');
  };

  // Get current page title from path
  const getCurrentPageTitle = () => {
    const path = location.pathname;
    const routeNames: Record<string, string> = {
      "/dashboard": "Dashboard",
      "/pacientes": "Pacientes",
      "/historico": "Histórico",
      "/relatorios": "Relatórios",
      "/configuracoes": "Configurações",
    };
    
    if (path.startsWith("/pacientes/") && path.includes("/nova-medicao")) return "Nova Medição";
    if (path.startsWith("/pacientes/") && path.includes("/relatorio")) return "Relatório";
    if (path.startsWith("/pacientes/") && path.split('/').length === 3) return "Paciente";
    
    return routeNames[path] || title;
  };

  return (
    <div className="h-screen flex overflow-hidden">
      {!isMobile && (
        <Sidebar 
          className={`fixed left-0 top-0 z-20 h-screen transition-all duration-300 ${
            isMobile && sidebarCollapsed ? "-translate-x-full" : "translate-x-0"
          }`}
          collapsed={sidebarCollapsed}
          toggleSidebar={toggleSidebar}
          navigateToDashboard={navigateToDashboard}
        />
      )}
      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${
        sidebarCollapsed || isMobile ? "lg:ml-[70px]" : "lg:ml-[250px]"
      } ${isMobile ? "ml-0" : ""}`}>
        <Header 
          title={getCurrentPageTitle()}
          toggleSidebar={toggleSidebar}
          sidebarCollapsed={sidebarCollapsed}
        />
        <main className="flex-1 overflow-auto p-3 md:p-6 mt-16 pb-20 md:pb-6">
          <Outlet />
        </main>
      </div>
      <MobileNavBar />
      <WelcomeTutorialModal />
    </div>
  );
}
