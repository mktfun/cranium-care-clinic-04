import React, { useState, useEffect } from "react";
import {
  Sidebar,
  SidebarBody,
  SidebarLink,
} from "@/components/ui/sidebar-animated";
import {
  LayoutDashboard,
  UserCog,
  Settings,
  LogOut,
  Users,
  Calendar,
  Loader2,
  UserPlus,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAvatar } from "@/hooks/useAvatar";
import { useAnalyticsAccess } from "@/hooks/useAnalyticsAccess";

export function AnimatedSidebar() {
  const navigate = useNavigate();
  const [carregando, setCarregando] = useState(false);
  const [usuario, setUsuario] = useState<any>(null);
  const { avatarUrl } = useAvatar();
  const { hasAccess: hasAnalyticsAccess } = useAnalyticsAccess();
  
  // Load user data
  useEffect(() => {
    async function carregarUsuario() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return;

        const { data: usuarioData } = await supabase
          .from('usuarios')
          .select('nome, email')
          .eq('id', session.user.id)
          .single();

        if (usuarioData) {
          setUsuario(usuarioData);
        }
      } catch (err) {
        console.error("Erro ao carregar usuário:", err);
      }
    }
    carregarUsuario();
  }, []);
  
  const handleLogout = async () => {
    try {
      setCarregando(true);
      const {
        error
      } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      toast.success("Logout realizado com sucesso!");
      navigate("/login");
    } catch (error: any) {
      console.error("Erro ao fazer logout:", error);
      toast.error(`Erro ao fazer logout: ${error.message}`);
    } finally {
      setCarregando(false);
    }
  };

  const obterIniciais = (nome: string) => {
    if (!nome) return "U";
    return nome.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const links = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: (
        <LayoutDashboard className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Pacientes",
      href: "/pacientes",
      icon: (
        <Users className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Histórico",
      href: "/historico",
      icon: (
        <Calendar className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    ...(hasAnalyticsAccess ? [{
      label: "Analytics",
      href: "/analytics",
      icon: (
        <BarChart3 className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    }] : []),
    {
      label: "Colaboradores",
      href: "/colaboradores",
      icon: (
        <UserPlus className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Configurações",
      href: "/configuracoes",
      icon: (
        <Settings className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
  ];
  
  const [open, setOpen] = useState(false);
  
  return (
    <Sidebar open={open} setOpen={setOpen}>
      <SidebarBody className="justify-between gap-10">
        <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
          {open ? <Logo /> : <LogoIcon />}
          <div className="mt-8 flex flex-col gap-2">
            {links.map((link, idx) => (
              <SidebarLink key={idx} link={link} />
            ))}
            <div className="flex items-center justify-start gap-2 group/sidebar py-2 cursor-pointer" onClick={handleLogout}>
              {carregando ? (
                <Loader2 className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0 animate-spin" />
              ) : (
                <LogOut className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
              )}
              <span 
                className={cn(
                  "text-neutral-700 dark:text-neutral-200 text-sm group-hover/sidebar:translate-x-1 transition duration-150 whitespace-pre inline-block !p-0 !m-0",
                  !open && "hidden opacity-0"
                )}
              >
                Sair
              </span>
            </div>
          </div>
        </div>
        <div>
          <SidebarLink
            link={{
              label: "Perfil",
              href: "/perfil",
              icon: (
                <Avatar className="h-7 w-7 flex-shrink-0">
                  <AvatarImage src={avatarUrl || ""} />
                  <AvatarFallback className="bg-turquesa text-white text-xs font-medium">
                    {obterIniciais(usuario?.nome || "U")}
                  </AvatarFallback>
                </Avatar>
              ),
            }}
          />
        </div>
      </SidebarBody>
    </Sidebar>
  );
}

export const Logo = () => {
  return (
    <div
      className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
    >
      <div className="h-5 w-6 bg-turquesa dark:bg-turquesa rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" />
      <div
        className="font-medium text-black dark:text-white whitespace-pre"
      >
        Medikran
      </div>
    </div>
  );
};

export const LogoIcon = () => {
  return (
    <div
      className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
    >
      <div className="h-5 w-6 bg-turquesa dark:bg-turquesa rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" />
    </div>
  );
};
