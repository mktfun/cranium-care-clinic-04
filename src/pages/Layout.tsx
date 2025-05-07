
import { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";

interface LayoutProps {
  title?: string;
}

export default function Layout({ title = "Dashboard" }: LayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const navigate = useNavigate();
  
  // Check if device is mobile on component mount and window resize
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);
  
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const navigateToDashboard = () => {
    navigate('/dashboard');
  };

  return (
    <div className="h-screen flex overflow-hidden">
      <Sidebar 
        className={`fixed left-0 top-0 z-20 h-screen transition-all duration-300 ${
          isMobile && sidebarCollapsed ? "-translate-x-full" : "translate-x-0"
        }`}
        collapsed={sidebarCollapsed}
        toggleSidebar={toggleSidebar}
        navigateToDashboard={navigateToDashboard}
      />
      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${
        sidebarCollapsed ? "lg:ml-[70px]" : "lg:ml-[250px]"
      } ${isMobile ? "ml-0" : ""}`}>
        <Header 
          title={title}
          toggleSidebar={toggleSidebar}
          sidebarCollapsed={sidebarCollapsed}
        />
        <main className="flex-1 overflow-auto p-4 md:p-6 mt-16">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
