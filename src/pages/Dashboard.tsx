
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
import { useIndependentChartFilters } from "@/hooks/useIndependentChartFilters";
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

interface FilteredStats {
  totalPacientes: number;
  totalMedicoes: number;
  pacientesAlerta: number;
  percentualAlerta: number;
  trendAlerta?: TrendData;
  ultimaAvaliacao?: {
    data: string;
    pacienteNome: string;
  };
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [clinicaNome, setClinicaNome] = useState("CraniumCare");
  const [pacientes, setPacientes] = useState<PacienteWithMedicao[]>([]);
  const [medicoes, setMedicoes] = useState<any[]>([]);
  const [filteredStats, setFilteredStats] = useState<FilteredStats>({
    totalPacientes: 0,
    totalMedicoes: 0,
    pacientesAlerta: 0,
    percentualAlerta: 0
  });
  const [carregando, setCarregando] = useState(true);
  const [usuario, setUsuario] = useState<{
    nome: string;
  } | null>(null);
  const isMobile = useIsMobile();
  const [patientDialogOpen, setPatientDialogOpen] = useState(false);

  // Hooks independentes para cada gráfico
  const {
    filters: pacientesMedicoesFilters,
    dateRange: pacientesMedicoesDateRange,
    updateTimePeriod: updatePacientesMedicoesTimePeriod,
    updateMeasurementType: updatePacientesMedicoesMeasurementType,
    updateCustomDateRange: updatePacientesMedicoesCustomDateRange,
    resetFilters: resetPacientesMedicoesFilters
  } = useIndependentChartFilters("6months");

  const {
    filters: medicoesPorDiaFilters,
    dateRange: medicoesPorDiaDateRange,
    updateTimePeriod: updateMedicoesPorDiaTimePeriod,
    updateMeasurementType: updateMedicoesPorDiaMeasurementType,
    updateCustomDateRange: updateMedicoesPorDiaCustomDateRange,
    resetFilters: resetMedicoesPorDiaFilters
  } = useIndependentChartFilters("7days");

  const { getChartType, updateChartType } = useChartType();

  // Função para calcular estatísticas filtradas
  const calculateFilteredStats = (
    allPacientes: any[],
    allMedicoes: any[],
    dateRange: { startDate: string; endDate: string }
  ): FilteredStats => {
    const startDate = new Date(dateRange.startDate);
    const endDate = new Date(dateRange.endDate);
    
    // Filtrar pacientes criados no período
    const pacientesFiltrados = allPacientes.filter(p => {
      const dataCriacao = new Date(p.created_at);
      return dataCriacao >= startDate && dataCriacao <= endDate;
    });

    // Filtrar medições no período
    const medicoesFiltradas = allMedicoes.filter(m => {
      const dataMedicao = new Date(m.data);
      return dataMedicao >= startDate && dataMedicao <= endDate;
    });

    // Calcular pacientes em alerta no período
    const pacientesEmAlertaSet = new Set<string>();
    medicoesFiltradas.forEach(medicao => {
      const { severityLevel } = getCranialStatus(medicao.indice_craniano || 0, medicao.cvai || 0);
      if (severityLevel === "moderada" || severityLevel === "severa") {
        pacientesEmAlertaSet.add(medicao.paciente_id);
      }
    });

    const numPacientesAlerta = pacientesEmAlertaSet.size;
    const totalPacientesPeriodo = pacientesFiltrados.length;
    const percentualAlerta = totalPacientesPeriodo > 0 ? Math.round((numPacientesAlerta / totalPacientesPeriodo) * 100) : 0;

    // Encontrar última avaliação no período
    const medicaoMaisRecente = medicoesFiltradas
      .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())[0];
    
    let ultimaAvaliacao;
    if (medicaoMaisRecente) {
      const paciente = allPacientes.find(p => p.id === medicaoMaisRecente.paciente_id);
      ultimaAvaliacao = {
        data: medicaoMaisRecente.data,
        pacienteNome: paciente?.nome || "Paciente desconhecido"
      };
    }

