
import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { 
  ChevronsLeft, 
  ChevronsRight, 
  LayoutDashboard, 
  Users, 
  Calendar, 
  Settings, 
  LogOut,
  BarChart,
  X
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SidebarProps {
  className?: string;
  collapsed?: boolean;
  toggleSidebar?: () => void;
  navigateToDashboard?: () => void;
}

export function Sidebar({ className, collapsed = false, toggleSidebar, navigateToDashboard }: SidebarProps) {
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();
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
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      toast.success("Logout realizado com sucesso!");
      navigate("/login");
    } catch (error: any) {
      console.error("Erro ao fazer logout:", error);
      toast.error(`Erro ao fazer logout: ${error.message}`);
    }
  };
  
  return (
    <div 
      className={cn(
        "flex flex-col h-screen bg-sidebar transition-all duration-300 border-r border-border",
        collapsed ? "w-[70px]" : "w-[250px]",
        className
      )}
    >
      <div className="flex items-center justify-between p-4 border-b">
        {!collapsed ? (
          <div 
            className="font-semibold text-turquesa text-xl cursor-pointer flex items-center hover:text-turquesa/90 transition-colors"
            onClick={navigateToDashboard}
          >
            CraniumCare
          </div>
        ) : (
          <div 
            className="flex justify-center w-full cursor-pointer"
            onClick={navigateToDashboard}
          >
            <div className="text-turquesa text-2xl font-bold">C</div>
          </div>
        )}
        
        {!isMobile && (
          <Button variant="ghost" onClick={toggleSidebar} className="p-1.5 hover:bg-sidebar-accent">
            {collapsed ? 
              <ChevronsRight className="h-5 w-5" /> : 
              <ChevronsLeft className="h-5 w-5" />
            }
          </Button>
        )}
        
        {isMobile && (
          <Button variant="ghost" onClick={toggleSidebar} className="p-1.5 hover:bg-sidebar-accent">
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>
      
      <div className="flex-1 overflow-auto py-4 px-2">
        <nav className="space-y-1">
          <Link 
            to="/dashboard" 
            className={cn(
              "sidebar-link transition-all duration-200 hover:bg-sidebar-accent/70", 
              isActive("/dashboard") && "active"
            )}
          >
            <LayoutDashboard className="h-5 w-5" />
            {!collapsed && <span>Dashboard</span>}
          </Link>
          
          <Link 
            to="/pacientes" 
            className={cn(
              "sidebar-link transition-all duration-200 hover:bg-sidebar-accent/70", 
              isActive("/pacientes") && "active"
            )}
          >
            <Users className="h-5 w-5" />
            {!collapsed && <span>Pacientes</span>}
          </Link>
          
          <Link 
            to="/historico" 
            className={cn(
              "sidebar-link transition-all duration-200 hover:bg-sidebar-accent/70", 
              isActive("/historico") && "active"
            )}
          >
            <Calendar className="h-5 w-5" />
            {!collapsed && <span>Histórico</span>}
          </Link>
          
          <Link 
            to="/relatorios" 
            className={cn(
              "sidebar-link transition-all duration-200 hover:bg-sidebar-accent/70", 
              isActive("/relatorios") && "active"
            )}
          >
            <BarChart className="h-5 w-5" />
            {!collapsed && <span>Relatórios</span>}
          </Link>
          
          <Link 
            to="/configuracoes" 
            className={cn(
              "sidebar-link transition-all duration-200 hover:bg-sidebar-accent/70", 
              isActive("/configuracoes") && "active"
            )}
          >
            <Settings className="h-5 w-5" />
            {!collapsed && <span>Configurações</span>}
          </Link>
        </nav>
      </div>
      
      <div className="border-t p-4 flex items-center justify-between">
        <ThemeToggle />
        {!collapsed ? (
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-destructive hover:text-destructive transition-colors"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            <span>Sair</span>
          </Button>
        ) : (
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-destructive hover:text-destructive transition-colors"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
