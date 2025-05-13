import { useState, useEffect } from "react";
import { Users, Activity, Calendar, AlertTriangle, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { StatsCard } from "@/components/StatsCard";
import { MedicaoLineChart } from "@/components/MedicaoLineChart";
import { PacienteCard } from "@/components/PacienteCard";
import { StatusBadge } from "@/components/StatusBadge";
import { PacientesMedicoesChart } from "@/components/PacientesMedicoesChart";
import { UrgentTasksCard } from "@/components/UrgentTasksCard";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AsymmetryType, SeverityLevel, getCranialStatus } from "@/lib/cranial-utils";

interface Paciente {
  id: string;
  nome: string;
  dataNascimento: string;
  idadeEmMeses: number;
  ultimaMedicao?: {
    data: string;
    status: SeverityLevel;
    asymmetryType: AsymmetryType;
  };
}

interface Medicao {
  id: string;
  paciente_id: string;
  data: string;
  indice_craniano?: number;
  cvai?: number;
  status?: SeverityLevel;
}

interface StatusDistribuicao {
  normal: number;
  leve: number;
  moderada: number;
  severa: number;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [clinicaNome, setClinicaNome] = useState("CraniumCare");
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [medicoes, setMedicoes] = useState<Medicao[]>([]);
  const [statusDistribuicao, setStatusDistribuicao] = useState<StatusDistribuicao>({
    normal: 0,
    leve: 0,
    moderada: 0,
    severa: 0
  });
  const [carregando, setCarregando] = useState(true);
  const [usuario, setUsuario] = useState<{nome: string} | null>(null);
  
