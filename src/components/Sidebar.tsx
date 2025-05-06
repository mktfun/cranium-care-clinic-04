
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
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
  BarChart
} from "lucide-react";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  const toggleSidebar = () => {
    setCollapsed(!collapsed);
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
        {!collapsed && (
          <div className="font-semibold text-turquesa text-xl">CraniumCare</div>
        )}
        <Button variant="ghost" onClick={toggleSidebar} className="p-1.5">
          {collapsed ? 
            <ChevronsRight className="h-5 w-5" /> : 
            <ChevronsLeft className="h-5 w-5" />
          }
        </Button>
      </div>
      
      <div className="flex-1 overflow-auto py-4 px-2">
        <nav className="space-y-1">
          <Link to="/dashboard" className={cn("sidebar-link", isActive("/dashboard") && "active")}>
            <LayoutDashboard className="h-5 w-5" />
            {!collapsed && <span>Dashboard</span>}
          </Link>
          
          <Link to="/pacientes" className={cn("sidebar-link", isActive("/pacientes") && "active")}>
            <Users className="h-5 w-5" />
            {!collapsed && <span>Pacientes</span>}
          </Link>
          
          <Link to="/historico" className={cn("sidebar-link", isActive("/historico") && "active")}>
            <Calendar className="h-5 w-5" />
            {!collapsed && <span>Histórico</span>}
          </Link>
          
          <Link to="/relatorios" className={cn("sidebar-link", isActive("/relatorios") && "active")}>
            <BarChart className="h-5 w-5" />
            {!collapsed && <span>Relatórios</span>}
          </Link>
          
          <Link to="/configuracoes" className={cn("sidebar-link", isActive("/configuracoes") && "active")}>
            <Settings className="h-5 w-5" />
            {!collapsed && <span>Configurações</span>}
          </Link>
        </nav>
      </div>
      
      <div className="border-t p-4 flex items-center justify-between">
        <ThemeToggle />
        {!collapsed && (
          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
            <LogOut className="h-4 w-4 mr-2" />
            <span>Sair</span>
          </Button>
        )}
        {collapsed && (
          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
            <LogOut className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
