
import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  Settings, 
  BarChart,
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

export function MobileNavBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  // Add a function to handle navigation with touch feedback
  const handleNavigation = (path: string) => {
    // Only navigate if we're not already on this page
    if (location.pathname !== path) {
      navigate(path);
    }
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
  
  if (!isMobile) return null;
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border shadow-lg z-50 pb-safe">
      <div className="flex justify-between items-center p-1 max-w-screen-lg mx-auto">
        {navItems.map((item) => (
          <button
            key={item.path}
            onClick={() => handleNavigation(item.path)}
            className={cn(
              "flex flex-col items-center justify-center py-3 px-1 w-full rounded-md transition-all duration-200 active:scale-95",
              isActive(item.path) 
                ? "text-primary bg-primary/5" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {isActive(item.path) ? (
              <div className="relative animate-scale-in">
                <item.icon className="h-5 w-5 mb-1" />
                <div 
                  className="absolute -bottom-1 left-1/2 w-1 h-1 bg-primary rounded-full animate-fade-in"
                  style={{ transform: 'translateX(-50%)' }}
                />
              </div>
            ) : (
              <item.icon className="h-5 w-5 mb-1 opacity-85" />
            )}
            <span className={cn(
              "text-[10px] font-medium transition-all duration-200",
              isActive(item.path) ? "opacity-100" : "opacity-85"
            )}>
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </nav>
  );
}
