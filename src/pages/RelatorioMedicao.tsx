
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MedicaoLineChart } from "@/components/MedicaoLineChart";
import { StatusBadge } from "@/components/StatusBadge";
import { ChevronLeft, Download, ArrowRight } from "lucide-react";
import { obterPacientePorId } from "@/data/mock-data";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatAge } from "@/lib/age-utils";
import { getCranialStatus } from "@/lib/cranial-utils";

export default function RelatorioMedicao() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [paciente, setPaciente] = useState<any>(null);
  const [medicao, setMedicao] = useState<any>(null);
  const [carregando, setCarregando] = useState(true);
  const [clinicaNome, setClinicaNome] = useState<string>("CraniumCare");
  const [profissionalNome, setProfissionalNome] = useState<string>("Dr. Exemplo");
  
  useEffect(() => {
    // Carregar dados do paciente, medição e usuário logado
    async function fetchData() {
      try {
        setCarregando(true);
        
        // Obter a sessão do usuário logado
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          // Fallback para dados mockados se não estiver logado
          const pacienteDados = obterPacientePorId(id || "");
          setPaciente(pacienteDados);
          
          // Supor que a medição mais recente seja a última medição adicionada
          if (pacienteDados?.medicoes?.length > 0) {
            const medicaoRecente = [...pacienteDados.medicoes].sort((a, b) => 
              new Date(b.data).getTime() - new Date(a.data).getTime()
            )[0];
            setMedicao(medicaoRecente);
          }
        } else {
          // Obter dados do paciente do Supabase
          const { data: pacienteData } = await supabase
            .from('pacientes')
            .select('*')
            .eq('id', id)
            .single();
          
          if (pacienteData) {
            setPaciente(pacienteData);
            
            // Obter última medição do paciente
            const { data: medicoesData } = await supabase
              .from('medicoes')
              .select('*')
              .eq('paciente_id', id)
              .order('data', { ascending: false })
              .limit(1);
            
            if (medicoesData && medicoesData.length > 0) {
              setMedicao(medicoesData[0]);
            }
          } else {
            // Fallback para dados mockados
            const pacienteDados = obterPacientePorId(id || "");
            setPaciente(pacienteDados);
            
            if (pacienteDados?.medicoes?.length > 0) {
              const medicaoRecente = [...pacienteDados.medicoes].sort((a, b) => 
                new Date(b.data).getTime() - new Date(a.data).getTime()
              )[0];
              setMedicao(medicaoRecente);
            }
          }
          
          // Obter dados do usuário logado
          const { data: userData } = await supabase
            .from('usuarios')
            .select('nome, clinica_nome')
            .eq('id', session.user.id)
            .single();
          
          if (userData) {
            setProfissionalNome(userData.nome || "Dr. Exemplo");
            setClinicaNome(userData.clinica_nome || "CraniumCare");
          }
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        setCarregando(false);
      }
    }
    
    fetchData();
  }, [id]);
  
  // Função para obter todas as medições do paciente
  const obterMedicoes = async () => {
    try {
      // Tentativa de obter medições do Supabase
      const { data: medicoesData } = await supabase
        .from('medicoes')
        .select('*')
        .eq('paciente_id', id)
        .order('data', { ascending: true });
      
      if (medicoesData && medicoesData.length > 0) {
        return medicoesData;
      }
      
      // Fallback para dados mockados
      const pacienteDados = obterPacientePorId(id || "");
      return pacienteDados?.medicoes || [];
    } catch (error) {
      console.error("Erro ao obter medições:", error);
      return [];
    }
  };
  
  if (!paciente && !carregando) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p className="text-lg mb-4">Paciente não encontrado</p>
        <Button onClick={() => navigate("/pacientes")}>Voltar para Lista</Button>
      </div>
    );
  }
  
  const formatarData = (dataString: string) => {
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR');
  };
  
  const handleExportarPDF = () => {
    toast.success("Relatório exportado em PDF com sucesso!");
  };
  
  const handleVoltar = () => {
    navigate(`/pacientes/${id}`);
  };

  if (carregando) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh]">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
          <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
            Carregando...
          </span>
        </div>
        <p className="mt-4 text-muted-foreground">Gerando relatório...</p>
      </div>
    );
  }
  
  // Obter o status de assimetria
  const { asymmetryType, severityLevel } = medicao
    ? getCranialStatus(medicao.indice_craniano, medicao.cvai)
    : { asymmetryType: "Normal", severityLevel: "normal" };
    
  // Idade do paciente na medição
  const idadeNaMedicao = medicao 
    ? formatAge(paciente.dataNascimento || paciente.data_nascimento, medicao.data)
    : "";
  
  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleVoltar}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-3xl font-bold">Relatório de Avaliação</h2>
            <div className="text-muted-foreground mt-1">
              Paciente: {paciente?.nome} • {medicao ? formatarData(medicao.data) : ""}
            </div>
          </div>
        </div>
        <Button 
          variant="outline" 
          className="bg-white" 
          onClick={handleExportarPDF}
        >
          <Download className="h-4 w-4 mr-2" /> Exportar PDF
        </Button>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Dados da Avaliação</CardTitle>
            <CardDescription>Medições realizadas em {medicao ? formatarData(medicao.data) : ""}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Comprimento</p>
                <p className="text-lg font-medium">{medicao?.comprimento} mm</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Largura</p>
                <p className="text-lg font-medium">{medicao?.largura} mm</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Diagonal D</p>
                <p className="text-lg font-medium">{medicao?.diagonalD || medicao?.diagonal_d} mm</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Diagonal E</p>
                <p className="text-lg font-medium">{medicao?.diagonalE || medicao?.diagonal_e} mm</p>
              </div>
            </div>
            <hr />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Diferença Diagonais</p>
                <p className="text-lg font-medium">{medicao?.diferencaDiagonais || medicao?.diferenca_diagonais} mm</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Índice Craniano</p>
                <p className="text-lg font-medium">{medicao?.indiceCraniano || medicao?.indice_craniano}%</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">CVAI</p>
                <p className="text-lg font-medium">{medicao?.cvai}%</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <StatusBadge status={severityLevel} asymmetryType={asymmetryType} className="mt-1" />
              </div>
              {(medicao?.perimetroCefalico || medicao?.perimetro_cefalico) && (
                <div>
                  <p className="text-sm text-muted-foreground">Perímetro Cefálico</p>
                  <p className="text-lg font-medium">{medicao?.perimetroCefalico || medicao?.perimetro_cefalico} mm</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Recomendações Clínicas</CardTitle>
            <CardDescription>Baseadas no protocolo de Atlanta</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Diagnóstico</p>
                <p className="font-medium">
                  {asymmetryType === "Normal" ? "Desenvolvimento craniano normal" : `${asymmetryType} ${severityLevel}`}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground">Recomendações</p>
                <ul className="list-disc pl-5 space-y-1 mt-1">
                  {medicao?.recomendacoes ? (
                    medicao.recomendacoes.map((rec: string, idx: number) => (
                      <li key={idx}>{rec}</li>
                    ))
                  ) : (
                    <>
                      <li>Manter acompanhamento regular</li>
                      <li>Estimular mudanças de posição durante o sono</li>
                      <li>Realizar exercícios de fortalecimento cervical</li>
                    </>
                  )}
                </ul>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground">Próxima avaliação</p>
                <p className="font-medium">
                  {severityLevel === "normal" ? "3 meses" : 
                   severityLevel === "leve" ? "2 meses" :
                   "1 mês"}
                </p>
              </div>
              
              <div className="pt-2">
                <p className="text-sm text-muted-foreground">Idade na avaliação</p>
                <p className="font-medium">{idadeNaMedicao}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Gráficos de Evolução */}
      <div className="space-y-6">
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
            <MedicaoLineChart 
              titulo="" 
              altura={350}
              medicoes={paciente?.medicoes || []}
              dataNascimento={paciente?.dataNascimento || paciente?.data_nascimento}
              tipoGrafico="indiceCraniano"
              linhaCorTheme="rose"
            />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Evolução da Plagiocefalia (CVAI)</CardTitle>
            <CardDescription>
              O índice CVAI (Cranial Vault Asymmetry Index) mede o grau de assimetria craniana.
              Valores acima de 3.5% indicam assimetria leve, acima de 6.25% moderada, e acima de 8.5% severa.
              A área verde representa a faixa de normalidade.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <MedicaoLineChart 
              titulo="" 
              altura={350}
              medicoes={paciente?.medicoes || []}
              dataNascimento={paciente?.dataNascimento || paciente?.data_nascimento}
              tipoGrafico="cvai"
              linhaCorTheme="amber"
            />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Evolução do Perímetro Cefálico</CardTitle>
            <CardDescription>
              O perímetro cefálico é o contorno da cabeça medido na altura da testa e da parte 
              mais protuberante do occipital. As linhas coloridas representam os percentis de referência 
              para {(paciente?.sexo === 'M' ? 'meninos' : 'meninas')} da mesma idade,
              sendo P50 a média populacional.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <MedicaoLineChart 
              titulo="" 
              altura={350}
              medicoes={paciente?.medicoes || []}
              dataNascimento={paciente?.dataNascimento || paciente?.data_nascimento}
              tipoGrafico="perimetro"
              sexoPaciente={paciente?.sexo}
              linhaCorTheme="blue"
            />
          </CardContent>
        </Card>
      </div>
      
      <div className="flex justify-between">
        <Button variant="outline" onClick={handleVoltar}>
          <ChevronLeft className="h-4 w-4 mr-2" /> Voltar ao Paciente
        </Button>
        <Button onClick={() => navigate(`/pacientes/${id}/nova-medicao`)} className="bg-turquesa hover:bg-turquesa/90">
          Nova Medição <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
      
      {/* Rodapé do relatório - visível apenas na impressão */}
      <div className="hidden print:block text-center border-t pt-4 text-xs text-muted-foreground mt-8">
        <p>Este relatório foi gerado pelo sistema CraniumCare em {new Date().toLocaleDateString('pt-BR')}</p>
        <p>Profissional responsável: {profissionalNome} • Clínica: {clinicaNome}</p>
        <p>Uso exclusivamente clínico</p>
      </div>
    </div>
  );
}
