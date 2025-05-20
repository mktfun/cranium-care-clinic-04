import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Loader2, ChevronLeft, FileText, Edit, History, Plus, Camera } from "lucide-react";
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

export default function DetalhePaciente() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [paciente, setPaciente] = useState<Paciente | null>(null);
  const [prontuario, setProntuario] = useState<any | null>(null);
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
            
            // Fetch patient's medical record
            const { data: prontuarioData, error: prontuarioError } = await supabase
              .from('prontuarios')
              .select('*')
              .eq('paciente_id', id)
              .maybeSingle();
              
            if (prontuarioError) {
              console.error("Erro ao carregar prontuário:", prontuarioError);
            } else {
              setProntuario(prontuarioData);
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
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/pacientes")}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-3xl font-bold">{paciente.nome}</h2>
            <p className="text-muted-foreground">
              Cadastrado em: {formatarData(paciente.created_at || '')}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
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

      <Separator />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="resumo">Resumo</TabsTrigger>
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
                  
                  <div className="flex justify-end space-x-2">
                    <Button 
                      variant="outline"
                      onClick={() => navigate(`/pacientes/${id}/nova-medicao`)}
                    >
                      Nova medição
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => navigate(`/pacientes/${id}/historico`)}
                      className="flex items-center gap-1"
                    >
                      <History className="h-4 w-4" />
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
        
        <TabsContent value="medicoes">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Histórico de Medições</CardTitle>
              <Button 
                variant="outline"
                onClick={() => navigate(`/pacientes/${id}/historico`)}
                className="flex items-center gap-1"
              >
                <History className="h-4 w-4" />
                Ver histórico completo
              </Button>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                {medicoes.length > 0 ? (
                  <MedicoesHistoricoTable 
                    medicoes={medicoes}
                    dataNascimento={paciente.data_nascimento}
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
              </div>
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
