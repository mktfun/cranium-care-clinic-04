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
import { ChevronLeft, Download, ArrowRight, Loader2 } from "lucide-react"; // Adicionado Loader2
// import { obterPacientePorId } from "@/data/mock-data"; // Mock data import removido
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatAge } from "@/lib/age-utils";
import { getCranialStatus, SeverityLevel, AsymmetryType } from "@/lib/cranial-utils";

// Definindo interfaces para os dados, se não existirem globalmente
interface Paciente {
  id: string;
  nome: string;
  data_nascimento: string; // Mantido como string, pois é assim que vem do Supabase
  sexo: "M" | "F";
  // Adicionar outros campos conforme necessário
}

interface Medicao {
  id: string;
  paciente_id: string;
  data: string; // Mantido como string
  comprimento: number;
  largura: number;
  diagonal_d: number;
  diagonal_e: number;
  perimetro_cefalico?: number; // Opcional, pois pode não estar em todas as medições antigas
  indice_craniano: number;
  diferenca_diagonais: number;
  cvai: number;
  status: SeverityLevel;
  recomendacoes?: string[];
  // Adicionar outros campos conforme necessário
}

interface Usuario {
  nome?: string;
  clinica_nome?: string;
}

export default function RelatorioMedicao() {
  const { id: pacienteId, medicaoId } = useParams<{ id: string; medicaoId?: string }>(); // id é pacienteId
  const navigate = useNavigate();
  const [paciente, setPaciente] = useState<Paciente | null>(null);
  const [medicaoEspecifica, setMedicaoEspecifica] = useState<Medicao | null>(null);
  const [todasMedicoes, setTodasMedicoes] = useState<Medicao[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [clinicaNome, setClinicaNome] = useState<string>("Clínica Padrão");
  const [profissionalNome, setProfissionalNome] = useState<string>("Profissional Padrão");
  
  useEffect(() => {
    async function fetchData() {
      try {
        setCarregando(true);
        if (!pacienteId) {
          toast.error("ID do paciente não fornecido.");
          navigate("/pacientes");
          return;
        }

        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          toast.error("Sessão não encontrada. Faça login novamente.");
          navigate("/login");
          return;
        }

        // Obter dados do paciente
        const { data: pacienteData, error: pacienteError } = await supabase
          .from("pacientes")
          .select("*")
          .eq("id", pacienteId)
          .single();

        if (pacienteError || !pacienteData) {
          toast.error("Paciente não encontrado ou erro ao carregar.");
          navigate("/pacientes");
          return;
        }
        setPaciente(pacienteData as Paciente);

        // Obter todas as medições do paciente para os gráficos
        const { data: todasMedicoesData, error: todasMedicoesError } = await supabase
          .from("medicoes")
          .select("*")
          .eq("paciente_id", pacienteId)
          .order("data", { ascending: true });

        if (todasMedicoesError) {
          toast.error("Erro ao carregar histórico de medições.");
          // Continuar mesmo com erro, gráficos podem ficar vazios
        } else {
          setTodasMedicoes(todasMedicoesData as Medicao[] || []);
        }

        // Obter a medição específica para o relatório (a mais recente se medicaoId não for fornecido)
        let medicaoAlvo: Medicao | null = null;
        if (medicaoId) {
          const { data: medicaoDataEspecifica, error: medicaoEspecificaError } = await supabase
            .from("medicoes")
            .select("*")
            .eq("id", medicaoId)
            .eq("paciente_id", pacienteId) // Garante que a medição pertence ao paciente
            .single();
          if (medicaoEspecificaError || !medicaoDataEspecifica) {
            toast.warn("Medição específica não encontrada, usando a mais recente.");
          } else {
            medicaoAlvo = medicaoDataEspecifica as Medicao;
          }
        }
        
        // Se não houver medicaoId ou a específica não for encontrada, pegar a mais recente de todasMedicoesData
        if (!medicaoAlvo && todasMedicoesData && todasMedicoesData.length > 0) {
          medicaoAlvo = [...todasMedicoesData].sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())[0] as Medicao;
        }

        if (!medicaoAlvo) {
          toast.error("Nenhuma medição encontrada para este paciente.");
          // Não navegar para permitir que o usuário adicione uma nova medição se desejar
          // Ou, dependendo do fluxo desejado, pode-se navegar para DetalhePaciente
        }
        setMedicaoEspecifica(medicaoAlvo);
        
        // Obter dados do usuário logado (profissional)
        const { data: userData, error: userError } = await supabase
          .from("usuarios") // Supondo que a tabela de usuários/profissionais se chama 'usuarios'
          .select("nome, clinica_nome")
          .eq("id", session.user.id)
          .single();
        
        if (userError) {
          toast.warn("Não foi possível carregar dados do profissional. Usando valores padrão.");
        } else if (userData) {
          setProfissionalNome(userData.nome || "Profissional Padrão");
          setClinicaNome(userData.clinica_nome || "Clínica Padrão");
        }

      } catch (error: any) {
        console.error("Erro ao carregar dados do relatório:", error);
        toast.error(`Erro ao carregar dados: ${error.message}`);
        navigate(`/pacientes/${pacienteId}`); // Volta para detalhes do paciente em caso de erro grave
      } finally {
        setCarregando(false);
      }
    }
    
    fetchData();
  }, [pacienteId, medicaoId, navigate]);
  
  if (carregando) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh]">
        <Loader2 className="h-12 w-12 animate-spin text-turquesa" />
        <p className="mt-4 text-muted-foreground">Gerando relatório...</p>
      </div>
    );
  }
  
  if (!paciente) { // Se o paciente não foi carregado após o loading, algo deu muito errado
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <p className="text-lg mb-4 text-destructive">Não foi possível carregar os dados do paciente.</p>
        <Button onClick={() => navigate("/pacientes")} variant="outline">Voltar para Lista de Pacientes</Button>
      </div>
    );
  }

  if (!medicaoEspecifica) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
         <h2 className="text-2xl font-bold mb-2">Relatório de Avaliação</h2>
         <p className="text-muted-foreground mb-1">Paciente: {paciente.nome}</p>
        <p className="text-lg mb-4 text-orange-600">Nenhuma medição encontrada para gerar o relatório.</p>
        <div className="flex gap-2">
            <Button onClick={() => navigate(`/pacientes/${pacienteId}`)} variant="outline">
                <ChevronLeft className="h-4 w-4 mr-2" /> Voltar ao Paciente
            </Button>
            <Button onClick={() => navigate(`/pacientes/${pacienteId}/nova-medicao`)} className="bg-turquesa hover:bg-turquesa/90">
                Adicionar Nova Medição <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
        </div>
      </div>
    );
  }
  
  const formatarData = (dataString: string) => {
    if (!dataString) return "N/A";
    const data = new Date(dataString);
    if (isNaN(data.getTime())) return "Data inválida";
    return data.toLocaleDateString("pt-BR", { timeZone: "UTC" }); // UTC para consistência
  };
  
  const handleExportarPDF = () => {
    // A lógica de exportação de PDF real precisa ser implementada aqui.
    // Pode usar bibliotecas como jsPDF e html2canvas, ou ReportLab no backend.
    // Por enquanto, apenas um toast de sucesso.
    toast.info("Funcionalidade de exportar PDF ainda em desenvolvimento.");
    // window.print(); // Uma alternativa simples para impressão direta
  };
  
  const handleVoltar = () => {
    navigate(`/pacientes/${pacienteId}`);
  };
    
  const { asymmetryType, severityLevel } = getCranialStatus(medicaoEspecifica.indice_craniano, medicaoEspecifica.cvai);
  const idadeNaMedicao = formatAge(paciente.data_nascimento, medicaoEspecifica.data);
  
  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto p-4 md:p-6 print:p-0">
      <div className="flex items-center justify-between print:hidden">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleVoltar}
            aria-label="Voltar aos detalhes do paciente"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-3xl font-bold">Relatório de Avaliação</h2>
            <div className="text-muted-foreground mt-1">
              Paciente: {paciente.nome} • {formatarData(medicaoEspecifica.data)}
            </div>
          </div>
        </div>
        <Button 
          variant="outline" 
          onClick={handleExportarPDF}
        >
          <Download className="h-4 w-4 mr-2" /> Exportar PDF
        </Button>
      </div>

      {/* Cabeçalho para impressão */}
      <div className="hidden print:block mb-8">
        <h1 className="text-2xl font-bold text-center">Relatório de Avaliação Craniana</h1>
        <p className="text-sm text-center text-gray-600">{clinicaNome}</p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 print:grid-cols-2">
        <Card className="print:shadow-none print:border-gray-300">
          <CardHeader className="print:pb-2">
            <CardTitle className="print:text-lg">Dados da Avaliação</CardTitle>
            <CardDescription className="print:text-sm">Medições realizadas em {formatarData(medicaoEspecifica.data)}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 print:text-sm print:space-y-2">
            <div className="grid grid-cols-2 gap-4 print:gap-2">
              <div>
                <p className="text-sm text-muted-foreground print:text-xs">Comprimento</p>
                <p className="text-lg font-medium print:text-base">{medicaoEspecifica.comprimento?.toFixed(1)} mm</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground print:text-xs">Largura</p>
                <p className="text-lg font-medium print:text-base">{medicaoEspecifica.largura?.toFixed(1)} mm</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground print:text-xs">Diagonal Direita</p>
                <p className="text-lg font-medium print:text-base">{medicaoEspecifica.diagonal_d?.toFixed(1)} mm</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground print:text-xs">Diagonal Esquerda</p>
                <p className="text-lg font-medium print:text-base">{medicaoEspecifica.diagonal_e?.toFixed(1)} mm</p>
              </div>
            </div>
            <hr className="print:my-2"/>
            <div className="grid grid-cols-2 gap-4 print:gap-2">
              <div>
                <p className="text-sm text-muted-foreground print:text-xs">Diferença Diagonais</p>
                <p className="text-lg font-medium print:text-base">{medicaoEspecifica.diferenca_diagonais?.toFixed(1)} mm</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground print:text-xs">Índice Craniano</p>
                <p className="text-lg font-medium print:text-base">{medicaoEspecifica.indice_craniano?.toFixed(1)}%</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground print:text-xs">CVAI</p>
                <p className="text-lg font-medium print:text-base">{medicaoEspecifica.cvai?.toFixed(1)}%</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground print:text-xs">Status</p>
                <StatusBadge status={severityLevel} asymmetryType={asymmetryType} className="mt-1 print:text-xs" />
              </div>
              {medicaoEspecifica.perimetro_cefalico && (
                <div>
                  <p className="text-sm text-muted-foreground print:text-xs">Perímetro Cefálico</p>
                  <p className="text-lg font-medium print:text-base">{medicaoEspecifica.perimetro_cefalico?.toFixed(1)} mm</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card className="print:shadow-none print:border-gray-300">
          <CardHeader className="print:pb-2">
            <CardTitle className="print:text-lg">Recomendações Clínicas</CardTitle>
            <CardDescription className="print:text-sm">Baseadas no protocolo de Atlanta</CardDescription>
          </CardHeader>
          <CardContent className="print:text-sm">
            <div className="space-y-4 print:space-y-2">
              <div>
                <p className="text-sm text-muted-foreground print:text-xs">Diagnóstico</p>
                <p className="font-medium print:text-base">
                  {asymmetryType === "Normal" ? "Desenvolvimento craniano normal" : `${asymmetryType} ${severityLevel}`}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground print:text-xs">Recomendações</p>
                <ul className="list-disc pl-5 space-y-1 mt-1 print:pl-4 print:space-y-0.5">
                  {medicaoEspecifica.recomendacoes && medicaoEspecifica.recomendacoes.length > 0 ? (
                    medicaoEspecifica.recomendacoes.map((rec: string, idx: number) => (
                      <li key={idx}>{rec}</li>
                    ))
                  ) : (
                    <li>Nenhuma recomendação específica registrada.</li>
                  )}
                </ul>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground print:text-xs">Próxima avaliação sugerida</p>
                <p className="font-medium print:text-base">
                  {severityLevel === "normal" ? "Em 3 meses" : 
                   severityLevel === "leve" ? "Em 2 meses" :
                   "Em 1 mês"}
                </p>
              </div>
              
              <div className="pt-2 print:pt-1">
                <p className="text-sm text-muted-foreground print:text-xs">Idade na avaliação</p>
                <p className="font-medium print:text-base">{idadeNaMedicao}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="space-y-6 print:mt-6">
        <Card className="print:shadow-none print:border-gray-300 print:break-inside-avoid">
          <CardHeader className="print:pb-2">
            <CardTitle className="print:text-lg">Evolução do Índice Craniano</CardTitle>
            <CardDescription className="print:text-xs">
              O Índice Craniano mede a proporção entre largura e comprimento do crânio. 
              Valores acima de 80% indicam tendência à braquicefalia, enquanto valores abaixo de 76% 
              indicam tendência à dolicocefalia. A área verde representa a faixa de normalidade.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <MedicaoLineChart 
              titulo="" 
              altura={300} // Reduzido para impressão
              medicoes={todasMedicoes}
              dataNascimento={paciente.data_nascimento}
              tipoGrafico="indiceCraniano"
              linhaCorTheme="rose"
            />
          </CardContent>
        </Card>
        
        <Card className="print:shadow-none print:border-gray-300 print:break-inside-avoid">
          <CardHeader className="print:pb-2">
            <CardTitle className="print:text-lg">Evolução da Plagiocefalia (CVAI)</CardTitle>
            <CardDescription className="print:text-xs">
              O índice CVAI (Cranial Vault Asymmetry Index) mede o grau de assimetria craniana.
              Valores acima de 3.5% indicam assimetria leve, acima de 6.25% moderada, e acima de 8.5% severa.
              A área verde representa a faixa de normalidade.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <MedicaoLineChart 
              titulo="" 
              altura={300} // Reduzido para impressão
              medicoes={todasMedicoes}
              dataNascimento={paciente.data_nascimento}
              tipoGrafico="cvai"
              linhaCorTheme="amber"
            />
          </CardContent>
        </Card>
        
        <Card className="print:shadow-none print:border-gray-300 print:break-inside-avoid">
          <CardHeader className="print:pb-2">
            <CardTitle className="print:text-lg">Evolução do Perímetro Cefálico</CardTitle>
            <CardDescription className="print:text-xs">
              O perímetro cefálico é o contorno da cabeça. As linhas coloridas representam os percentis de referência 
              para {(paciente.sexo === "M" ? "meninos" : "meninas")} da mesma idade,
              sendo P50 a média populacional.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <MedicaoLineChart 
              titulo="" 
              altura={300} // Reduzido para impressão
              medicoes={todasMedicoes}
              dataNascimento={paciente.data_nascimento}
              tipoGrafico="perimetro"
              sexoPaciente={paciente.sexo}
              linhaCorTheme="blue"
            />
          </CardContent>
        </Card>
      </div>
      
      <div className="flex justify-between print:hidden">
        <Button variant="outline" onClick={handleVoltar}>
          <ChevronLeft className="h-4 w-4 mr-2" /> Voltar ao Paciente
        </Button>
        <Button onClick={() => navigate(`/pacientes/${pacienteId}/nova-medicao`)} className="bg-turquesa hover:bg-turquesa/90">
          Nova Medição <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
      
      <div className="hidden print:block text-center border-t pt-4 text-xs text-gray-500 mt-8">
        <p>Este relatório foi gerado pelo sistema CraniumCare em {new Date().toLocaleDateString("pt-BR")} às {new Date().toLocaleTimeString("pt-BR")}</p>
        <p>Profissional responsável: {profissionalNome} • Clínica: {clinicaNome}</p>
        <p>Documento para uso clínico. Confidencial.</p>
      </div>
    </div>
  );
}
