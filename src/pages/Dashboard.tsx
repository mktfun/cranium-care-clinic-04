import { useState, useEffect } from "react";
import { Users, Activity, Calendar, AlertTriangle, Loader2, Plus, Camera } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { StatsCard } from "@/components/StatsCard";
import { MedicaoLineChart } from "@/components/MedicaoLineChart";
import { PacienteCard } from "@/components/PacienteCard";
import { StatusBadge } from "@/components/StatusBadge";
import { PacientesMedicoesChart } from "@/components/PacientesMedicoesChart";
import { UrgentTasksCard } from "@/components/UrgentTasksCard";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Paciente, AsymmetryType, SeverityLevel } from "@/types";
import { getCranialStatus } from "@/lib/cranial-utils";
import { Link } from "react-router-dom";
import { MobileChartView } from "@/components/MobileChartView";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MedicoesPorDiaChart } from "@/components/MedicoesPorDiaChart";
import { PacientesStatusChart } from "@/components/PacientesStatusChart";
import { useIsMobile } from "@/hooks/use-mobile";
import { SelectPatientDialog } from "@/components/SelectPatientDialog";
import { convertSupabasePacienteToPaciente } from "@/lib/patient-utils";
import { ChartFilters } from "@/components/ChartFilters";
import { useChartFilters } from "@/hooks/useChartFilters";
import { useChartType } from "@/hooks/useChartType";

interface TrendData {
  value: number;
  isPositive: boolean;
}

interface PacienteWithMedicao extends Paciente {
  ultimaMedicao?: {
    data: string;
    status: SeverityLevel;
    asymmetryType: AsymmetryType;
  };
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [clinicaNome, setClinicaNome] = useState("CraniumCare");
  const [pacientes, setPacientes] = useState<PacienteWithMedicao[]>([]);
  const [medicoes, setMedicoes] = useState<any[]>([]);
  const [statusDistribuicaoGeral, setStatusDistribuicaoGeral] = useState<{
    normal: number;
    leve: number;
    moderada: number;
    severa: number;
  }>({
    normal: 0,
    leve: 0,
    moderada: 0,
    severa: 0
  });
  const [carregando, setCarregando] = useState(true);
  const [usuario, setUsuario] = useState<{
    nome: string;
  } | null>(null);
  const [pacientesAlertaMesAtual, setPacientesAlertaMesAtual] = useState(0);
  const [trendPacientesAlerta, setTrendPacientesAlerta] = useState<TrendData | undefined>(undefined);
  const [percentualPacientesAlerta, setPercentualPacientesAlerta] = useState(0);
  const isMobile = useIsMobile();
  const [patientDialogOpen, setPatientDialogOpen] = useState(false);

  // Adicionar hook de filtros para o dashboard
  const {
    filters,
    dateRange,
    updateTimePeriod,
    updateMeasurementType,
    updateCustomDateRange,
    resetFilters
  } = useChartFilters();

  // Adicionar hook de tipos de gráfico
  const { getChartType, updateChartType } = useChartType();

