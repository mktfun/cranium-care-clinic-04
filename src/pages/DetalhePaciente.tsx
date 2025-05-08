
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Edit3, Plus, User } from "lucide-react";
import { obterPacientePorId } from "@/data/mock-data";
import { StatusBadge } from "@/components/StatusBadge";
import { MedicaoLineChart } from "@/components/MedicaoLineChart";
import { PatientTasks } from "@/components/PatientTasks";
import { EditarPacienteForm } from "@/components/EditarPacienteForm";
import { MedicaoDetails } from "@/components/MedicaoDetails";
import { formatAge, formatAgeHeader } from "@/lib/age-utils";
import { getCranialStatus } from "@/lib/cranial-utils";

export default function DetalhePaciente() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [paciente, setPaciente] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  // Load patient data
  useEffect(() => {
    if (id) {
      const pacienteData = obterPacientePorId(id);
      setPaciente(pacienteData);
    }
  }, [id]);
  
  // Handle loading state
  if (!paciente) {
    return <div className="p-8 flex justify-center">Carregando...</div>;
  }
  
  const ultimaMedicao = paciente.medicoes.length > 0 
    ? [...paciente.medicoes].sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())[0]
    : null;
  
  // Format date
  const formatarData = (dataString: string) => {
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR');
  };
  
  // Get current age string
  const idadeAtual = formatAgeHeader(paciente.dataNascimento);
  
  // Get asymmetry type and severity for the last measurement
  const { asymmetryType, severityLevel } = ultimaMedicao
    ? getCranialStatus(ultimaMedicao.indiceCraniano, ultimaMedicao.cvai)
    : { asymmetryType: "Normal", severityLevel: "normal" };
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold">{paciente.nome}</h2>
          <p className="text-muted-foreground">
            {idadeAtual} • Nasc.: {formatarData(paciente.dataNascimento)}
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
                  pacienteNascimento={paciente.dataNascimento}
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
                  >
                    Gerar Relatório
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
          
          <div className="mt-6">
            <MedicaoLineChart 
              titulo="Evolução das Medições" 
              medicoes={paciente.medicoes} 
              dataNascimento={paciente.dataNascimento}
              sexoPaciente={paciente.sexo}
            />
          </div>
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
                      <span className="ml-2">{formatAge(paciente.dataNascimento, ultimaMedicao.data)}</span>
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
                  {paciente.medicoes.length} medição(ões)
                </div>
              </div>
              
              <div>
                <div className="text-muted-foreground mb-1">Responsáveis</div>
                {paciente.responsaveis.map((resp: any, index: number) => (
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
      
      <div className="mt-8">
        <Tabs defaultValue="historico">
          <TabsList>
            <TabsTrigger value="historico">Histórico de Medições</TabsTrigger>
          </TabsList>
          
          <TabsContent value="historico">
            <Card>
              <CardContent className="py-6">
                {paciente.medicoes.length > 0 ? (
                  <div className="space-y-4">
                    {[...paciente.medicoes]
                      .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
                      .map((medicao: any) => (
                        <MedicaoDetails 
                          key={medicao.id}
                          medicao={medicao}
                          pacienteNascimento={paciente.dataNascimento}
                        />
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
    </div>
  );
}
