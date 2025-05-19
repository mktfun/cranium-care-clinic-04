
import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MedicaoLineChart } from "@/components/MedicaoLineChart";
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
import { useIsMobile } from "@/hooks/use-mobile";
import { MobileReportControls } from "@/components/relatorio/MobileReportControls";
import { cn } from "@/lib/utils";

export default function RelatorioVisualizar() {
  const { id, medicaoId } = useParams<{ id: string, medicaoId: string }>();
  const navigate = useNavigate();
  const [paciente, setPaciente] = useState<any>(null);
  const [medicoes, setMedicoes] = useState<any[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [modoConsolidado, setModoConsolidado] = useState(false);
  const relatorioRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  
  // Estados para controle de zoom e tela cheia
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
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
  
  // Funções para controle de zoom e tela cheia
  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.1, 2));
  };
  
  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.1, 0.5));
  };
  
  const handleResetZoom = () => {
    setZoomLevel(1);
  };
  
  const handleFullscreen = () => {
    setIsFullscreen(prev => !prev);
    
    if (!isFullscreen) {
      // Scroll to top when entering fullscreen
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  
  // Efeito para bloquear scroll da página quando em tela cheia
  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isFullscreen]);
  
  if (carregando) {
    return (
      // ... (código de carregamento existente)
      <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
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
      // ... (código de paciente não encontrado existente)
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
  
  const medicao = medicaoId && !modoConsolidado && medicoes.length > 0
    ? medicoes.find(m => m.id === medicaoId) 
    : (medicoes.length > 0 ? medicoes[0] : null);
  
  const todasMedicoes = modoConsolidado
    ? [...medicoes].sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime())
    : [];
  
  if (!medicao && !modoConsolidado && medicoes.length === 0) {
    return (
      // ... (código de nenhuma medição encontrada existente)
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
  
  const { asymmetryType, severityLevel } = medicao
    ? getCranialStatus(medicao.indice_craniano, medicao.cvai)
    : { asymmetryType: "Normal" as AsymmetryType, severityLevel: "normal" as SeverityLevel };
  
  const handleVoltar = () => {
    if (isFullscreen) {
      setIsFullscreen(false);
      setZoomLevel(1);
    } else {
      navigate(`/pacientes/${id}`);
    }
  };

  const handleToggleModo = () => {
    setModoConsolidado(!modoConsolidado);
  };

  return (
    <div 
      className={cn(
        "animate-fade-in transition-all duration-300 print:p-0",
        isFullscreen 
          ? "fixed inset-0 z-50 bg-background overflow-y-auto" 
          : "space-y-6 max-w-4xl mx-auto print:mx-0 bg-white p-4"
      )}
      style={{
        transform: isMobile ? `scale(${zoomLevel})` : 'none',
        transformOrigin: 'top center'
      }}
    >
      <div 
        ref={relatorioRef} 
        id="relatorio-para-exportar" 
        className={cn(
          isFullscreen ? "pb-16" : ""
        )}
      >
        <RelatorioHeader 
          pacienteNome={paciente.nome}
          idadeAtual={idadeAtual}
          dataFormatada={medicao?.data ? formatarData(medicao.data) : undefined}
          modoConsolidado={modoConsolidado}
          onModoChange={handleToggleModo}
          onVoltar={handleVoltar}
          relatorioElementId="relatorio-para-exportar"
        />
        
        {isMobile && (
          <MobileReportControls 
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onReset={handleResetZoom}
            onFullscreen={handleFullscreen}
            isFullscreen={isFullscreen}
          />
        )}
        
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
            />
          )}
        </div>
        
        {modoConsolidado ? (
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
        ) : medicao ? (
          <ParametrosCraniaisCard 
            dataFormatada={formatarData(medicao.data)}
            comprimento={medicao.comprimento}
            largura={medicao.largura}
            indiceCraniano={medicao.indice_craniano}
            diagonalD={medicao.diagonal_d}
            diagonalE={medicao.diagonal_e}
            diferencaDiagonais={medicao.diferenca_diagonais}
            cvai={medicao.cvai}
            perimetroCefalico={medicao.perimetro_cefalico}
          />
        ) : null}
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Evolução do Índice Craniano</CardTitle>
                <CardDescription>
                  O Índice Craniano mede a proporção entre largura e comprimento do crânio. 
                  Valores acima de 80% indicam tendência à braquicefalia, enquanto valores abaixo de 76% 
                  indicam tendência à dolicocefalia. A área verde representa a faixa de normalidade.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[350px]">
                  <MedicaoLineChart 
                    titulo="" 
                    descricao="" 
                    altura={350} 
                    medicoes={medicoes}
                    dataNascimento={paciente.data_nascimento}
                    tipoGrafico="indiceCraniano"
                    linhaCorTheme="rose"
                  />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Evolução da Plagiocefalia</CardTitle>
                <CardDescription>
                  O índice CVAI (Cranial Vault Asymmetry Index) mede o grau de assimetria craniana.
                  Valores acima de 3.5% indicam assimetria leve, acima de 6.25% moderada, e acima de 8.5% severa.
                  A área verde representa a faixa de normalidade.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[350px]">
                  <MedicaoLineChart 
                    titulo="" 
                    descricao="" 
                    altura={350} 
                    medicoes={medicoes}
                    dataNascimento={paciente.data_nascimento}
                    tipoGrafico="cvai"
                    linhaCorTheme="amber"
                  />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Evolução do Perímetro Cefálico</CardTitle>
                <CardDescription>
                  O perímetro cefálico é o contorno da cabeça medido na altura da testa e da parte 
                  mais protuberante do occipital. As linhas coloridas representam os percentis de referência 
                  para {paciente.sexo === "M" ? "meninos" : "meninas"} da mesma idade,
                  sendo P50 a média populacional.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[350px]">
                  <MedicaoLineChart 
                    titulo="" 
                    descricao="" 
                    altura={350} 
                    medicoes={medicoes}
                    dataNascimento={paciente.data_nascimento}
                    tipoGrafico="perimetro"
                    linhaCorTheme="blue"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {medicao && (
          <RecomendacoesCard 
            recomendacoes={medicao.recomendacoes}
            severityLevel={severityLevel}
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
    </div>
  );
}
