
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Loader2, ChevronLeft, FilePlus, FileText, Calendar, User, Clipboard, Stethoscope, Activity, Baby, Brain, FileCheck, History } from "lucide-react";
import { formatAgeHeader } from "@/lib/age-utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { DadosPessoaisTab } from "@/components/prontuario/DadosPessoaisTab";
import { AvaliacoesCraniaisTab } from "@/components/prontuario/AvaliacoesCraniaisTab";
import { AvaliacaoTab } from "@/components/prontuario/AvaliacaoTab";
import { CondutaTab } from "@/components/prontuario/CondutaTab";
import { DiagnosticoTab } from "@/components/prontuario/DiagnosticoTab";
import { NovoProntuarioDialog } from "@/components/prontuario/NovoProntuarioDialog";
import { ProntuarioHistorico } from "@/components/prontuario/ProntuarioHistorico";
import { AnimatedProntuarioSelect } from "@/components/prontuario/AnimatedProntuarioSelect";
import { useIsMobile } from "@/hooks/use-mobile";
import { useDebounce } from "@/hooks/use-debounce";
import { Prontuario } from "@/types";

export default function ProntuarioMedico() {
  const { id, prontuarioId } = useParams();
  const navigate = useNavigate();
  const [paciente, setPaciente] = useState<any>(null);
  const [prontuarios, setProntuarios] = useState<Prontuario[]>([]);
  const [currentProntuario, setCurrentProntuario] = useState<Prontuario | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("dados-do-bebe");
  const [isSaving, setIsSaving] = useState(false);
  const isMobile = useIsMobile();
  
  useEffect(() => {
    async function fetchData() {
      if (id) {
        setLoading(true);
        try {
          // Buscar dados do paciente
          const { data: pacienteData, error: pacienteError } = await supabase
            .from('pacientes')
            .select('*')
            .eq('id', id)
            .maybeSingle();
          
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

          // Buscar TODOS os prontuários do paciente
          const { data: prontuariosData, error: prontuariosError } = await supabase
            .from('prontuarios')
            .select('*')
            .eq('paciente_id', id)
            .order('data_criacao', { ascending: false });
          
          if (prontuariosError) {
            console.error('Erro ao carregar prontuários:', prontuariosError);
            toast.error('Erro ao carregar prontuários.');
          } else {
            setProntuarios(prontuariosData as Prontuario[]);
            
            // Se há um prontuarioId específico na URL, buscar esse prontuário
            if (prontuarioId && prontuariosData) {
              const selectedProntuario = prontuariosData.find(p => p.id === prontuarioId);
              if (selectedProntuario) {
                setCurrentProntuario(selectedProntuario as Prontuario);
              } else {
                toast.error('Prontuário não encontrado.');
                navigate(`/pacientes/${id}/prontuario`);
              }
            } else if (prontuariosData && prontuariosData.length > 0) {
              // Selecionar o mais recente por padrão
              setCurrentProntuario(prontuariosData[0] as Prontuario);
              // Atualizar URL para refletir o prontuário selecionado
              navigate(`/pacientes/${id}/prontuario/${prontuariosData[0].id}`, { replace: true });
            } else {
              setCurrentProntuario(null);
            }
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
  }, [id, prontuarioId, navigate]);

  const handleNovoProntuario = (novoProntuario: Prontuario) => {
    setProntuarios(prev => [novoProntuario, ...prev]);
    setCurrentProntuario(novoProntuario);
    navigate(`/pacientes/${id}/prontuario/${novoProntuario.id}`);
    toast.success("Nova consulta criada com sucesso!");
  };

  const handleSelecionarProntuario = (prontuario: Prontuario) => {
    setCurrentProntuario(prontuario);
    navigate(`/pacientes/${id}/prontuario/${prontuario.id}`);
  };

  const handleUpdateProntuario = async (field: string, value: any) => {
    if (!currentProntuario) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('prontuarios')
        .update({ [field]: value, updated_at: new Date().toISOString() })
        .eq('id', currentProntuario.id);
      
      if (error) {
        console.error('Erro ao salvar:', error);
        toast.error('Erro ao salvar alterações.');
        return;
      }
      
      // Atualizar estado local
      setCurrentProntuario(prev => prev ? { ...prev, [field]: value } : null);
      setProntuarios(prev => prev.map(p => 
        p.id === currentProntuario.id ? { ...p, [field]: value } : p
      ));
      
      toast.success('Alterações salvas automaticamente');
    } catch (err) {
      console.error('Erro ao salvar:', err);
      toast.error('Erro ao salvar alterações.');
    } finally {
      setIsSaving(false);
    }
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

  const formatarData = (dataString: string) => {
    if (!dataString) return "N/A";
    const data = new Date(dataString);
    if (isNaN(data.getTime())) return "Data inválida";
    return data.toLocaleDateString('pt-BR');
  };
  
  const idadeAtual = formatAgeHeader(paciente.data_nascimento);

  return (
    <div className="space-y-6 animate-fade-in p-4 md:p-6">
      {/* Cabeçalho centralizado */}
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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Histórico de Prontuários */}
        <div className="lg:col-span-1">
          <ProntuarioHistorico
            prontuarios={prontuarios}
            currentProntuario={currentProntuario}
            onSelecionarProntuario={handleSelecionarProntuario}
            onNovoProntuario={() => setIsDialogOpen(true)}
          />
        </div>

        {/* Conteúdo do Prontuário */}
        <div className="lg:col-span-3">
          {currentProntuario ? (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2 font-normal text-base">
                      <FileText className="h-5 w-5 text-turquesa" /> 
                      Prontuário da Consulta
                      {isSaving && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                    </CardTitle>
                    <CardDescription>
                      {formatarData(currentProntuario.data_criacao)}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => navigate(`/pacientes/${id}/prontuario/imprimir`)} 
                      className="flex items-center gap-1"
                    >
                      Imprimir
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  {isMobile ? (
                    <div className="p-4">
                      <AnimatedProntuarioSelect value={activeTab} onChange={setActiveTab} />
                    </div>
                  ) : (
                    <div className="px-6">
                      <TabsList className="w-full justify-start">
                        <TabsTrigger value="dados-do-bebe" className="flex items-center gap-1">
                          <Baby className="h-4 w-4" />
                          Dados do Bebê
                        </TabsTrigger>
                        <TabsTrigger value="anamnese-avaliacao" className="flex items-center gap-1">
                          <Clipboard className="h-4 w-4" />
                          Anamnese/Avaliação
                        </TabsTrigger>
                        <TabsTrigger value="avaliacao-cranio" className="flex items-center gap-1">
                          <Brain className="h-4 w-4" />
                          Avaliação Crânio
                        </TabsTrigger>
                        <TabsTrigger value="conduta" className="flex items-center gap-1">
                          <Stethoscope className="h-4 w-4" />
                          Conduta
                        </TabsTrigger>
                        <TabsTrigger value="diagnostico" className="flex items-center gap-1">
                          <Activity className="h-4 w-4" />
                          Diagnóstico
                        </TabsTrigger>
                        <TabsTrigger value="prescricao" className="flex items-center gap-1">
                          <FileCheck className="h-4 w-4" />
                          Prescrição
                        </TabsTrigger>
                      </TabsList>
                    </div>
                  )}
                  <Separator className="my-0" />
                  
                  <TabsContent value="dados-do-bebe" className="p-6">
                    <DadosPessoaisTab 
                      paciente={paciente} 
                      prontuario={currentProntuario} 
                      onUpdate={handleUpdateProntuario}
                    />
                  </TabsContent>
                  
                  <TabsContent value="anamnese-avaliacao" className="p-6">
                    <AvaliacaoTab 
                      prontuario={currentProntuario} 
                      pacienteId={id || ''} 
                      onUpdate={handleUpdateProntuario}
                    />
                  </TabsContent>
                  
                  <TabsContent value="avaliacao-cranio" className="p-6">
                    <AvaliacoesCraniaisTab pacienteId={id || ''} />
                  </TabsContent>
                  
                  <TabsContent value="conduta" className="p-6">
                    <CondutaTab 
                      prontuario={currentProntuario} 
                      pacienteId={id || ''} 
                      onUpdate={handleUpdateProntuario}
                    />
                  </TabsContent>
                  
                  <TabsContent value="diagnostico" className="p-6">
                    <DiagnosticoTab 
                      prontuario={currentProntuario} 
                      pacienteId={id || ''} 
                      onUpdate={handleUpdateProntuario}
                    />
                  </TabsContent>
                  
                  <TabsContent value="prescricao" className="p-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Prescrição Médica</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center py-8">
                          <p className="text-muted-foreground">Seção de prescrição em desenvolvimento.</p>
                          <p className="text-sm text-muted-foreground mt-2">
                            Esta seção permitirá a criação e gestão de prescrições médicas.
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-10 flex flex-col items-center justify-center text-center">
                <FileText className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-2xl font-semibold mb-2">Nenhum prontuário encontrado</h3>
                <p className="text-muted-foreground mb-6">
                  Este paciente ainda não possui um prontuário cadastrado no sistema.
                </p>
                <Button onClick={() => setIsDialogOpen(true)} className="bg-turquesa hover:bg-turquesa/90">
                  <FilePlus className="h-4 w-4 mr-2" />
                  Criar Primeira Consulta
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      
      <NovoProntuarioDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen} 
        pacienteId={id || ''} 
        onSuccess={handleNovoProntuario} 
      />
    </div>
  );
}
