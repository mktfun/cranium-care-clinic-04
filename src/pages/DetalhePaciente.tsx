import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Loader2, ChevronLeft, FileText, Edit, History, Plus, Camera, RotateCcw, Calendar, Activity } from "lucide-react";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { EditarPacienteForm } from "@/components/EditarPacienteForm";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Paciente } from "@/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MedicoesHistoricoTable } from "@/components/relatorio/MedicoesHistoricoTable";
import { formatAge } from "@/lib/age-utils";
import { StatusBadge } from "@/components/StatusBadge";
import { getCranialStatus } from "@/lib/cranial-utils";
import { getIndividualClassificationText } from "@/lib/cranial-classification-utils";

export default function DetalhePaciente() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [paciente, setPaciente] = useState<Paciente | null>(null);
  const [prontuario, setProntuario] = useState<any | null>(null);
  const [prontuarios, setProntuarios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [medicoes, setMedicoes] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("resumo");

  useEffect(() => {
    async function fetchPaciente() {
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
            console.error("Erro ao carregar paciente:", pacienteError);
            toast.error("Erro ao carregar dados do paciente.");
            return;
          }

          if (pacienteData) {
            // Convert database format to our Paciente type
            const pacienteFormatted: Paciente = {
              ...pacienteData,
              dataNascimento: pacienteData.data_nascimento,
              // Calculate age in months
              idadeEmMeses: calculateAgeInMonths(pacienteData.data_nascimento)
            };
            
            setPaciente(pacienteFormatted);
            
            // Fetch patient's medical record (último prontuário para resumo)
            const { data: prontuarioData, error: prontuarioError } = await supabase
              .from('prontuarios')
              .select('*')
              .eq('paciente_id', id)
              .order('data_criacao', { ascending: false })
              .limit(1)
              .maybeSingle();
              
            if (prontuarioError) {
              console.error("Erro ao carregar prontuário:", prontuarioError);
            } else {
              setProntuario(prontuarioData);
            }

            // Fetch ALL patient's medical records for history
            const { data: prontuariosData, error: prontuariosError } = await supabase
              .from('prontuarios')
              .select('*')
              .eq('paciente_id', id)
              .order('data_criacao', { ascending: false });
              
            if (prontuariosError) {
              console.error("Erro ao carregar prontuários:", prontuariosError);
            } else {
              setProntuarios(prontuariosData || []);
            }
            
            // Fetch patient's measurements
            const { data: medicoesData, error: medicoesError } = await supabase
              .from('medicoes')
              .select('*')
              .eq('paciente_id', id)
              .order('data', { ascending: false });
              
            if (medicoesError) {
              console.error("Erro ao carregar medições:", medicoesError);
            } else {
              setMedicoes(medicoesData || []);
            }
          }
        } catch (error) {
          console.error("Erro ao buscar paciente:", error);
          toast.error("Erro ao buscar dados do paciente.");
        } finally {
          setLoading(false);
        }
      }
    }

    fetchPaciente();
  }, [id]);

  const calculateAgeInMonths = (birthDate: string): number => {
    const today = new Date();
    const birth = new Date(birthDate);
    return ((today.getFullYear() - birth.getFullYear()) * 12) + 
           (today.getMonth() - birth.getMonth());
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

  const formatarData = (data: string) => {
    try {
      const parsedDate = new Date(data);
      return format(parsedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    } catch (error) {
      console.error("Erro ao formatar a data:", error);
      return "Data inválida";
    }
  };
  
  const calcularIdadeEmMeses = (dataNascimento: string) => {
    const hoje = new Date();
    const nascimento = new Date(dataNascimento);
    return ((hoje.getFullYear() - nascimento.getFullYear()) * 12) + 
           (hoje.getMonth() - nascimento.getMonth());
  };
  
  // Get last measurement
  const ultimaMedicao = medicoes.length > 0 ? medicoes[0] : null;
  let statusSeverity = null;
  let asymmetryType = null;
  
  if (ultimaMedicao) {
    const statusInfo = getCranialStatus(
      ultimaMedicao.indice_craniano || 0, 
      ultimaMedicao.cvai || 0
    );
    statusSeverity = statusInfo.severityLevel;
    asymmetryType = statusInfo.asymmetryType;
  }

  return (
    <div className="space-y-6 animate-fade-in p-4 md:p-6">
      {/* Cabeçalho reorganizado conforme a imagem */}
      <div className="flex flex-col space-y-2">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={() => navigate("/pacientes")} className="mr-2">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-3xl font-bold">{paciente.nome}</h2>
        </div>
        
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div>
              <p className="text-muted-foreground">
                Cadastrado em: {formatarData(paciente.created_at || '')}
              </p>
            </div>
          </div>
          <div className="flex gap-2 mt-2 md:mt-0">
            <Button onClick={() => setActiveTab("editar")} variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
            <Button onClick={() => navigate(`/pacientes/${id}/prontuario`)} className="bg-turquesa hover:bg-turquesa/90">
              <FileText className="h-4 w-4 mr-2" />
              Ver Prontuário
            </Button>
          </div>
        </div>
      </div>

      <Separator />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="resumo">Resumo</TabsTrigger>
          <TabsTrigger value="prontuarios">Prontuários</TabsTrigger>
          <TabsTrigger value="medicoes">Medições</TabsTrigger>
          <TabsTrigger value="editar">Editar Paciente</TabsTrigger>
        </TabsList>
        
        <TabsContent value="resumo" className="space-y-6">
          {/* Detalhes do Paciente */}
          <Card>
            <CardHeader>
              <CardTitle>Informações do Paciente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Nome Completo</p>
                  <p className="text-lg">{paciente.nome}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Data de Nascimento</p>
                  <p className="text-lg">{formatarData(paciente.data_nascimento)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Idade</p>
                  <p className="text-lg">{formatAge(paciente.data_nascimento)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Sexo</p>
                  <p className="text-lg">{paciente.sexo}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Resumo do Prontuário */}
          <Card>
            <CardHeader>
              <CardTitle>Resumo do Prontuário</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {prontuario ? (
                <>
                  <div className="grid md:grid-cols-3 gap-4">
                    {prontuario.peso && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Peso</p>
                        <p className="text-lg">{prontuario.peso} kg</p>
                      </div>
                    )}
                    
                    {prontuario.altura && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Altura</p>
                        <p className="text-lg">{prontuario.altura} cm</p>
                      </div>
                    )}
                    
                    {prontuario.tipo_sanguineo && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Tipo Sanguíneo</p>
                        <p className="text-lg">{prontuario.tipo_sanguineo}</p>
                      </div>
                    )}
                  </div>
                  
                  {prontuario.alergias && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Alergias</p>
                      <p className="text-base">{prontuario.alergias}</p>
                    </div>
                  )}
                  
                  {prontuario.observacoes_gerais && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Observações Gerais</p>
                      <p className="text-base">{prontuario.observacoes_gerais}</p>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted-foreground">Nenhum prontuário cadastrado</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2"
                    onClick={() => navigate(`/pacientes/${id}/prontuario`)}
                  >
                    Criar Prontuário
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Última Avaliação Craniana */}
          <Card>
            <CardHeader>
              <CardTitle>Status Craniano</CardTitle>
            </CardHeader>
            <CardContent>
              {ultimaMedicao ? (
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Última Avaliação</p>
                      <p className="text-lg">{formatarData(ultimaMedicao.data)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Status</p>
                      <div className="mt-1">
                        <StatusBadge 
                          status={statusSeverity!} 
                          asymmetryType={asymmetryType!}
                          showAsymmetryType={true}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Índice Craniano</p>
                      <p className="text-lg">{ultimaMedicao.indice_craniano}%</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">CVAI</p>
                      <p className="text-lg">{ultimaMedicao.cvai}%</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Perímetro Cefálico</p>
                      <p className="text-lg">{ultimaMedicao.perimetro_cefalico || "N/A"}</p>
                    </div>
                  </div>
                  
                  {/* Modified button layout to match the reference image */}
                  <div className="flex justify-between border-t pt-3 mt-4">
                    <Button 
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/pacientes/${id}/nova-medicao`)}
                      className="px-4"
                    >
                      Edição
                    </Button>
                    
                    <Button 
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/pacientes/${id}/historico`)}
                      className="flex items-center gap-1 px-4"
                    >
                      <RotateCcw className="h-3.5 w-3.5 mr-1" />
                      Ver histórico completo
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted-foreground">Nenhuma avaliação craniana cadastrada</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2"
                    onClick={() => navigate(`/pacientes/${id}/nova-medicao`)}
                  >
                    Realizar Avaliação
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="prontuarios">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Histórico de Prontuários</CardTitle>
                <Button 
                  onClick={() => navigate(`/pacientes/${id}/prontuario`)}
                  className="bg-turquesa hover:bg-turquesa/90"
                >
                  <FilePlus className="h-4 w-4 mr-2" />
                  Nova Consulta
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {prontuarios.length > 0 ? (
                <div className="space-y-3">
                  {prontuarios.map((pront, index) => (
                    <div
                      key={pront.id}
                      className="p-4 rounded-lg border hover:border-turquesa/50 hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => navigate(`/pacientes/${id}/prontuario/${pront.id}`)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">
                            Consulta em {formatarData(pront.data_criacao)}
                          </span>
                        </div>
                        {index === 0 && (
                          <span className="text-xs bg-turquesa/10 text-turquesa px-2 py-1 rounded">
                            Mais recente
                          </span>
                        )}
                      </div>
                      
                      <div className="space-y-1">
                        {pront.diagnostico && (
                          <div className="flex items-start gap-2">
                            <Activity className="h-3 w-3 text-muted-foreground mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {pront.diagnostico.split('\n')[0].substring(0, 100)}
                              {pront.diagnostico.length > 100 ? "..." : ""}
                            </p>
                          </div>
                        )}
                        
                        {pront.cid && (
                          <div className="flex items-center gap-1">
                            <span className="text-xs bg-muted px-2 py-1 rounded">
                              CID: {pront.cid}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground mb-4">Nenhum prontuário registrado</p>
                  <Button 
                    onClick={() => navigate(`/pacientes/${id}/prontuario`)}
                    className="bg-turquesa hover:bg-turquesa/90"
                  >
                    <FilePlus className="h-4 w-4 mr-2" />
                    Criar Primeiro Prontuário
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="medicoes">
          <Card>
            <CardContent className="pt-6">
              {medicoes.length > 0 ? (
                <MedicoesHistoricoTable 
                  medicoes={medicoes}
                  dataNascimento={paciente.data_nascimento}
                  pacienteId={id || ''}
                  showFullHistoryButton={true}
                />
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted-foreground">Nenhuma medição registrada</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2"
                    onClick={() => navigate(`/pacientes/${id}/nova-medicao`)}
                  >
                    Registrar Medição
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="editar">
          <Card>
            <CardHeader>
              <CardTitle>Editar Paciente</CardTitle>
            </CardHeader>
            <CardContent>
              <EditarPacienteForm
                paciente={paciente}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="flex flex-col md:flex-row gap-4 mt-4">
        {/* Keep existing buttons */}
        <Button
          className="flex-1 bg-primary hover:bg-primary/90 text-white"
          onClick={() => navigate(`/pacientes/${id}/nova-medicao`)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Nova Medição Manual
        </Button>
        
        <Button
          className="flex-1 bg-turquesa hover:bg-turquesa/90 text-white"
          onClick={() => navigate(`/pacientes/${id}/medicao-por-foto`)}
        >
          <Camera className="w-4 h-4 mr-2" />
          Medição por Foto
        </Button>
        
        {/* Add new Multi-Angle button */}
        <Button
          className="flex-1 bg-green-500 hover:bg-green-600 text-white"
          onClick={() => navigate(`/pacientes/${id}/medicao-multi-angulo`)}
        >
          <Camera className="w-4 h-4 mr-2" />
          Medição Multi-Ângulo
        </Button>
      </div>
    </div>
  );
}