    return {
      totalPacientes: totalPacientesPeriodo,
      totalMedicoes: medicoesFiltradas.length,
      pacientesAlerta: numPacientesAlerta,
      percentualAlerta,
      ultimaAvaliacao
    };
  };

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

        if (!pacientesData) {
          setPacientes([]);
          return;
        }

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

        // Processar pacientes com suas últimas medições para cards de destaque
        const pacientesProcessados: PacienteWithMedicao[] = pacientesData.map(pacienteRaw => {
          const paciente = convertSupabasePacienteToPaciente(pacienteRaw);
          const medicoesDoPaciente = medicoesProcessadas
            .filter(m => m.paciente_id === paciente.id)
            .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
          
          const ultimaMedicao = medicoesDoPaciente[0];
          let ultimaMedicaoProcessada;
          
          if (ultimaMedicao) {
            const { severityLevel, asymmetryType } = getCranialStatus(
              ultimaMedicao.indice_craniano || 0, 
              ultimaMedicao.cvai || 0
            );
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

  // Recalcular estatísticas quando o filtro do gráfico muda
  useEffect(() => {
    if (pacientes.length > 0 && medicoes.length > 0) {
      const stats = calculateFilteredStats(pacientes, medicoes, pacientesMedicoesDateRange);
      setFilteredStats(stats);
    }
  }, [pacientes, medicoes, pacientesMedicoesDateRange]);

  // Helper function to calculate age in months
  const calculateAgeInMonths = (birthDate: string): number => {
    const today = new Date();
    const birth = new Date(birthDate);
    return (today.getFullYear() - birth.getFullYear()) * 12 + (today.getMonth() - birth.getMonth());
  };

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
            <Button onClick={() => navigate('/pacientes/novo')} className="bg-turquesa hover:bg-turquesa/90 transition-all duration-300 hover:shadow-md transform hover:translate-y-[-2px]">
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

      {/* Stats Cards - Responsive Grid com valores filtrados */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div onClick={() => navigate("/pacientes")} className="cursor-pointer">
          <StatsCard 
            title="Pacientes no Período" 
            value={filteredStats.totalPacientes} 
            description="Cadastrados no período selecionado" 
            icon={<Users className="h-4 w-4 text-muted-foreground" />} 
          />
        </div>
        <div onClick={() => navigate("/historico")} className="cursor-pointer">
          <StatsCard 
            title="Medições no Período" 
            value={filteredStats.totalMedicoes} 
            description="Realizadas no período selecionado" 
            icon={<Activity className="h-4 w-4 text-muted-foreground" />} 
          />
        </div>
        <div onClick={() => filteredStats.ultimaAvaliacao ? navigate(`/historico`) : null} className={filteredStats.ultimaAvaliacao ? "cursor-pointer" : ""}>
          <StatsCard 
            title="Última Avaliação" 
            value={filteredStats.ultimaAvaliacao ? formatarDataUltimaMedicao(filteredStats.ultimaAvaliacao.data) : "N/A"} 
            description={filteredStats.ultimaAvaliacao?.pacienteNome || "Nenhuma avaliação no período"} 
            icon={<Calendar className="h-4 w-4 text-muted-foreground" />} 
          />
        </div>
        <div onClick={() => navegarParaPacientesComFiltro("alerta")} className="cursor-pointer">
          <StatsCard 
            title="Pacientes em Alerta" 
            value={filteredStats.pacientesAlerta} 
            description={`${filteredStats.percentualAlerta}% no período`} 
            icon={<AlertTriangle className="h-4 w-4 text-destructive" />} 
            trend={filteredStats.trendAlerta} 
          />
        </div>
      </div>

      {/* Charts Section - GRÁFICOS COM FILTROS INDEPENDENTES */}
      {!isMobile && (
        <div className="space-y-6 mt-6">
          {/* "Evolução de Pacientes e Medições" - PRIMEIRO (EM CIMA) */}
          <div>
            <ChartFilters
              timePeriod={pacientesMedicoesFilters.timePeriod}
              onTimePeriodChange={updatePacientesMedicoesTimePeriod}
              measurementType={pacientesMedicoesFilters.measurementType}
              onMeasurementTypeChange={updatePacientesMedicoesMeasurementType}
              showMeasurementFilter={true}
              customDateRange={pacientesMedicoesFilters.customDateRange}
              onCustomDateRangeChange={updatePacientesMedicoesCustomDateRange}
              showCustomDateRange={true}
              onResetFilters={resetPacientesMedicoesFilters}
            />
            <PacientesMedicoesChart 
              altura={350}
              dateRange={pacientesMedicoesDateRange}
              measurementType={pacientesMedicoesFilters.measurementType}
              chartType={getChartType("pacientesMedicoes")}
              onChartTypeChange={(type) => updateChartType("pacientesMedicoes", type)}
            />
          </div>
          
          {/* "Medições Realizadas no Período" - SEGUNDO (EMBAIXO) */}
          <div>
            <ChartFilters
              timePeriod={medicoesPorDiaFilters.timePeriod}
              onTimePeriodChange={updateMedicoesPorDiaTimePeriod}
              measurementType={medicoesPorDiaFilters.measurementType}
              onMeasurementTypeChange={updateMedicoesPorDiaMeasurementType}
              showMeasurementFilter={true}
              customDateRange={medicoesPorDiaFilters.customDateRange}
              onCustomDateRangeChange={updateMedicoesPorDiaCustomDateRange}
              showCustomDateRange={true}
              onResetFilters={resetMedicoesPorDiaFilters}
            />
            <MedicoesPorDiaChart 
              altura={350} 
              dateRange={medicoesPorDiaDateRange}
              measurementType={medicoesPorDiaFilters.measurementType}
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
            {pacientes.length > 0 ? pacientes.slice(0, 2).map(paciente => 
              <div key={paciente.id} onClick={() => navigate(`/pacientes/${paciente.id}`)} className="cursor-pointer">
                <PacienteCard paciente={{
                  id: paciente.id,
                  nome: paciente.nome,
                  dataNascimento: paciente.dataNascimento || paciente.data_nascimento,
                  idadeEmMeses: paciente.idadeEmMeses || 0,
                  ultimaMedicao: paciente.ultimaMedicao
                }} />
              </div>
            ) : (
              <div className="col-span-full py-8 text-center text-muted-foreground">
                Nenhum paciente cadastrado. <Link to="/pacientes/registro" className="text-turquesa hover:underline">Adicione um paciente</Link>.
              </div>
            )}
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