  useEffect(() => {
    async function carregarDados() {
      try {
        setCarregando(true);
        const {
          data: {
            session
          }
        } = await supabase.auth.getSession();
        if (!session?.user) {
          navigate("/login");
          return;
        }
        const {
          data: usuarioData
        } = await supabase.from("usuarios").select("nome, clinica_nome").eq("id", session.user.id).single();
        if (usuarioData) {
          setUsuario({
            nome: usuarioData.nome
          });
          if (usuarioData.clinica_nome) {
            setClinicaNome(usuarioData.clinica_nome);
            localStorage.setItem("clinicaNome", usuarioData.clinica_nome);
          } else {
            const savedClinicaNome = localStorage.getItem("clinicaNome");
            if (savedClinicaNome) setClinicaNome(savedClinicaNome);
          }
        }
        const {
          data: pacientesData,
          error: pacientesError
        } = await supabase.from("pacientes").select("*").order("created_at", {
          ascending: false
        });
        if (pacientesError) {
          console.error("Erro ao carregar pacientes:", pacientesError);
          toast.error("Erro ao carregar pacientes");
          return;
        }
        if (!pacientesData) {
          setPacientes([]);
          return;
        }
        const {
          data: medicoesData,
          error: medicoesError
        } = await supabase.from("medicoes").select("*").order("data", {
          ascending: false
        });
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
        const getPacientesEmAlertaNoPeriodo = (meds: any[], inicio: Date, fim: Date): Set<string> => {
          const pacientesEmAlertaSet = new Set<string>();
          meds.forEach(medicao => {
            const dataMedicao = new Date(medicao.data);
            if (dataMedicao >= inicio && dataMedicao <= fim) {
              const {
                severityLevel
              } = getCranialStatus(medicao.indice_craniano || 0, medicao.cvai || 0);
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
        if (medicoesProcessadas.filter(m => new Date(m.data) >= primeiroDiaMesAnterior && new Date(m.data) <= ultimoDiaMesAnterior).length > 0) {
          // Verifica se há dados no mês anterior
          if (numPacientesAlertaMesAnterior > 0) {
            const variacao = (numPacientesAlertaMesAtual - numPacientesAlertaMesAnterior) / numPacientesAlertaMesAnterior * 100;
            setTrendPacientesAlerta({
              value: Math.abs(Math.round(variacao)),
              isPositive: numPacientesAlertaMesAtual < numPacientesAlertaMesAnterior // Melhora = verde (isPositive true)
            });
          } else if (numPacientesAlertaMesAtual > 0) {
            // Mês anterior zerado, mas atual tem alertas
            setTrendPacientesAlerta({
              value: 100,
              // Representa um aumento de 0 para X
              isPositive: false // Piora = vermelho
            });
          } else {
            // Ambos zerados
            setTrendPacientesAlerta(undefined); // Sem variação, não mostra trend
          }
        } else {
          setTrendPacientesAlerta(undefined); // Sem dados do mês anterior, não mostra trend
        }

        // Calcular percentual de pacientes em alerta (em relação ao total de pacientes)
        const totalPacientesSistema = pacientesData?.length || 0;
        if (totalPacientesSistema > 0) {
          setPercentualPacientesAlerta(Math.round(numPacientesAlertaMesAtual / totalPacientesSistema * 100));
        } else {
          setPercentualPacientesAlerta(0);
        }

        // Processar distribuição geral de status
        const distribuicaoGeral = {
          normal: 0,
          leve: 0,
          moderada: 0,
          severa: 0
        };
        const pacientesComMedicaoIds = new Set<string>();
        medicoesProcessadas.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()).forEach(medicao => {
          if (!pacientesComMedicaoIds.has(medicao.paciente_id)) {
            const {
              severityLevel
            } = getCranialStatus(medicao.indice_craniano || 0, medicao.cvai || 0);
            distribuicaoGeral[severityLevel]++;
            pacientesComMedicaoIds.add(medicao.paciente_id);
          }
        });
        setStatusDistribuicaoGeral(distribuicaoGeral);

        // Processar pacientes e suas últimas medições para cards de destaque
        const pacientesProcessados: PacienteWithMedicao[] = pacientesData.map(pacienteRaw => {
          const paciente = convertSupabasePacienteToPaciente(pacienteRaw);
          const medicoesDoPaciente = medicoesProcessadas.filter(m => m.paciente_id === paciente.id).sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
          const ultimaMedicao = medicoesDoPaciente[0];
          let ultimaMedicaoProcessada;
          if (ultimaMedicao) {
            const {
              severityLevel,
              asymmetryType
            } = getCranialStatus(ultimaMedicao.indice_craniano || 0, ultimaMedicao.cvai || 0);
            ultimaMedicaoProcessada = {
              data: ultimaMedicao.data,
              status: severityLevel,
              asymmetryType
            };
          }
          
          return {
            ...paciente,
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

  // Helper function to calculate age in months
  const calculateAgeInMonths = (birthDate: string): number => {
    const today = new Date();
    const birth = new Date(birthDate);
    return (today.getFullYear() - birth.getFullYear()) * 12 + (today.getMonth() - birth.getMonth());
  };
  const pacienteComMedicaoMaisRecente = pacientes.length > 0 ? [...pacientes].filter(p => p.ultimaMedicao).sort((a, b) => {
    const dataA = a.ultimaMedicao?.data ? new Date(a.ultimaMedicao.data).getTime() : 0;
    const dataB = b.ultimaMedicao?.data ? new Date(b.ultimaMedicao.data).getTime() : 0;
    return dataB - dataA;
  })[0] : null;
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

  // Handling quick action selection
  const handleQuickAction = (pacienteId?: string) => {
    if (pacienteId) {
      navigate(`/pacientes/${pacienteId}/medicao-por-foto`);
    } else {
      setPatientDialogOpen(true);
    }
  };

  // Handle selected patient from dialog
  const handlePatientSelected = (pacienteId: string) => {
    navigate(`/pacientes/${pacienteId}/medicao-por-foto`);
  };

  if (carregando) {
    return <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-turquesa" />
      </div>;
  }

  return (
    <div className="space-y-6 animate-fade-in p-4 md:p-6">
      {/* Patient selection dialog */}
      <SelectPatientDialog open={patientDialogOpen} onOpenChange={setPatientDialogOpen} onSelectPatient={handlePatientSelected} />

      <div>
        <h2 className="text-3xl font-bold transition-all duration-300 hover:text-primary">Olá, {usuario?.nome.split(" ")[0] || "Doutor(a)"}</h2>
        <p className="text-muted-foreground">
          Bem-vindo(a) de volta ao painel da {clinicaNome}. Confira o resumo dos seus pacientes.
        </p>
      </div>

      {/* Quick Actions Section */}
      <Card className="mb-6 border-primary/10 hover:border-primary/30 transition-all duration-300 group">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium group-hover:text-primary/90 transition-colors">Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => navigate('/pacientes/registro')} className="bg-turquesa hover:bg-turquesa/90 transition-all duration-300 hover:shadow-md transform hover:translate-y-[-2px]">
              <Plus className="h-4 w-4 mr-2" />
              Novo Paciente
            </Button>
            <Button onClick={() => handleQuickAction()} variant="outline" className="transition-all duration-300 hover:border-primary/60 hover:bg-primary/5">
              <Camera className="h-4 w-4 mr-2" />
              Nova Medição
            </Button>
            <Button onClick={() => navigate('/historico')} variant="outline" className="transition-all duration-300 hover:border-primary/60 hover:bg-primary/5">
              Ver Histórico
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards - Responsive Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div onClick={() => navigate("/pacientes")} className="cursor-pointer">
          <StatsCard title="Total de Pacientes" value={totalPacientesSistema} description="Ativos no sistema" icon={<Users className="h-4 w-4 text-muted-foreground" />} />
        </div>
        <div onClick={() => navigate("/historico")} className="cursor-pointer">
          <StatsCard title="Total de Medições" value={totalMedicoesRegistradas} description="Registradas no sistema" icon={<Activity className="h-4 w-4 text-muted-foreground" />} />
        </div>
        <div onClick={() => pacienteComMedicaoMaisRecente ? navigate(`/pacientes/${pacienteComMedicaoMaisRecente.id}`) : null} className={pacienteComMedicaoMaisRecente ? "cursor-pointer" : ""}>
          <StatsCard title="Última Avaliação" value={pacienteComMedicaoMaisRecente ? formatarDataUltimaMedicao(pacienteComMedicaoMaisRecente.ultimaMedicao?.data) : "N/A"} description={pacienteComMedicaoMaisRecente?.nome || "Nenhum paciente avaliado"} icon={<Calendar className="h-4 w-4 text-muted-foreground" />} />
        </div>
        <div onClick={() => navegarParaPacientesComFiltro("alerta")} className="cursor-pointer">
          <StatsCard title="Pacientes em Alerta" value={pacientesAlertaMesAtual} description={`${percentualPacientesAlerta}% dos pacientes`} icon={<AlertTriangle className="h-4 w-4 text-destructive" />} trend={trendPacientesAlerta} />
        </div>
      </div>

      {/* Filtros para Desktop - Apenas quando não mobile */}
      {!isMobile && (
        <ChartFilters
          timePeriod={filters.timePeriod}
          onTimePeriodChange={updateTimePeriod}
          measurementType={filters.measurementType}
          onMeasurementTypeChange={updateMeasurementType}
          showMeasurementFilter={true}
          customDateRange={filters.customDateRange}
          onCustomDateRangeChange={updateCustomDateRange}
          showCustomDateRange={true}
          onResetFilters={resetFilters}
        />
      )}

      {/* Charts Section - Simplified Layout without Status Chart */}
      {!isMobile && (
        <div className="grid gap-6 lg:grid-cols-3 mt-6">
          {/* Main chart takes more space */}
          <div className="lg:col-span-2">
            <PacientesMedicoesChart 
              altura={350} 
              dateRange={dateRange}
              measurementType={filters.measurementType}
              chartType={getChartType("pacientesMedicoes")}
              onChartTypeChange={(type) => updateChartType("pacientesMedicoes", type)}
            />
          </div>
          
          {/* Single side chart */}
          <div className="lg:col-span-1">
            <MedicoesPorDiaChart 
              altura={350}
              dateRange={dateRange}
              measurementType={filters.measurementType}
              chartType={getChartType("medicoesPorDia")}
              onChartTypeChange={(type) => updateChartType("medicoesPorDia", type)}
            />
          </div>
        </div>
      )}

      {/* Mobile Chart View */}
      {isMobile && (
        <div className="mt-6">
          <MobileChartView />
        </div>
      )}

      {/* Main Layout with Patients and Tasks */}
      <div className="grid gap-6 lg:grid-cols-3 mt-6">
        {/* Featured Patients Section - Takes 2/3 of the space */}
        <div className="lg:col-span-2">
          <h3 className="text-lg font-medium mb-4 transition-colors hover:text-primary/90">Pacientes em Destaque</h3>
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            {pacientes.length > 0 ? pacientes.slice(0, 2).map(paciente => <div key={paciente.id} onClick={() => navigate(`/pacientes/${paciente.id}`)} className="cursor-pointer">
                  <PacienteCard paciente={{
                    id: paciente.id,
                    nome: paciente.nome,
                    dataNascimento: paciente.dataNascimento || paciente.data_nascimento,
                    idadeEmMeses: paciente.idadeEmMeses || 0,
                    ultimaMedicao: paciente.ultimaMedicao
                  }} />
                </div>) : <div className="col-span-full py-8 text-center text-muted-foreground">
                Nenhum paciente cadastrado. <Link to="/pacientes/registro" className="text-turquesa hover:underline">Adicione um paciente</Link>.
              </div>}
          </div>
        </div>

        {/* Urgent Tasks Section - Takes 1/3 of the space */}
        <div className="lg:col-span-1">
          <UrgentTasksCard />
        </div>
      </div>
    </div>
  );
}
