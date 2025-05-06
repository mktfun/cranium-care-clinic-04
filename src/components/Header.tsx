
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, ChevronDown, Menu, Settings, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface HeaderProps {
  toggleSidebar: () => void;
  sidebarCollapsed: boolean;
  className?: string;
  title?: string;
}

export function Header({ toggleSidebar, sidebarCollapsed, className, title }: HeaderProps) {
  const navigate = useNavigate();
  const [notificationsCount] = useState(2);
  
  const notifications = [
    { id: 1, title: "Nova medição registrada", message: "A medição de João Silva foi registrada com sucesso.", time: "Há 2 horas" },
    { id: 2, title: "Lembrete de acompanhamento", message: "Maria Oliveira precisa de reavaliação hoje.", time: "Há 5 horas" },
  ];

  return (
    <header
      className={cn(
        "border-b bg-background fixed top-0 right-0 z-10 transition-all duration-300 h-16",
        className
      )}
      style={{ width: 'inherit' }}
    >
      <div className="flex h-16 items-center px-4 gap-4">
        <Button variant="ghost" size="icon" onClick={toggleSidebar} className="lg:hidden">
          <Menu className="h-5 w-5" />
        </Button>
        <div className="hidden md:flex md:flex-1 items-center">
          <nav className="flex items-center space-x-4 lg:space-x-6">
            {title && <h1 className="text-xl font-semibold">{title}</h1>}
            <span className="text-sm font-medium transition-colors hover:text-primary">
              {new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {notificationsCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] text-destructive-foreground">
                    {notificationsCount}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
              <div className="border-b p-3">
                <h2 className="font-semibold">Notificações</h2>
              </div>
              <div className="max-h-80 overflow-auto">
                {notifications.map((notification) => (
                  <div key={notification.id} className="border-b p-3 cursor-pointer hover:bg-muted">
                    <div className="font-medium">{notification.title}</div>
                    <div className="text-sm text-muted-foreground mt-1">{notification.message}</div>
                    <div className="text-xs text-muted-foreground mt-1">{notification.time}</div>
                  </div>
                ))}
              </div>
              <div className="p-2 border-t">
                <Button variant="ghost" className="w-full text-sm text-center" onClick={() => navigate("/notificacoes")}>
                  Ver todas as notificações
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative flex items-center gap-2 px-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/avatar.png" />
                  <AvatarFallback>DA</AvatarFallback>
                </Avatar>
                <div className="hidden md:block text-sm font-medium text-left">
                  <div>Dr. Ana Silva</div>
                  <div className="text-xs text-muted-foreground">Pediatra</div>
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>Minha conta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/perfil")} className="flex items-center gap-2 cursor-pointer">
                <User className="h-4 w-4" />
                <span>Meu perfil</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/configuracoes")} className="flex items-center gap-2 cursor-pointer">
                <Settings className="h-4 w-4" />
                <span>Configurações</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/login")} className="text-destructive cursor-pointer">
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
