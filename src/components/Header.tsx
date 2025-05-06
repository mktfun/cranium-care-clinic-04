
import { useState } from "react";
import { Link } from "react-router-dom";
import { Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
  title?: string;
}

export function Header({ title = "Dashboard" }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");
  
  return (
    <header className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-2 md:space-y-0 py-4 border-b border-border px-6">
      <div>
        <h1 className="text-2xl font-semibold">{title}</h1>
      </div>
      <div className="flex items-center space-x-4 w-full md:w-auto">
        <div className="relative w-full md:w-auto">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar..."
            className="w-full md:w-[200px] pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute h-2 w-2 top-1 right-1 rounded-full bg-destructive"></span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[300px]">
            <DropdownMenuLabel>Notificações</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="max-h-[300px] overflow-auto">
              <DropdownMenuItem className="flex flex-col items-start">
                <span className="font-medium">Nova consulta agendada</span>
                <span className="text-sm text-muted-foreground">Paciente: Sofia Oliveira - 15:00</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex flex-col items-start">
                <span className="font-medium">Relatório disponível</span>
                <span className="text-sm text-muted-foreground">Paciente: Lucas Santos</span>
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src="" alt="Dr. Ana Silva" />
                <AvatarFallback className="bg-azul text-white">AS</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Dra. Ana Silva</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/perfil">Meu Perfil</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/configuracoes">Configurações</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/login">Sair</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
