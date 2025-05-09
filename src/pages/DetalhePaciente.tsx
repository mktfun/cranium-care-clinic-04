
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Edit3, Plus, User, ArrowRight } from "lucide-react";
import { obterPacientePorId } from "@/data/mock-data";
import { StatusBadge } from "@/components/StatusBadge";
import { MedicaoLineChart } from "@/components/MedicaoLineChart";
import { PatientTasks } from "@/components/PatientTasks";
import { EditarPacienteForm } from "@/components/EditarPacienteForm";
import { MedicaoDetails } from "@/components/MedicaoDetails";
import { formatAge, formatAgeHeader } from "@/lib/age-utils";
import { getCranialStatus } from "@/lib/cranial-utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function DetalhePaciente() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [paciente, setPaciente] = useState<any>(null);
  const [medicoes, setMedicoes] = useState<any[]>([]);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedMedicao, setSelectedMedicao] = useState<any>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  
  // Load patient data
  useEffect(() => {
    async function fetchData() {
      if (id) {
        setLoading(true);
        try {
          // Try to fetch data from Supabase
          const { data: pacienteData, error } = await supabase
            .from('pacientes')
            .select('*')
            .eq('id', id)
            .single();
          
          if (error || !pacienteData) {
            // Fallback to mock data
            const mockPaciente = obterPacientePorId(id);
            setPaciente(mockPaciente);
            setMedicoes(mockPaciente?.medicoes || []);
          } else {
            // Use Supabase data
            setPaciente(pacienteData);
            
            // Fetch medicoes for this patient
            const { data: medicoesData, error: medicoesError } = await supabase
              .from('medicoes')
              .select('*')
              .eq('paciente_id', id)
              .order('data', { ascending: false });
              
            if (medicoesError) {
              console.error('Error fetching medicoes:', medicoesError);
              toast.error('Erro ao carregar medições.');
            } else {
              setMedicoes(medicoesData || []);
            }
          }
        } catch (err) {
          console.error('Error fetching patient data:', err);
          toast.error('Erro ao carregar dados do paciente.');
        } finally {
          setLoading(false);
        }
      }
    }
    
    fetchData();
  }, [id]);
  
  // Handle loading state
  if (loading) {
    return <div className="p-8 flex justify-center">Carregando...</div>;
  }
  
  if (!paciente) {
    return <div className="p-8 flex justify-center">Paciente não encontrado</div>;
  }
  
  const ultimaMedicao = medicoes.length > 0 ? medicoes[0] : null;
  
  // Format date
  const formatarData = (dataString: string) => {
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR');
  };
  
  // Get current age string
  const idadeAtual = formatAgeHeader(paciente.dataNascimento || paciente.data_nascimento);
  
  // Get asymmetry type and severity for the last measurement
  const { asymmetryType, severityLevel } = ultimaMedicao
    ? getCranialStatus(ultimaMedicao.indiceCraniano || ultimaMedicao.indice_craniano, ultimaMedicao.cvai)
    : { asymmetryType: "Normal", severityLevel: "normal" };

  // Handle click on a measurement in the history
  const handleMedicaoClick = (medicao: any) => {
    setSelectedMedicao(medicao);
    setIsDetailDialogOpen(true);
  };
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold">{paciente.nome}</h2>
          <p className="text-muted-foreground">
            {idadeAtual} • Nasc.: {formatarData(paciente.dataNascimento || paciente.data_nascimento)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="flex items-center gap-2" onClick={() => setIsEditDialogOpen(true)}>
            <Edit3 className="h-4 w-4" />
            <span>Editar</span>
          </Button>
          <Button 
            className="flex items-center gap-2 bg-turquesa hover:bg-turquesa/90" 
            onClick={() => navigate(`/pacientes/${id}/nova-medicao`)}
          >
            <Plus className="h-4 w-4" />
            <span>Nova Medição</span>
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Última Medição</CardTitle>
            </CardHeader>
            <CardContent>
              {ultimaMedicao ? (
                <MedicaoDetails 
                  medicao={ultimaMedicao}
                  pacienteNascimento={paciente.dataNascimento || paciente.data_nascimento}
                />
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">Nenhuma medição registrada.</p>
                  <Button 
                    className="bg-turquesa hover:bg-turquesa/90" 
                    onClick={() => navigate(`/pacientes/${id}/nova-medicao`)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Medição
                  </Button>
                </div>
              )}
              {ultimaMedicao && (
                <div className="flex justify-end mt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => navigate(`/pacientes/${id}/relatorio`)}
                    className="flex items-center gap-2"
                  >
                    Gerar Relatório <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Dados do Paciente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <User className="h-4 w-4" />
                  <span>Informações</span>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 ml-6">
                  <div className="text-sm">
                    <span className="text-muted-foreground">Sexo:</span>
                    <span className="ml-2">{paciente.sexo === 'M' ? 'Masculino' : 'Feminino'}</span>
                  </div>
                  {ultimaMedicao && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Idade na Última Avaliação:</span>
                      <span className="ml-2">{formatAge(paciente.dataNascimento || paciente.data_nascimento, ultimaMedicao.data)}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Calendar className="h-4 w-4" />
                  <span>Total de Medições</span>
                </div>
                <div className="ml-6 text-lg font-medium">
                  {medicoes.length} medição(ões)
                </div>
              </div>
              
              <div>
                <div className="text-muted-foreground mb-1">Responsáveis</div>
                {paciente.responsaveis && paciente.responsaveis.map((resp: any, index: number) => (
                  <div key={index} className="border rounded-md p-3 mb-2">
                    <div className="font-medium">{resp.nome}</div>
                    <div className="text-sm text-muted-foreground">
                      {resp.telefone} • {resp.email}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <PatientTasks patientId={id || ""} />
        </div>
      </div>
      
      {/* Evolution Charts - Moved to be displayed prominently */}
      <div className="mt-8">
        <h3 className="text-xl font-medium mb-4">Evolução das Medições</h3>
        <div className="grid grid-cols-1 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Evolução do Índice Craniano</CardTitle>
              <CardDescription>
                O Índice Craniano mede a proporção entre largura e comprimento do crânio.
                Valores ideais ficam entre 76% e 80%, formando a zona verde no gráfico. 
                Valores acima de 80% indicam tendência à braquicefalia, enquanto valores abaixo de 76% 
                indicam tendência à dolicocefalia.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MedicaoLineChart 
                titulo="" 
                medicoes={medicoes}
                dataNascimento={paciente.dataNascimento || paciente.data_nascimento}
                tipoGrafico="indiceCraniano"
                sexoPaciente={paciente.sexo}
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
                medicoes={medicoes}
                dataNascimento={paciente.dataNascimento || paciente.data_nascimento}
                tipoGrafico="cvai"
                sexoPaciente={paciente.sexo}
                linhaCorTheme="amber"
              />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Evolução das Diagonais</CardTitle>
              <CardDescription>
                Este gráfico mostra a evolução da diferença entre as diagonais cranianas (assimetria).
                A diferença ideal deve ser menor que 3mm, sendo que uma redução desta diferença ao longo
                do tratamento indica melhora na simetria craniana.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MedicaoLineChart 
                titulo="" 
                medicoes={medicoes}
                dataNascimento={paciente.dataNascimento || paciente.data_nascimento}
                tipoGrafico="diagonais"
                sexoPaciente={paciente.sexo}
                linhaCorTheme="purple"
              />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Evolução do Perímetro Cefálico</CardTitle>
              <CardDescription>
                O perímetro cefálico é o contorno da cabeça medido na altura da testa e da parte 
                mais protuberante do occipital. As linhas coloridas representam os percentis de referência 
                para {paciente.sexo === 'M' ? 'meninos' : 'meninas'} da mesma idade,
                sendo P50 a média populacional.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MedicaoLineChart 
                titulo="" 
                medicoes={medicoes}
                dataNascimento={paciente.dataNascimento || paciente.data_nascimento}
                tipoGrafico="perimetro"
                sexoPaciente={paciente.sexo}
                linhaCorTheme="blue"
              />
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Measurement History - Now positioned below the evolution charts */}
      <div className="mt-8">
        <Tabs defaultValue="historico">
          <TabsList>
            <TabsTrigger value="historico">Histórico de Medições</TabsTrigger>
          </TabsList>
          
          <TabsContent value="historico">
            <Card>
              <CardContent className="py-6">
                {medicoes.length > 0 ? (
                  <div className="space-y-4">
                    {medicoes.map((medicao: any) => (
                      <div key={medicao.id} 
                           onClick={() => handleMedicaoClick(medicao)}
                           className="cursor-pointer transition hover:bg-muted/20 rounded-md">
                        <MedicaoDetails 
                          key={medicao.id}
                          medicao={medicao}
                          pacienteNascimento={paciente.dataNascimento || paciente.data_nascimento}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Nenhuma medição registrada.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Dialogs */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Paciente</DialogTitle>
          </DialogHeader>
          <EditarPacienteForm 
            paciente={paciente} 
            onSalvar={() => setIsEditDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
      
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes da Medição</DialogTitle>
          </DialogHeader>
          {selectedMedicao && (
            <div className="mt-4">
              <MedicaoDetails 
                medicao={selectedMedicao}
                pacienteNascimento={paciente.dataNascimento || paciente.data_nascimento}
                compact={false}
              />
              <div className="mt-6 grid grid-cols-2 gap-4">
                <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>
                  Fechar
                </Button>
                <Button 
                  className="bg-turquesa hover:bg-turquesa/90"
                  onClick={() => {
                    setIsDetailDialogOpen(false);
                    navigate(`/pacientes/${id}/relatorio`);
                  }}
                >
                  Ver Relatório Completo
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
