
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ChevronLeft, FileText, History, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { formatAgeHeader } from "@/lib/age-utils";
import { HistoricoMedicoList } from "@/components/historico/HistoricoMedicoList";
import { ConsultasList } from "@/components/historico/ConsultasList";
import { MedicoesHistoricoTable } from "@/components/relatorio/MedicoesHistoricoTable";

export default function HistoricoCompletoPaciente() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [paciente, setPaciente] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("historico-medico");
  const [historico, setHistorico] = useState<any[]>([]);
  const [consultas, setConsultas] = useState<any[]>([]);
  const [medicoes, setMedicoes] = useState<any[]>([]);
  
  useEffect(() => {
    async function fetchData() {
      if (id) {
        setLoading(true);
        try {
          // Fetch patient data
          const { data: pacienteData, error: pacienteError } = await supabase
            .from('pacientes')
            .select('*')
            .eq('id', id)
            .single();
            
          if (pacienteError) {
            console.error("Erro ao buscar dados do paciente:", pacienteError);
            toast.error("Erro ao carregar dados do paciente.");
            navigate("/pacientes");
            return;
          }
          
          setPaciente(pacienteData);
          
          // Fetch medical history
          const { data: historicoData, error: historicoError } = await supabase
            .from('historico_medico')
            .select('*')
            .eq('paciente_id', id)
            .order('data', { ascending: false });
            
          if (historicoError) {
            console.error("Erro ao buscar histórico médico:", historicoError);
            toast.error("Erro ao carregar histórico médico.");
          } else {
            setHistorico(historicoData || []);
          }
          
          // Fetch consultations
          const { data: consultasData, error: consultasError } = await supabase
            .from('consultas')
            .select('*')
            .eq('paciente_id', id)
            .order('data', { ascending: false });
            
          if (consultasError) {
            console.error("Erro ao buscar consultas:", consultasError);
            toast.error("Erro ao carregar consultas.");
          } else {
            setConsultas(consultasData || []);
          }
          
          // Fetch measurements
          const { data: medicoesData, error: medicoesError } = await supabase
            .from('medicoes')
            .select('*')
            .eq('paciente_id', id)
            .order('data', { ascending: false });
            
          if (medicoesError) {
            console.error("Erro ao buscar medições:", medicoesError);
            toast.error("Erro ao carregar medições.");
          } else {
            setMedicoes(medicoesData || []);
          }
          
        } catch (error) {
          console.error("Erro inesperado:", error);
          toast.error("Ocorreu um erro ao carregar os dados.");
        } finally {
          setLoading(false);
        }
      }
    }
    
    fetchData();
  }, [id, navigate]);
  
  const formatarData = (data: string) => {
    if (!data) return "N/A";
    
    const dataObj = new Date(data);
    if (isNaN(dataObj.getTime())) return "Data inválida";
    
    return dataObj.toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-turquesa" />
      </div>
    );
  }

  if (!paciente) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-semibold mb-4">Paciente não encontrado</h2>
        <p className="text-muted-foreground mb-6">O paciente que você está procurando não foi encontrado no sistema.</p>
        <Button onClick={() => navigate("/pacientes")}>Voltar para Pacientes</Button>
      </div>
    );
  }

  const idadeAtual = formatAgeHeader(paciente.data_nascimento);

  return (
    <div className="space-y-6 animate-fade-in p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate(`/pacientes/${id}`)}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-3xl font-bold">{paciente.nome}</h2>
            <p className="text-muted-foreground">
              {idadeAtual} • Nasc.: {formatarData(paciente.data_nascimento)}
            </p>
          </div>
        </div>
      </div>

      <Separator />
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="historico-medico" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Histórico Médico
          </TabsTrigger>
          <TabsTrigger value="consultas" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Consultas
          </TabsTrigger>
          <TabsTrigger value="medicoes" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Medições Cranianas
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="historico-medico" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Histórico Médico Completo</CardTitle>
            </CardHeader>
            <CardContent>
              <HistoricoMedicoList historico={historico} isReadOnly={true} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="consultas" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Consultas</CardTitle>
            </CardHeader>
            <CardContent>
              <ConsultasList consultas={consultas} isReadOnly={true} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="medicoes" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Medições Cranianas</CardTitle>
            </CardHeader>
            <CardContent>
              {medicoes.length > 0 ? (
                <MedicoesHistoricoTable 
                  medicoes={medicoes}
                  dataNascimento={paciente.data_nascimento}
                />
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted-foreground">Nenhuma medição craniana registrada.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
