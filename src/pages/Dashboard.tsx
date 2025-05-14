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
import { AsymmetryType, SeverityLevel, Paciente } from "@/types";
import { getCranialStatus } from "@/lib/cranial-utils";
import { Link } from "react-router-dom";
import { Json } from "@/integrations/supabase/types";

interface MedicacaoPaciente {
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

interface TrendData {
  value: number;
  isPositive: boolean;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [clinicaNome, setClinicaNome] = useState("CraniumCare");
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [medicoes, setMedicoes] = useState<Medicao[]>([]);
  const [statusDistribuicaoGeral, setStatusDistribuicaoGeral] = useState<StatusDistribuicao>({
    normal: 0,
    leve: 0,
    moderada: 0,
    severa: 0
  });
  const [carregando, setCarregando] = useState(true);
  const [usuario, setUsuario] = useState<{nome: string} | null>(null);
  const [pacientesAlertaMesAtual, setPacientesAlertaMesAtual] = useState(0);
  const [trendPacientesAlerta, setTrendPacientesAlerta] = useState<TrendData | undefined>(undefined);
  const [percentualPacientesAlerta, setPercentualPacientesAlerta] = useState(0);

  useEffect(() => {
    async function carregarDados() {
      try {
        setCarregando(true);
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          navigate("/login");
          return;
        }

        const { data: usuarioData } = await supabase
          .from("usuarios")
          .select("nome, clinica_nome")
          .eq("id", session.user.id)
          .single();

        if (usuarioData) {
          setUsuario({ nome: usuarioData.nome });
          if (usuarioData.clinica_nome) {
            setClinicaNome(usuarioData.clinica_nome);
            localStorage.setItem("clinicaNome", usuarioData.clinica_nome);
          } else {
            const savedClinicaNome = localStorage.getItem("clinicaNome");
            if (savedClinicaNome) setClinicaNome(savedClinicaNome);
          }
        }

        const { data: pacientesData, error: pacientesError } = await supabase
          .from("pacientes")
          .select("*")
          .order("created_at", { ascending: false });

        if (pacientesError) {
          console.error("Erro ao carregar pacientes:", pacientesError);
          toast.error("Erro ao carregar pacientes");
          return;
        }
        
        // Process patients data to match the Paciente interface
        const processedPacientes = pacientesData?.map(p => ({
          id: p.id,
          nome: p.nome,
          data_nascimento: p.data_nascimento,
          dataNascimento: p.data_nascimento,
          sexo: p.sexo || '',
          responsaveis: p.responsaveis,
          created_at: p.created_at,
          updated_at: p.updated_at,
          user_id: p.user_id,
          idadeEmMeses: calculateAgeInMonths(p.data_nascimento)
        })) || [];
        
        setPacientes(processedPacientes);

        const { data: medicoesData, error: medicoesError } = await supabase
          .from("medicoes")
          .select("*")
          .order("data", { ascending: false });

        if (medicoesError) {
          console.error("Erro ao carregar medições:", medicoesError);
          toast.error("Erro ao carregar medições");
          return;
        }
        const medicoesProcessadas = medicoesData || [];
        setMedicoes(medicoesProcessadas);

        // Calcular pacientes em alerta (mês atual vs mês anterior)
        const hoje = new Date();
        const primeiroDiaMesAtual = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
        const ultimoDiaMesAtual = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
        const primeiroDiaMesAnterior = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1);
        const ultimoDiaMesAnterior = new Date(hoje.getFullYear(), hoje.getMonth(), 0);

        const getPacientesEmAlertaNoPeriodo = (meds: Medicao[], inicio: Date, fim: Date): Set<string> => {
          const pacientesEmAlertaSet = new Set<string>();
          meds.forEach(medicao => {
            const dataMedicao = new Date(medicao.data);
            if (dataMedicao >= inicio && dataMedicao <= fim) {
              const { severityLevel } = getCranialStatus(
                (medicao as any).indice_craniano || 0,
                (medicao as any).cvai || 0
              );
              if (severityLevel === "moderada" || severityLevel === "severa") {
                pacientesEmAlertaSet.add(medicao.paciente_id);
              }
            }
          });
          return pacientesEmAlertaSet;
        };

        const pacientesAlertaSetMesAtual = getPacientesEmAlertaNoPeriodo(medicoesProcessadas, primeiroDiaMesAtual, ultimoDiaMesAtual);
        const numPacientesAlertaMesAtual = pacientesAlertaSetMesAtual.size;
        setPacientesAlertaMesAtual(numPacientesAlertaMesAtual);

        const pacientesAlertaSetMesAnterior = getPacientesEmAlertaNoPeriodo(medicoesProcessadas, primeiroDiaMesAnterior, ultimoDiaMesAnterior);
        const numPacientesAlertaMesAnterior = pacientesAlertaSetMesAnterior.size;
        
        // Calcular Trend
        if (medicoesProcessadas.filter(m => new Date(m.data) >= primeiroDiaMesAnterior && new Date(m.data) <= ultimoDiaMesAnterior).length > 0) { // Verifica se há dados no mês anterior
          if (numPacientesAlertaMesAnterior > 0) {
            const variacao = ((numPacientesAlertaMesAtual - numPacientesAlertaMesAnterior) / numPacientesAlertaMesAnterior) * 100;
            setTrendPacientesAlerta({
              value: Math.abs(Math.round(variacao)),
              isPositive: numPacientesAlertaMesAtual < numPacientesAlertaMesAnterior, // Melhora = verde (isPositive true)
            });
          } else if (numPacientesAlertaMesAtual > 0) { // Mês anterior zerado, mas atual tem alertas
             setTrendPacientesAlerta({
              value: 100, // Representa um aumento de 0 para X
              isPositive: false, // Piora = vermelho
            });
          } else { // Ambos zerados
            setTrendPacientesAlerta(undefined); // Sem variação, não mostra trend
          }
        } else {
          setTrendPacientesAlerta(undefined); // Sem dados do mês anterior, não mostra trend
        }

        // Calcular percentual de pacientes em alerta (em relação ao total de pacientes)
        const totalPacientesSistema = pacientesData?.length || 0;
        if (totalPacientesSistema > 0) {
          setPercentualPacientesAlerta(Math.round((numPacientesAlertaMesAtual / totalPacientesSistema) * 100));
        } else {
          setPercentualPacientesAlerta(0);
        }
        
        // Processar distribuição geral de status (para outros cards, se necessário, ou apenas para consistência)
        const distribuicaoGeral = { normal: 0, leve: 0, moderada: 0, severa: 0 };
        const pacientesComMedicaoIds = new Set<string>(); // Para contar status da última medição de cada paciente
        medicoesProcessadas
          .sort((a,b) => new Date(b.data).getTime() - new Date(a.data).getTime())
          .forEach(medicao => {
            if(!pacientesComMedicaoIds.has(medicao.paciente_id)){
                const { severityLevel } = getCranialStatus((medicao as any).indice_craniano || 0, (medicao as any).cvai || 0);
                distribuicaoGeral[severityLevel]++;
                pacientesComMedicaoIds.add(medicao.paciente_id);
            }
          });
        setStatusDistribuicaoGeral(distribuicaoGeral);

        // Processar pacientes e suas últimas medições para cards de destaque
        const pacientesProcessadosParaCard = (pacientesData || []).map(paciente => {
          const medicoesDoPaciente = medicoesProcessadas
            .filter(m => m.paciente_id === paciente.id)
            .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
          const ultimaMedicao = medicoesDoPaciente[0];
          let ultimaMedicaoProcessada;
          if (ultimaMedicao) {
            const { severityLevel, asymmetryType } = getCranialStatus((ultimaMedicao as any).indice_craniano || 0, (ultimaMedicao as any).cvai || 0);
            ultimaMedicaoProcessada = { data: ultimaMedicao.data, status: severityLevel, asymmetryType };
          }
          const hoje = new Date();
          const dataNascimento = new Date(paciente.data_nascimento);
          const idadeEmMeses = ((hoje.getFullYear() - dataNascimento.getFullYear()) * 12) + (hoje.getMonth() - dataNascimento.getMonth());
          
          // Create an object that matches the Paciente interface
          return { 
            ...paciente,
            dataNascimento: paciente.data_nascimento,
            idadeEmMeses, 
            ultimaMedicao: ultimaMedicaoProcessada 
          } as Paciente;
        });
        setPacientes(pacientesProcessadosParaCard);

      } catch (err) {
        console.error("Erro:", err);
        toast.error("Erro ao carregar dados do dashboard");
      } finally {
        setCarregando(false);
      }
    }
    carregarDados();
  }, [navigate]);
  
  // Helper function to calculate age in months
  const calculateAgeInMonths = (birthDate: string): number => {
    const today = new Date();
    const birth = new Date(birthDate);
    return ((today.getFullYear() - birth.getFullYear()) * 12) + 
           (today.getMonth() - birth.getMonth());
  };

  const pacienteComMedicaoMaisRecente = pacientes.length > 0
    ? [...pacientes]
        .filter(p => p.ultimaMedicao)
        .sort((a, b) => {
          const dataA = a.ultimaMedicao?.data ? new Date(a.ultimaMedicao.data).getTime() : 0;
          const dataB = b.ultimaMedicao?.data ? new Date(b.ultimaMedicao.data).getTime() : 0;
          return dataB - dataA;
        })[0]
    : null;

  const totalPacientesSistema = pacientes.length;
  const totalMedicoesRegistradas = medicoes.length;

  const navegarParaPacientesComFiltro = (filtroStatus: string) => {
    navigate(`/pacientes?status=${filtroStatus}`);
  };

  const formatarDataUltimaMedicao = (dataString?: string) => {
    if (!dataString) return "N/A";
    const data = new Date(dataString);
    const hoje = new Date();
    const ontem = new Date(hoje);
    ontem.setDate(hoje.getDate() - 1);
    if (data.toDateString() === hoje.toDateString()) return "Hoje";
    if (data.toDateString() === ontem.toDateString()) return "Ontem";
    return data.toLocaleDateString("pt-BR");
  };

  if (carregando) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-turquesa" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in p-4 md:p-6">
      <div>
        <h2 className="text-3xl font-bold">Olá, {usuario?.nome.split(" ")[0] || "Doutor(a)"}</h2>
        <p className="text-muted-foreground">
          Bem-vindo(a) de volta ao painel da {clinicaNome}. Confira o resumo dos seus pacientes.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div onClick={() => navigate("/pacientes")} className="cursor-pointer">
          <StatsCard
            title="Total de Pacientes"
            value={totalPacientesSistema}
            description="Ativos no sistema"
            icon={<Users className="h-4 w-4 text-muted-foreground" />}
          />
        </div>
        <div onClick={() => navigate("/historico")} className="cursor-pointer">
          <StatsCard
            title="Total de Medições"
            value={totalMedicoesRegistradas}
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
            value={pacientesAlertaMesAtual} // Valor atualizado
            description={`${percentualPacientesAlerta}% dos pacientes`} // Descrição atualizada
            icon={<AlertTriangle className="h-4 w-4 text-destructive" />}
            trend={trendPacientesAlerta} // Trend atualizada
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
          {pacientes.length > 0 ? (
            pacientes.slice(0,4).map((paciente) => (
              <div key={paciente.id} onClick={() => navigate(`/pacientes/${paciente.id}`)} className="cursor-pointer">
                <PacienteCard paciente={paciente} />
              </div>
            ))
          ) : (
            <div className="col-span-full py-8 text-center text-muted-foreground">
              Nenhum paciente cadastrado. <Link to="/pacientes/registro" className="text-turquesa hover:underline">Adicione um paciente</Link>.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
