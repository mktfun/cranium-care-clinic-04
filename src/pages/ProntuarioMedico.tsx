import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Loader2, ChevronLeft, FilePlus, FileText, Calendar, User } from "lucide-react";
import { formatAgeHeader } from "@/lib/age-utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { DadosPessoaisTab } from "@/components/prontuario/DadosPessoaisTab";
import { HistoricoMedicoTab } from "@/components/prontuario/HistoricoMedicoTab";
import { ConsultasTab } from "@/components/prontuario/ConsultasTab";
import { AvaliacoesCraniaisTab } from "@/components/prontuario/AvaliacoesCraniaisTab";
import { NovoProntuarioDialog } from "@/components/prontuario/NovoProntuarioDialog";
import { AnimatedProntuarioSelect } from "@/components/prontuario/AnimatedProntuarioSelect";
import { useIsMobile } from "@/hooks/use-mobile";
import { Prontuario } from "@/types";
export default function ProntuarioMedico() {
  const {
    id
  } = useParams();
  const navigate = useNavigate();
  const [paciente, setPaciente] = useState<any>(null);
  const [prontuario, setProntuario] = useState<Prontuario | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("dados-pessoais");
  const isMobile = useIsMobile();
  useEffect(() => {
    async function fetchData() {
      if (id) {
        setLoading(true);
        try {
          // Buscar dados do paciente
          const {
            data: pacienteData,
            error: pacienteError
          } = await supabase.from('pacientes').select('*').eq('id', id).maybeSingle();
          if (pacienteError) {
            console.error('Erro ao carregar dados do paciente:', pacienteError);
            toast.error('Erro ao carregar dados do paciente.');
            setLoading(false);
            return;
          }
          if (!pacienteData) {
            toast.error('Paciente não encontrado.');
            navigate('/pacientes');
            return;
          }
          setPaciente(pacienteData);

          // Buscar dados do prontuário usando o supabase client
          const {
            data: prontuarioData,
            error: prontuarioError
          } = await supabase.from('prontuarios').select('*').eq('paciente_id', id).order('data_criacao', {
            ascending: false
          }).maybeSingle();
          if (prontuarioError) {
            console.error('Erro ao carregar prontuário:', prontuarioError);
            toast.error('Erro ao carregar prontuário.');
          } else {
            setProntuario(prontuarioData as Prontuario);
          }
        } catch (err) {
          console.error('Erro inesperado:', err);
          toast.error('Erro ao carregar dados.');
        } finally {
          setLoading(false);
        }
      }
    }
    fetchData();
  }, [id, navigate]);
  if (loading) {
    return <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-turquesa" />
      </div>;
  }
  if (!paciente) {
    return <div className="p-8 text-center">
        <h2 className="text-2xl font-semibold mb-4">Paciente não encontrado</h2>
        <p className="text-muted-foreground mb-6">O paciente que você está procurando não foi encontrado no sistema.</p>
        <Button onClick={() => navigate("/pacientes")}>Voltar para Pacientes</Button>
      </div>;
  }
  const formatarData = (dataString: string) => {
    if (!dataString) return "N/A";
    const data = new Date(dataString);
    if (isNaN(data.getTime())) return "Data inválida";
    return data.toLocaleDateString('pt-BR');
  };
  const idadeAtual = formatAgeHeader(paciente.data_nascimento);
  return <div className="space-y-6 animate-fade-in p-4 md:p-6">
      {/* Cabeçalho centralizado com apenas uma seta */}
      <div className="flex flex-col items-center mb-2">
        <Button variant="ghost" size="icon" onClick={() => navigate(`/pacientes/${id}`)} className="mb-2">
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <div className="text-center">
          <h2 className="font-bold text-2xl">{paciente.nome}</h2>
          <p className="text-muted-foreground">
            {idadeAtual} • Nasc.: {formatarData(paciente.data_nascimento)}
          </p>
        </div>

        {!prontuario && <Button className="flex items-center gap-2 bg-turquesa hover:bg-turquesa/90 mt-4" onClick={() => setIsDialogOpen(true)}>
            <FilePlus className="h-4 w-4" />
            <span>Criar Prontuário</span>
          </Button>}
      </div>
      
      {prontuario ? <>
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2 font-normal text-base">
                    <FileText className="h-5 w-5 text-turquesa" /> 
                    Prontuário Médico
                  </CardTitle>
                  <CardDescription>
                    Criado em: {formatarData(prontuario.data_criacao)}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => navigate(`/pacientes/${id}/prontuario/imprimir`)} className="flex items-center gap-1">
                    Imprimir
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                {isMobile ? <div className="p-4">
                    <AnimatedProntuarioSelect value={activeTab} onChange={setActiveTab} />
                  </div> : <div className="px-6">
                    <TabsList className="w-full justify-start">
                      <TabsTrigger value="dados-pessoais" className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        Dados Pessoais
                      </TabsTrigger>
                      <TabsTrigger value="historico-medico" className="flex items-center gap-1">
                        <FileText className="h-4 w-4" />
                        Histórico Médico
                      </TabsTrigger>
                      <TabsTrigger value="consultas" className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Consultas
                      </TabsTrigger>
                      <TabsTrigger value="avaliacoes-craniais" className="flex items-center gap-1">
                        <FileText className="h-4 w-4" />
                        Avaliações Craniais
                      </TabsTrigger>
                    </TabsList>
                  </div>}
                <Separator className="my-0" />
                <TabsContent value="dados-pessoais" className="p-6">
                  <DadosPessoaisTab paciente={paciente} prontuario={prontuario} />
                </TabsContent>
                <TabsContent value="historico-medico" className="p-6">
                  <HistoricoMedicoTab prontuario={prontuario} pacienteId={id || ''} />
                </TabsContent>
                <TabsContent value="consultas" className="p-6">
                  <ConsultasTab pacienteId={id || ''} />
                </TabsContent>
                <TabsContent value="avaliacoes-craniais" className="p-6">
                  <AvaliacoesCraniaisTab pacienteId={id || ''} />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </> : <Card>
          <CardContent className="p-10 flex flex-col items-center justify-center text-center">
            <FileText className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-2xl font-semibold mb-2">Nenhum prontuário encontrado</h3>
            <p className="text-muted-foreground mb-6">
              Este paciente ainda não possui um prontuário médico cadastrado no sistema.
            </p>
            <Button onClick={() => setIsDialogOpen(true)} className="bg-turquesa hover:bg-turquesa/90">
              <FilePlus className="h-4 w-4 mr-2" />
              Criar Prontuário
            </Button>
          </CardContent>
        </Card>}
      
      <NovoProntuarioDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} pacienteId={id || ''} onSuccess={novoProntuario => {
      setProntuario(novoProntuario);
      toast.success("Prontuário criado com sucesso!");
    }} />
    </div>;
}