  // Carregar dados reais do banco
  useEffect(() => {
    async function carregarDados() {
      try {
        setCarregando(true);
        
        // Verificar autenticação
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user) {
          navigate("/login");
          return;
        }
        
        // Carregar nome da clínica e do usuário
        const { data: usuarioData, error: usuarioError } = await supabase
          .from('usuarios')
          .select('nome, clinica_nome')
          .eq('id', session.user.id)
          .single();
          
        if (usuarioData) {
          setUsuario({ nome: usuarioData.nome });
          
          if (usuarioData.clinica_nome) {
            setClinicaNome(usuarioData.clinica_nome);
            localStorage.setItem('clinicaNome', usuarioData.clinica_nome);
          } else {
            // Carregar do localStorage como fallback
            const savedClinicaNome = localStorage.getItem('clinicaNome');
            if (savedClinicaNome) {
              setClinicaNome(savedClinicaNome);
            }
          }
        }
        
        // Carregar pacientes
        const { data: pacientesData, error: pacientesError } = await supabase
          .from('pacientes')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (pacientesError) {
          console.error("Erro ao carregar pacientes:", pacientesError);
          toast.error("Erro ao carregar pacientes");
          return;
        }
        
        // Carregar medições
        const { data: medicoesData, error: medicoesError } = await supabase
          .from('medicoes')
          .select('*')
          .order('data', { ascending: false });
          
        if (medicoesError) {
          console.error("Erro ao carregar medições:", medicoesError);
          toast.error("Erro ao carregar medições");
          return;
        }
        
        // Processar dados
        const medicoesProcessadas = medicoesData || [];
        setMedicoes(medicoesProcessadas);
        
        // Calcular distribuição de status
        const distribuicao = {
          normal: 0,
          leve: 0,
          moderada: 0,
          severa: 0
        };
        
        medicoesProcessadas.forEach(medicao => {
          const { severityLevel } = getCranialStatus(
            (medicao as any).indice_craniano || 0, 
            (medicao as any).cvai || 0
          );
          
          switch (severityLevel) {
            case 'normal':
              distribuicao.normal++;
              break;
            case 'leve':
              distribuicao.leve++;
              break;
            case 'moderada':
              distribuicao.moderada++;
              break;
            case 'severa':
              distribuicao.severa++;
              break;
          }
        });
        
        setStatusDistribuicao(distribuicao);
        
        // Processar pacientes e suas últimas medições
        const pacientesProcessados = (pacientesData || []).map(paciente => {
          // Encontrar a última medição do paciente
          const medicoesDoPaciente = medicoesProcessadas
            .filter(m => m.paciente_id === paciente.id)
            .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
          
          const ultimaMedicao = medicoesDoPaciente[0];
          
          let ultimaMedicaoProcessada;
          
          if (ultimaMedicao) {
            const { severityLevel, asymmetryType } = getCranialStatus(
              (ultimaMedicao as any).indice_craniano || 0, 
              (ultimaMedicao as any).cvai || 0
            );
            
            ultimaMedicaoProcessada = {
              data: ultimaMedicao.data,
              status: severityLevel,
              asymmetryType
            };
          }
          
          // Calcular idade em meses
          const hoje = new Date();
          const dataNascimento = new Date(paciente.data_nascimento);
          const idadeEmMeses = ((hoje.getFullYear() - dataNascimento.getFullYear()) * 12) +
                               (hoje.getMonth() - dataNascimento.getMonth());
          
          return {
            id: paciente.id,
            nome: paciente.nome,
            dataNascimento: paciente.data_nascimento,
            idadeEmMeses,
            ultimaMedicao: ultimaMedicaoProcessada
          };
        });
        
        setPacientes(pacientesProcessados);
        
      } catch (err) {
        console.error("Erro:", err);
        toast.error("Erro ao carregar dados do dashboard");
      } finally {
        setCarregando(false);
      }
    }
    
    carregarDados();
  }, [navigate]);
  
  // Encontrar paciente com medição mais recente
  const pacienteComMedicaoMaisRecente = pacientes.length > 0 
    ? [...pacientes]
        .filter(p => p.ultimaMedicao)
        .sort((a, b) => {
          const dataA = a.ultimaMedicao?.data ? new Date(a.ultimaMedicao.data).getTime() : 0;
          const dataB = b.ultimaMedicao?.data ? new Date(b.ultimaMedicao.data).getTime() : 0;
          return dataB - dataA;
        })[0]
    : null;

  const totalPacientes = pacientes.length;
  const medicoesRecentes = medicoes.length;
  const pacientesComAlerta = statusDistribuicao.moderada + statusDistribuicao.severa;
  
  // Cálculo de pacientes que precisam de acompanhamento (aqueles com status moderado ou severo)
  const percentualAcompanhamento = totalPacientes > 0 
    ? Math.round((pacientesComAlerta / totalPacientes) * 100) 
    : 0;

  // Função para navegar para página de pacientes com filtro
  const navegarParaPacientesComFiltro = (filtroStatus: string) => {
    navigate(`/pacientes?status=${filtroStatus}`);
  };

  // Preparar pacientes para cards
  const pacientesParaCard = pacientes.slice(0, 4).map(paciente => ({
    id: paciente.id,
    nome: paciente.nome,
    dataNascimento: paciente.dataNascimento,
    idadeEmMeses: paciente.idadeEmMeses,
    ultimaMedicao: paciente.ultimaMedicao ? {
      data: paciente.ultimaMedicao.data,
      status: paciente.ultimaMedicao.status,
      asymmetryType: paciente.ultimaMedicao.asymmetryType
    } : undefined
  }));
  
  // Formatar data da última medição
  const formatarDataUltimaMedicao = (dataString?: string) => {
    if (!dataString) return "N/A";
    
    const data = new Date(dataString);
    const hoje = new Date();
    const ontem = new Date(hoje);
    ontem.setDate(hoje.getDate() - 1);
    
    if (data.toDateString() === hoje.toDateString()) {
      return "Hoje";
    } else if (data.toDateString() === ontem.toDateString()) {
      return "Ontem";
    } else {
      return data.toLocaleDateString('pt-BR');
    }
  };

  if (carregando) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-turquesa" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-3xl font-bold">Olá, {usuario?.nome.split(' ')[0] || 'Doutor(a)'}</h2>
        <p className="text-muted-foreground">
          Bem-vindo(a) de volta ao painel da {clinicaNome}. Confira o resumo dos seus pacientes.
        </p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div onClick={() => navigate("/pacientes")} className="cursor-pointer">
          <StatsCard 
            title="Total de Pacientes"
            value={totalPacientes}
            description="Ativos no sistema"
            icon={<Users className="h-4 w-4 text-muted-foreground" />}
          />
        </div>
        <div onClick={() => navigate("/historico")} className="cursor-pointer">
          <StatsCard 
            title="Total de Medições"
            value={medicoesRecentes}
            description="Registradas no sistema"
            icon={<Activity className="h-4 w-4 text-muted-foreground" />}
          />
        </div>
        <div 
          onClick={() => pacienteComMedicaoMaisRecente ? navigate(`/pacientes/${pacienteComMedicaoMaisRecente.id}`) : null} 
          className={pacienteComMedicaoMaisRecente ? "cursor-pointer" : ""}
        >
          <StatsCard 
            title="Última Avaliação"
            value={pacienteComMedicaoMaisRecente 
              ? formatarDataUltimaMedicao(pacienteComMedicaoMaisRecente.ultimaMedicao?.data)
              : "N/A"}
            description={pacienteComMedicaoMaisRecente?.nome || "Nenhum paciente avaliado"}
            icon={<Calendar className="h-4 w-4 text-muted-foreground" />}
          />
        </div>
        <div onClick={() => navegarParaPacientesComFiltro("alerta")} className="cursor-pointer">
          <StatsCard 
            title="Pacientes em Alerta"
            value={pacientesComAlerta}
            description={`${percentualAcompanhamento}% dos pacientes`}
            icon={<AlertTriangle className="h-4 w-4 text-destructive" />}
            trend={{
              value: 4,
              isPositive: false,
            }}
          />
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="md:col-span-2">
          <PacientesMedicoesChart altura={350} />
        </div>
        <div className="space-y-6">
          <UrgentTasksCard />
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-medium mb-4">Pacientes em Destaque</h3>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {pacientesParaCard.length > 0 ? (
            pacientesParaCard.map((paciente) => (
              <div key={paciente.id} onClick={() => navigate(`/pacientes/${paciente.id}`)} className="cursor-pointer">
                <PacienteCard paciente={paciente} />
              </div>
            ))
          ) : (
            <div className="col-span-full py-8 text-center text-muted-foreground">
              Nenhum paciente cadastrado. <Link to="/pacientes" className="text-turquesa hover:underline">Adicione um paciente</Link>.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import { Link } from "react-router-dom";
