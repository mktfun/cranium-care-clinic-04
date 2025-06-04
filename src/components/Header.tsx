import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Bell, ChevronDown, Menu, Settings, User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";
import { getCranialStatus } from "@/lib/cranial-utils";
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useIsMobile } from "@/hooks/use-mobile";
import { useAvatar } from "@/hooks/useAvatar";

interface HeaderProps {
  toggleSidebar: () => void;
  sidebarCollapsed: boolean;
  className?: string;
  title?: string;
}

// Interface de Notificação expandida
export interface RealNotificacao {
  id: string; // UUID da notificação ou combinação de tipo+referenciaId
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  type: 'novo_paciente' | 'nova_medicao' | 'tarefa_hoje' | 'tarefa_atrasada' | 'info' | 'lembrete' | 'alerta';
  link?: string;
  urgencia?: 'baixa' | 'media' | 'alta';
  referenciaId?: string; // ID do paciente, medição, tarefa
}
interface Usuario {
  nome: string;
  email: string;
  avatar_url?: string;
  clinica_nome?: string;
  cargo?: string;
}
const NOTIFICACOES_LIDAS_STORAGE_KEY = "craniumCareNotificacoesLidas";
const ULTIMA_VERIFICACAO_STORAGE_KEY = "craniumCareUltimaVerificacaoNotificacoes";
export function Header({
  toggleSidebar,
  sidebarCollapsed,
  className,
  title
}: HeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [notificacoes, setNotificacoes] = useState<RealNotificacao[]>([]);
  const [notificacoesNaoLidas, setNotificacoesNaoLidas] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [clinicaNome, setClinicaNome] = useState("CraniumCare");
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [carregandoUsuario, setCarregandoUsuario] = useState(true);
  const { avatarUrl } = useAvatar();

  const getNotificacoesLidas = (): string[] => {
    const lidas = localStorage.getItem(NOTIFICACOES_LIDAS_STORAGE_KEY);
    return lidas ? JSON.parse(lidas) : [];
  };
  const marcarNotificacaoComoLidaStorage = (id: string) => {
    const lidas = getNotificacoesLidas();
    if (!lidas.includes(id)) {
      localStorage.setItem(NOTIFICACOES_LIDAS_STORAGE_KEY, JSON.stringify([...lidas, id]));
    }
  };
  const marcarTodasComoLidasStorage = (notifs: RealNotificacao[]) => {
    const todasIds = notifs.map(n => n.id);
    localStorage.setItem(NOTIFICACOES_LIDAS_STORAGE_KEY, JSON.stringify(todasIds));
  };
  const carregarNotificacoesReais = useCallback(async () => {
    const {
      data: {
        session
      }
    } = await supabase.auth.getSession();
    if (!session?.user) return;
    let todasAsNotificacoes: RealNotificacao[] = [];
    const agora = new Date();
    const ultimaVerificacaoString = localStorage.getItem(ULTIMA_VERIFICACAO_STORAGE_KEY);
    const ultimaVerificacao = ultimaVerificacaoString ? new Date(ultimaVerificacaoString) : new Date(agora.getTime() - 24 * 60 * 60 * 1000 * 7); // Padrão: últimos 7 dias

    // 1. Novos Pacientes
    try {
      const {
        data: novosPacientes,
        error: errPacientes
      } = await supabase.from("pacientes").select("id, nome, created_at").gt("created_at", ultimaVerificacao.toISOString()).order("created_at", {
        ascending: false
      });
      if (errPacientes) console.error("Erro ao buscar novos pacientes:", errPacientes);else if (novosPacientes) {
        novosPacientes.forEach(p => {
          todasAsNotificacoes.push({
            id: `paciente-${p.id}`,
            title: "Novo Paciente Registrado",
            message: `O paciente ${p.nome} foi registrado no sistema.`,
            timestamp: new Date(p.created_at),
            read: false,
            // Será atualizado abaixo
            type: "novo_paciente",
            link: `/pacientes/${p.id}`,
            urgencia: "media",
            referenciaId: p.id
          });
        });
      }
    } catch (e) {
      console.error("Catch novos pacientes:", e);
    }

    // 2. Novas Medições
    try {
      const {
        data: novasMedicoes,
        error: errMedicoes
      } = await supabase.from("medicoes").select("id, paciente_id, data, pacientes (nome)") // Join para pegar nome do paciente
      .gt("data", ultimaVerificacao.toISOString()).order("data", {
        ascending: false
      });
      if (errMedicoes) console.error("Erro ao buscar novas medições:", errMedicoes);else if (novasMedicoes) {
        novasMedicoes.forEach((m: any) => {
          const nomePaciente = m.pacientes?.nome || "Paciente";
          todasAsNotificacoes.push({
            id: `medicao-${m.id}`,
            title: "Nova Medição Registrada",
            message: `Nova medição para ${nomePaciente} em ${new Date(m.data).toLocaleDateString("pt-BR")}.`,
            timestamp: new Date(m.data),
            read: false,
            type: "nova_medicao",
            link: `/pacientes/${m.paciente_id}/medicoes/${m.id}`,
            urgencia: "media",
            referenciaId: m.id
          });
        });
      }
    } catch (e) {
      console.error("Catch novas medições:", e);
    }

    // 3. Tarefas (derivadas de medições para reavaliação)
    try {
      const {
        data: pacientesComMedicoes,
        error: errPacMed
      } = await supabase.from('pacientes').select(`
                id, nome,
                medicoes (id, data, indice_craniano, cvai)
            `).order('data', {
        foreignTable: 'medicoes',
        ascending: false
      });
      if (errPacMed) console.error("Erro ao buscar pacientes para tarefas:", errPacMed);else if (pacientesComMedicoes) {
        const hoje = new Date();
        const inicioHoje = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
        const fimHoje = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate(), 23, 59, 59);
        pacientesComMedicoes.forEach((pac: any) => {
          if (pac.medicoes && pac.medicoes.length > 0) {
            const ultimaMedicao = pac.medicoes[0]; // Já está ordenado
            const {
              severityLevel
            } = getCranialStatus(ultimaMedicao.indice_craniano || 0, ultimaMedicao.cvai || 0);
            const dataUltimaMedicao = new Date(ultimaMedicao.data);
            let proximaAvaliacao = new Date(dataUltimaMedicao);
            switch (severityLevel) {
              case 'normal':
                proximaAvaliacao.setMonth(dataUltimaMedicao.getMonth() + 3);
                break;
              case 'leve':
                proximaAvaliacao.setMonth(dataUltimaMedicao.getMonth() + 2);
                break;
              case 'moderada':
              case 'severa':
                proximaAvaliacao.setMonth(dataUltimaMedicao.getMonth() + 1);
                break;
              default:
                proximaAvaliacao.setMonth(dataUltimaMedicao.getMonth() + 2);
            }
            if (proximaAvaliacao >= inicioHoje && proximaAvaliacao <= fimHoje) {
              todasAsNotificacoes.push({
                id: `tarefa-hoje-${pac.id}-${ultimaMedicao.id}`,
                title: "Tarefa para Hoje",
                message: `Reavaliação de ${pac.nome} agendada para hoje.`,
                timestamp: proximaAvaliacao,
                read: false,
                type: "tarefa_hoje",
                link: `/pacientes/${pac.id}`,
                urgencia: "alta",
                referenciaId: pac.id
              });
            } else if (proximaAvaliacao < inicioHoje) {
              // Considerar apenas tarefas atrasadas nos últimos X dias para não poluir
              const diasAtraso = (inicioHoje.getTime() - proximaAvaliacao.getTime()) / (1000 * 3600 * 24);
              if (diasAtraso <= 7) {
                // Ex: tarefas atrasadas até 7 dias
                todasAsNotificacoes.push({
                  id: `tarefa-atrasada-${pac.id}-${ultimaMedicao.id}`,
                  title: "Tarefa Atrasada",
                  message: `Reavaliação de ${pac.nome} está atrasada.`,
                  timestamp: proximaAvaliacao,
                  read: false,
                  type: "tarefa_atrasada",
                  link: `/pacientes/${pac.id}`,
                  urgencia: "alta",
                  referenciaId: pac.id
                });
              }
            }
          }
        });
      }
    } catch (e) {
      console.error("Catch tarefas:", e);
    }

    // Ordenar e aplicar estado "lida"
    todasAsNotificacoes.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    const notificacoesLidasIds = getNotificacoesLidas();
    const notificacoesFinais = todasAsNotificacoes.map(n => ({
      ...n,
      read: notificacoesLidasIds.includes(n.id)
    }));
    setNotificacoes(notificacoesFinais);
    setNotificacoesNaoLidas(notificacoesFinais.filter(n => !n.read).length);
    localStorage.setItem(ULTIMA_VERIFICACAO_STORAGE_KEY, agora.toISOString());
  }, []);
  useEffect(() => {
    async function carregarUsuario() {
      try {
        setCarregandoUsuario(true);
        const {
          data: {
            session
          }
        } = await supabase.auth.getSession();
        if (!session?.user) return;
        const {
          data: usuarioData
        } = await supabase.from('usuarios').select('nome, email, avatar_url, clinica_nome, cargo').eq('id', session.user.id).single();
        if (usuarioData) {
          setUsuario(usuarioData);
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
    carregarNotificacoesReais(); // Carregar notificações reais
  }, [carregarNotificacoesReais]);
  useEffect(() => {
    const savedClinicaNome = localStorage.getItem('clinicaNome');
    if (savedClinicaNome) setClinicaNome(savedClinicaNome);
  }, [location.pathname]);
  const marcarComoLida = (id: string) => {
    marcarNotificacaoComoLidaStorage(id);
    const notificacoesAtualizadas = notificacoes.map(n => n.id === id ? {
      ...n,
      read: true
    } : n);
    setNotificacoes(notificacoesAtualizadas);
    setNotificacoesNaoLidas(notificacoesAtualizadas.filter(n => !n.read).length);
  };
  const marcarTodasComoLidasAction = () => {
    marcarTodasComoLidasStorage(notificacoes);
    const notificacoesAtualizadas = notificacoes.map(n => ({
      ...n,
      read: true
    }));
    setNotificacoes(notificacoesAtualizadas);
    setNotificacoesNaoLidas(0);
  };

  // Helper to get current page title
  const getCurrentPageTitle = () => {
    if (title) return title;
    const path = location.pathname;
    const routeNames: Record<string, string> = {
      "/dashboard": "Dashboard",
      "/pacientes": "Pacientes",
      "/historico": "Histórico",
      "/relatorios": "Relatórios",
      "/configuracoes": "Configurações",
      "/perfil": "Perfil",
      "/tarefas": "Tarefas",
      "/notificacoes": "Notificações"
    };
    if (path.startsWith("/pacientes/") && path.includes("/nova-medicao")) return "Nova Medição";
    if (path.startsWith("/pacientes/") && path.includes("/relatorio")) return "Relatório";
    if (path.startsWith("/pacientes/") && path.split('/').length === 3) return "Paciente";
    return routeNames[path] || "";
  };
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(timer);
  }, [location.pathname]);
  const obterIniciais = (nome: string) => nome.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  const fazerLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/login");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  // Formata o tempo da notificação (ex: Há 2 horas, Ontem)
  const formatarTempoNotificacao = (timestamp: Date): string => {
    return formatDistanceToNow(new Date(timestamp), {
      addSuffix: true,
      locale: ptBR
    });
  };
  return <header className={cn("border-b bg-background fixed top-0 right-0 left-0 z-10 transition-all duration-300 pt-safe", !isMobile && (sidebarCollapsed ? "lg:pl-[70px]" : "lg:pl-[250px]"), className)}>
      <div className="flex h-16 items-center gap-4 px-[21px]">
        {!isMobile}
        
        {isMobile ? <div className="flex-1 flex justify-between items-center">
            <div className="flex flex-col">
              <h2 className="text-lg font-medium text-primary">{clinicaNome}</h2>
              <p className="text-xs text-muted-foreground">{getCurrentPageTitle()}</p>
            </div>
          </div> : <div className="hidden md:flex md:flex-1 items-center">
            <nav className="flex items-center space-x-4 lg:space-x-6">
              {title && <h1 className="text-xl font-semibold">{title}</h1>}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium transition-colors hover:text-primary">
                  {new Date().toLocaleDateString('pt-BR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
                </span>
                {getCurrentPageTitle() && <>
                    <span className="text-muted-foreground mx-2">•</span>
                    <span className={cn("text-primary font-medium transition-all flex items-center", isLoading ? "opacity-70" : "opacity-100")}>
                      {getCurrentPageTitle()}
                      {isLoading && <span className="ml-2 inline-block h-2 w-2 rounded-full bg-primary animate-pulse" />}
                    </span>
                  </>}
              </div>
            </nav>
          </div>}
        
        <div className="flex items-center gap-2">
          <Popover onOpenChange={open => {
          if (open) carregarNotificacoesReais();
        }}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {notificacoesNaoLidas > 0 && <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] text-destructive-foreground">
                    {notificacoesNaoLidas}
                  </span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
              <div className="border-b p-3 flex items-center justify-between">
                <h2 className="font-semibold">Notificações</h2>
                {notificacoesNaoLidas > 0 && <Button variant="ghost" className="text-xs" size="sm" onClick={marcarTodasComoLidasAction}>
                    Marcar todas como lidas
                  </Button>}
              </div>
              <div className="max-h-80 overflow-auto">
                {notificacoes.length > 0 ? notificacoes.map(notificacao => <div key={notificacao.id} className={cn("border-b p-3 cursor-pointer hover:bg-muted/50 dark:hover:bg-gray-700/50 transition-colors duration-150", !notificacao.read && "bg-blue-50 dark:bg-blue-900/30 font-medium")} onClick={() => {
                marcarComoLida(notificacao.id);
                if (notificacao.link) navigate(notificacao.link);
              }}>
                      <div className={cn("font-semibold", !notificacao.read && "text-blue-700 dark:text-blue-400")}>{notificacao.title}</div>
                      <div className="text-sm text-muted-foreground mt-1">{notificacao.message}</div>
                      <div className="text-xs text-muted-foreground mt-1">{formatarTempoNotificacao(notificacao.timestamp)}</div>
                    </div>) : <div className="p-4 text-center text-muted-foreground">
                    Nenhuma notificação no momento
                  </div>}
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
                  {carregandoUsuario ? <div className="h-full w-full flex items-center justify-center bg-muted">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div> : <>
                      <AvatarImage src={avatarUrl || ""} />
                      <AvatarFallback>{obterIniciais(usuario?.nome || "Usuário")}</AvatarFallback>
                    </>}
                </Avatar>
                {!isMobile && <div className="hidden md:block text-sm font-medium text-left">
                    <div>{usuario?.nome || "Carregando..."}</div>
                    <div className="text-xs text-muted-foreground">{usuario?.cargo || "sem cargo"}</div>
                  </div>}
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
    </header>;
}
