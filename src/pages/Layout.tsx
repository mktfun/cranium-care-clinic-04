
import { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { WelcomeTutorialModal } from "@/components/WelcomeTutorialModal";
import { MobileNavBar } from "@/components/MobileNavBar";
import { useIsMobileOrTabletPortrait } from "@/hooks/use-mobile";

export default function Layout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const isSmallScreen = useIsMobileOrTabletPortrait();
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    // Colapsar sidebar automaticamente em tablet e mobile
    const checkScreenSize = () => {
      if (window.innerWidth < 1024 || (window.innerWidth >= 600 && window.innerWidth <= 900 && window.innerHeight > window.innerWidth)) {
        setSidebarCollapsed(true);
      } else {
        setSidebarCollapsed(false);
      }
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);
  
  // Auto-hide sidebar on mobile when navigating
  useEffect(() => {
    if (isSmallScreen) {
      setSidebarCollapsed(true);
    }
  }, [location.pathname, isSmallScreen]);
  
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
      "/tarefas": "Tarefas",
      "/notificacoes": "Notificações",
      "/perfil": "Perfil",
    };
    
    if (path.startsWith("/pacientes/") && path.includes("/nova-medicao")) return "Nova Medição";
    if (path.startsWith("/pacientes/") && path.includes("/medicao-por-foto")) return "Medição por Foto";
    if (path.startsWith("/pacientes/") && path.includes("/relatorio")) return "Relatório";
    if (path.startsWith("/pacientes/") && path.includes("/prontuario")) return "Prontuário";
    if (path.startsWith("/pacientes/") && path.includes("/historico")) return "Histórico do Paciente";
    if (path.startsWith("/pacientes/") && path.split('/').length === 3) return "Detalhes do Paciente";
    if (path === "/pacientes/registro") return "Novo Paciente";
    
    return routeNames[path] || "Dashboard";
  };

  return (
    <div className="h-screen flex flex-col lg:flex-row overflow-hidden">
      {!isSmallScreen && (
        <Sidebar 
          className={`fixed left-0 top-0 z-20 h-screen transition-all duration-300 ${
            sidebarCollapsed ? "lg:-translate-x-[180px]" : "translate-x-0"
          }`}
          collapsed={sidebarCollapsed}
          navigateToDashboard={navigateToDashboard}
        />
      )}
      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${
        sidebarCollapsed || isSmallScreen ? "lg:ml-[70px]" : "lg:ml-[250px]"
      } ${isSmallScreen ? "ml-0" : ""}`}>
        <Header 
          title={getCurrentPageTitle()}
          toggleSidebar={toggleSidebar}
          sidebarCollapsed={sidebarCollapsed}
        />
        <main className="flex-1 overflow-auto mt-16 pb-20 md:pb-6">
          <div className="p-3 md:p-6 max-w-7xl mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>
      {isSmallScreen && <MobileNavBar />}
      <WelcomeTutorialModal />
    </div>
  );
}
