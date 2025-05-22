
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AnimatedSidebar } from "@/components/AnimatedSidebar";

interface SidebarProps {
  className?: string;
  collapsed?: boolean;
  navigateToDashboard?: () => void;
}

export function Sidebar({
  className,
  collapsed = false,
  navigateToDashboard
}: SidebarProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [clinicaNome, setClinicaNome] = useState("Medikran");
  const [carregando, setCarregando] = useState(false);
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

  // Carregar o nome da clínica
  useEffect(() => {
    async function carregarClinica() {
      try {
        // Primeiro, tentar obter do localStorage para exibição rápida
        const savedClinicaNome = localStorage.getItem('clinicaNome');
        if (savedClinicaNome) {
          setClinicaNome(savedClinicaNome);
        }

        // Depois, obter a sessão atual
        const {
          data: {
            session
          }
        } = await supabase.auth.getSession();
        if (!session?.user) {
          return;
        }

        // Carregar dados do usuário para obter o nome da clínica
        const {
          data: usuarioData,
          error
        } = await supabase.from('usuarios').select('clinica_nome').eq('id', session.user.id).single();
        if (error) {
          console.error("Erro ao carregar dados da clínica:", error);
          return;
        }
        if (usuarioData?.clinica_nome) {
          setClinicaNome(usuarioData.clinica_nome);
          localStorage.setItem('clinicaNome', usuarioData.clinica_nome);
        }
      } catch (err) {
        console.error("Erro ao carregar dados da clínica:", err);
      }
    }
    carregarClinica();
  }, []);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

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

  return (
    <AnimatedSidebar />
  );
}
