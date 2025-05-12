
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Bell, ChevronDown, Menu, Settings, User, Loader2 } from "lucide-react";
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
import { supabase } from "@/integrations/supabase/client";

interface HeaderProps {
  toggleSidebar: () => void;
  sidebarCollapsed: boolean;
  className?: string;
  title?: string;
}

interface Notificacao {
  id: number;
  title: string;
  message: string;
  time: string;
  read: boolean;
}

interface Usuario {
  nome: string;
  email: string;
  avatar_url?: string;
  clinica_nome?: string;
}

export function Header({ toggleSidebar, sidebarCollapsed, className, title }: HeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [notificacoesNaoLidas, setNotificacoesNaoLidas] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [clinicaNome, setClinicaNome] = useState("CraniumCare");
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [carregandoUsuario, setCarregandoUsuario] = useState(true);
  
  // Carregar o usuário autenticado
  useEffect(() => {
    async function carregarUsuario() {
      try {
        setCarregandoUsuario(true);
        
        // Obter sessão atual
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user) {
          return;
        }
        
        // Carregar dados do usuário
        const { data: usuarioData, error } = await supabase
          .from('usuarios')
          .select('*')
          .eq('id', session.user.id)
          .single();
          
        if (error) {
          console.error("Erro ao carregar dados do usuário:", error);
          return;
        }
        
        if (usuarioData) {
          setUsuario({
            nome: usuarioData.nome || 'Usuário',
            email: usuarioData.email || '',
            avatar_url: usuarioData.avatar_url,
            clinica_nome: usuarioData.clinica_nome
          });
          
          // Atualizar nome da clínica
          if (usuarioData.clinica_nome) {
            setClinicaNome(usuarioData.clinica_nome);
            localStorage.setItem('clinicaNome', usuarioData.clinica_nome);
          }
        }
        
      } catch (err) {
        console.error("Erro ao carregar usuário:", err);
      } finally {
        setCarregandoUsuario(false);
      }
    }
    
    carregarUsuario();
    
    // Carregar notificações
    carregarNotificacoes();
  }, []);
  
  // Carregar o nome da clínica do localStorage
  useEffect(() => {
    const savedClinicaNome = localStorage.getItem('clinicaNome');
    if (savedClinicaNome) {
      setClinicaNome(savedClinicaNome);
    }
  }, [location.pathname]); // Recarrega quando muda a rota

  // Carregar notificações
  const carregarNotificacoes = async () => {
    // Aqui seria implementada a busca de notificações reais do banco
    // Por enquanto, usamos dados de exemplo
    
    const notificacoesExemplo = [
      { 
        id: 1, 
        title: "Nova medição registrada", 
        message: "A medição de João Silva foi registrada com sucesso.", 
        time: "Há 2 horas",
        read: false
      },
      { 
        id: 2, 
        title: "Lembrete de acompanhamento", 
        message: "Maria Oliveira precisa de reavaliação hoje.", 
        time: "Há 5 horas",
        read: false
      },
    ];
    
    setNotificacoes(notificacoesExemplo);
    setNotificacoesNaoLidas(notificacoesExemplo.filter(n => !n.read).length);
  };
  
  // Marcar notificação como lida
  const marcarComoLida = (id: number) => {
    const notificacoesAtualizadas = notificacoes.map(notificacao => {
      if (notificacao.id === id) {
        return { ...notificacao, read: true };
      }
      return notificacao;
    });
    
    setNotificacoes(notificacoesAtualizadas);
    setNotificacoesNaoLidas(notificacoesAtualizadas.filter(n => !n.read).length);
  };
  
  // Marcar todas como lidas
  const marcarTodasComoLidas = () => {
    const notificacoesAtualizadas = notificacoes.map(notificacao => ({
      ...notificacao,
      read: true
    }));
    
    setNotificacoes(notificacoesAtualizadas);
    setNotificacoesNaoLidas(0);
  };
  
  // Get current page name
  const getCurrentPageName = () => {
    const path = location.pathname;
    
    // Map routes to readable names
    const routeNames: Record<string, string> = {
      "/dashboard": `Dashboard – ${clinicaNome}`,
      "/pacientes": "Pacientes",
      "/historico": "Histórico",
      "/relatorios": `Relatórios – ${clinicaNome}`,
      "/configuracoes": "Configurações",
      "/perfil": "Meu Perfil",
      "/tarefas": "Tarefas",
      "/notificacoes": "Notificações",
    };
    
    // Check for dynamic routes
    if (path.startsWith("/pacientes/") && path.includes("/nova-medicao")) {
      return "Nova Medição";
    }
    
    if (path.startsWith("/pacientes/") && path.includes("/relatorio")) {
      return "Relatório de Medição";
    }
    
    if (path.startsWith("/pacientes/") && !path.includes("/")) {
      return "Detalhe do Paciente";
    }
    
    return routeNames[path] || title || "";
  };
  
  // Simulate loading when route changes
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 600);
    
    return () => clearTimeout(timer);
  }, [location.pathname]);
  
  // Iniciais para o avatar
  const obterIniciais = (nome: string) => {
    return nome
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Logout
  const fazerLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/login");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  return (
    <header
      className={cn(
        "border-b bg-background fixed top-0 right-0 left-0 z-10 transition-all duration-300",
        sidebarCollapsed ? "lg:pl-[70px]" : "lg:pl-[250px]",
        className
      )}
    >
      <div className="flex h-16 items-center px-4 gap-4">
        <Button variant="ghost" size="icon" onClick={toggleSidebar} className="lg:hidden">
          <Menu className="h-5 w-5" />
        </Button>
        <div className="hidden md:flex md:flex-1 items-center">
          <nav className="flex items-center space-x-4 lg:space-x-6">
            {title && <h1 className="text-xl font-semibold">{title}</h1>}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium transition-colors hover:text-primary">
                {new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
              {getCurrentPageName() && (
                <>
                  <span className="text-muted-foreground mx-2">•</span>
                  <span 
                    className={cn(
                      "text-primary font-medium transition-all flex items-center",
                      isLoading ? "opacity-70" : "opacity-100"
                    )}
                  >
                    {getCurrentPageName()}
                    {isLoading && (
                      <span className="ml-2 inline-block h-2 w-2 rounded-full bg-primary animate-pulse" />
                    )}
                  </span>
                </>
              )}
            </div>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {notificacoesNaoLidas > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] text-destructive-foreground">
                    {notificacoesNaoLidas}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
              <div className="border-b p-3 flex items-center justify-between">
                <h2 className="font-semibold">Notificações</h2>
                {notificacoesNaoLidas > 0 && (
                  <Button 
                    variant="ghost" 
                    className="text-xs" 
                    size="sm"
                    onClick={marcarTodasComoLidas}
                  >
                    Marcar todas como lidas
                  </Button>
                )}
              </div>
              <div className="max-h-80 overflow-auto">
                {notificacoes.length > 0 ? (
                  notificacoes.map((notificacao) => (
                    <div 
                      key={notificacao.id} 
                      className={cn(
                        "border-b p-3 cursor-pointer hover:bg-muted",
                        !notificacao.read && "bg-muted/50"
                      )}
                      onClick={() => marcarComoLida(notificacao.id)}
                    >
                      <div className="font-medium">{notificacao.title}</div>
                      <div className="text-sm text-muted-foreground mt-1">{notificacao.message}</div>
                      <div className="text-xs text-muted-foreground mt-1">{notificacao.time}</div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-muted-foreground">
                    Nenhuma notificação no momento
                  </div>
                )}
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
                  {carregandoUsuario ? (
                    <div className="h-full w-full flex items-center justify-center bg-muted">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  ) : (
                    <>
                      <AvatarImage src={usuario?.avatar_url || ""} />
                      <AvatarFallback>{obterIniciais(usuario?.nome || "Usuário")}</AvatarFallback>
                    </>
                  )}
                </Avatar>
                <div className="hidden md:block text-sm font-medium text-left">
                  <div>{usuario?.nome || "Carregando..."}</div>
                  <div className="text-xs text-muted-foreground">Médico(a)</div>
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
              <DropdownMenuItem onClick={fazerLogout} className="text-destructive cursor-pointer">
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
