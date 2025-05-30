import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { formatAge } from "@/lib/age-utils";
import { AsymmetryType, SeverityLevel, getCranialStatus } from "@/lib/cranial-utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RelatorioHeader } from "@/components/relatorio/RelatorioHeader";
import { PacienteDadosCard } from "@/components/relatorio/PacienteDadosCard";
import { ResumoAvaliacaoCard } from "@/components/relatorio/ResumoAvaliacaoCard";
import { MedicoesHistoricoTable } from "@/components/relatorio/MedicoesHistoricoTable";
import { ParametrosCraniaisCard } from "@/components/relatorio/ParametrosCraniaisCard";
import { RecomendacoesCard } from "@/components/relatorio/RecomendacoesCard";
import { RelatorioFooter } from "@/components/relatorio/RelatorioFooter";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useIsMobileOrTabletPortrait } from "@/hooks/use-media-query";
import CranialVisualizationCard from "@/components/relatorio/CranialVisualizationCard";
import { MedicaoExportUtils } from "@/components/export/MedicaoExportUtils";

export default function RelatorioVisualizar() {
  const { id, medicaoId } = useParams<{ id: string, medicaoId: string }>();
  const navigate = useNavigate();
  const [paciente, setPaciente] = useState<any>(null);
  const [medicoes, setMedicoes] = useState<any[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [modoConsolidado, setModoConsolidado] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const relatorioRef = useRef<HTMLDivElement>(null);
  const isMobileOrTablet = useIsMobileOrTabletPortrait();
  
  useEffect(() => {
    async function fetchPacienteData() {
      try {
        setCarregando(true);
        
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          toast.error("Sessão expirada. Faça login novamente.");
          navigate("/login");
          return;
        }
        
        const { data: pacienteData, error: pacienteError } = await supabase
          .from("pacientes")
          .select("*")
          .eq("id", id)
          .single();
        
        if (pacienteError || !pacienteData) {
          toast.error("Erro ao carregar dados do paciente: " + pacienteError?.message);
          navigate("/pacientes");
          return;
        }
        
        const { data: medicoesData, error: medicoesError } = await supabase
          .from("medicoes")
          .select("*")
          .eq("paciente_id", id)
          .order("data", { ascending: false });
        
        if (medicoesError) {
          toast.error("Erro ao carregar medições: " + medicoesError.message);
        }
        
        setPaciente(pacienteData);
        setMedicoes(medicoesData || []);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        toast.error("Ocorreu um erro ao carregar os dados");
      } finally {
        setCarregando(false);
      }
    }
    
    fetchPacienteData();
  }, [id, navigate]);
  
  const handleExportPDF = async (includeCharts: boolean = false) => {
    if (!paciente || !medicao) return;
    
    setExportLoading(true);
    try {
      await MedicaoExportUtils.exportToPDF(
        medicao, 
        paciente, 
        includeCharts ? medicoes : [],
        medicao.recomendacoes || [],
        { nome: "CraniumCare Clinic", profissional: "Médico Responsável" },
        includeCharts
      );
      toast.success("PDF gerado com sucesso!");
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      toast.error("Erro ao gerar PDF. Tente novamente.");
    } finally {
      setExportLoading(false);
    }
  };
  
  if (carregando) {
    return (
      <div className="space-y-6 animate-fade-in max-w-7xl mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
        <Skeleton className="h-60 w-full" />
        <Skeleton className="h-60 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }
  
  if (!paciente) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-12">
        <p className="text-lg mb-4">Paciente não encontrado</p>
        <button 
          onClick={() => navigate("/pacientes")}
          className="px-4 py-2 bg-turquesa text-white rounded hover:bg-turquesa/90"
        >
          Voltar para Lista de Pacientes
        </button>
      </div>
    );
  }
  
  const handleRecomendacoesUpdated = (novasRecomendacoes: string[]) => {
    setMedicoes(prev => prev.map(m => 
      m.id === medicaoId ? { ...m, recomendacoes: novasRecomendacoes } : m
    ));
  };
  
  const medicao = medicaoId && !modoConsolidado && medicoes.length > 0
    ? medicoes.find(m => m.id === medicaoId) 
    : (medicoes.length > 0 ? medicoes[0] : null);
  
  const todasMedicoes = modoConsolidado
    ? [...medicoes].sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime())
    : [];
  
  if (!medicao && !modoConsolidado && medicoes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-12">
        <p className="text-lg mb-4">Nenhuma medição encontrada para este paciente</p>
        <button 
          onClick={() => navigate(`/pacientes/${id}`)}
          className="px-4 py-2 bg-turquesa text-white rounded hover:bg-turquesa/90"
        >
          Voltar para Detalhes do Paciente
        </button>
      </div>
    );
  }
  
  const formatarData = (dataString: string) => {
    const data = new Date(dataString);
    return data.toLocaleDateString("pt-BR");
  };
  
  const idadeAtual = formatAge(paciente.data_nascimento);
  
  const calculateAgeInMonths = (birthDate: string, measurementDate?: string): number => {
    const birth = new Date(birthDate);
    const measurement = measurementDate ? new Date(measurementDate) : new Date();
    return (measurement.getFullYear() - birth.getFullYear()) * 12 + (measurement.getMonth() - birth.getMonth());
  };
  
  const cranialStatusInfo = medicao
    ? getCranialStatus(
        medicao.indice_craniano, 
        medicao.cvai,
        calculateAgeInMonths(paciente.data_nascimento, medicao.data)
      )
    : { 
        asymmetryType: "Normal" as AsymmetryType, 
        severityLevel: "normal" as SeverityLevel,
        diagnosis: {
          type: "Normal" as const,
          severity: "normal" as const,
          diagnosis: "Normal"
        },
        individualClassifications: {
          plagiocefalia: "normal" as const,
          braquicefalia: "normal" as const,
          dolicocefalia: "normal" as const
        },
        choaClassification: {
          level: 1 as const,
          clinicalPresentation: "Simetria dentro dos limites normais",
          recommendation: "Nenhum tratamento necessário",
          cvaiRange: "< 3,5%",
          severity: "normal" as const,
          needsTreatment: false,
          urgency: "none" as const
        },
        choaRecommendations: [],
        choaDiagnosis: "Desenvolvimento craniano normal"
      };
  
  const { 
    asymmetryType, 
    severityLevel, 
    diagnosis, 
    individualClassifications,
    choaClassification,
    choaRecommendations,
    choaDiagnosis 
  } = cranialStatusInfo;
  
  const handleVoltar = () => {
    navigate(`/pacientes/${id}`);
  };

  const handleToggleModo = () => {
    setModoConsolidado(!modoConsolidado);
  };

  const hasHistoricalData = medicoes.length > 1;

  return (
    <div 
      ref={relatorioRef} 
      id="relatorio-para-exportar" 
      className="space-y-6 animate-fade-in max-w-7xl mx-auto print:mx-0 bg-background px-4 sm:px-6 lg:px-8 py-4 print:p-0"
    >
      <RelatorioHeader 
        pacienteNome={paciente.nome}
        idadeAtual={idadeAtual}
        dataFormatada={medicao?.data ? formatarData(medicao.data) : undefined}
        modoConsolidado={modoConsolidado}
        onModoChange={handleToggleModo}
        onVoltar={handleVoltar}
        onExportPDF={!modoConsolidado && medicao ? () => handleExportPDF(false) : undefined}
        onExportPDFWithCharts={!modoConsolidado && medicao && hasHistoricalData ? () => handleExportPDF(true) : undefined}
        exportLoading={exportLoading}
      />
      
      <div className="grid gap-6 md:grid-cols-2">
        <PacienteDadosCard 
          nome={paciente.nome}
          idadeAtual={idadeAtual}
          dataNascimentoFormatada={formatarData(paciente.data_nascimento)}
          sexo={paciente.sexo}
        />
        
        {!modoConsolidado && medicao && (
          <ResumoAvaliacaoCard 
            dataFormatada={formatarData(medicao.data)}
            idadeNaAvaliacao={formatAge(paciente.data_nascimento, medicao.data)}
            severityLevel={severityLevel}
            asymmetryType={asymmetryType}
            diagnosis={diagnosis}
            choaClassification={choaClassification}
          />
        )}
      </div>

      {!modoConsolidado && medicao && (
        <CranialVisualizationCard
          medicao={medicao}
          medicoes={medicoes}
          asymmetryType={asymmetryType}
          severity={severityLevel}
          sexoPaciente={paciente.sexo}
          diagnosis={diagnosis}
          individualClassifications={individualClassifications}
          dataNascimento={paciente.data_nascimento}
        />
      )}
      
      {modoConsolidado && (
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Medições</CardTitle>
            <CardDescription>Evolução cronológica das avaliações</CardDescription>
          </CardHeader>
          <CardContent>
            <MedicoesHistoricoTable 
              medicoes={todasMedicoes}
              dataNascimento={paciente.data_nascimento}
            />
          </CardContent>
        </Card>
      )}
      
      {medicao && (
        <RecomendacoesCard 
          recomendacoes={medicao.recomendacoes}
          severityLevel={severityLevel}
          isReadOnly={false}
          medicaoId={medicao.id}
          onRecomendacoesUpdated={handleRecomendacoesUpdated}
          choaClassification={choaClassification}
          choaRecommendations={choaRecommendations}
        />
      )}
      
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Medições</CardTitle>
          <CardDescription>Todas as medições realizadas para este paciente</CardDescription>
        </CardHeader>
        <CardContent>
          <MedicoesHistoricoTable 
            medicoes={medicoes}
            dataNascimento={paciente.data_nascimento}
          />
        </CardContent>
      </Card>
      
      <RelatorioFooter onVoltar={handleVoltar} />
    </div>
  );
}
