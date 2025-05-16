
import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  Settings, 
  BarChart,
} from "lucide-react";

export function MobileNavBar() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const navItems = [
    {
      icon: LayoutDashboard,
      label: "Dashboard",
      path: "/dashboard",
    },
    {
      icon: Users,
      label: "Pacientes",
      path: "/pacientes",
    },
    {
      icon: Calendar,
      label: "Histórico",
      path: "/historico",
    },
    {
      icon: BarChart,
      label: "Relatórios",
      path: "/relatorios",
    },
    {
      icon: Settings,
      label: "Ajustes",
      path: "/configuracoes",
    }
  ];
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border shadow-lg z-50 md:hidden">
      <div className="flex justify-between items-center p-1">
        {navItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={cn(
              "flex flex-col items-center justify-center py-2 px-1 w-full rounded-md transition-colors",
              isActive(item.path) 
                ? "text-turquesa" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <item.icon className="h-5 w-5" />
            <span className="text-[10px] mt-1 font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
