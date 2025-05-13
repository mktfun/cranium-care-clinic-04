
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { EditarPacienteForm } from "@/components/EditarPacienteForm";
import { MedicaoDetails } from "@/components/MedicaoDetails";
import { PatientTasks } from "@/components/PatientTasks";
import { formatAgeHeader } from "@/lib/age-utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { PatientHeader } from "@/components/patient/PatientHeader";
import { LastMeasurementCard } from "@/components/patient/LastMeasurementCard";
import { PatientInfoCard } from "@/components/patient/PatientInfoCard";
import { MeasurementCharts } from "@/components/patient/MeasurementCharts";
import { MeasurementHistoryTable } from "@/components/patient/MeasurementHistoryTable";

export default function DetalhePaciente() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [paciente, setPaciente] = useState<any>(null);
  const [medicoes, setMedicoes] = useState<any[]>([]);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedMedicao, setSelectedMedicao] = useState<any>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  
  useEffect(() => {
    async function fetchData() {
      if (id) {
        setLoading(true);
        try {
          // O ID pode ser um UUID ou um nome parcial, a lógica de busca no Supabase já trata isso.
          const { data: pacienteData, error: pacienteError } = await supabase
            .from('pacientes')
            .select('*')
            .eq('id', id)
            .maybeSingle();
          
          if (pacienteError) {
            console.error('Error fetching patient data:', pacienteError);
            toast.error('Erro ao carregar dados do paciente.');
            setPaciente(null); // Define como null se houver erro
            setMedicoes([]);
            setLoading(false);
            return;
          }

          if (!pacienteData) {
            toast.error('Paciente não encontrado.');
            setPaciente(null); // Define como null se não encontrado
            setMedicoes([]);
            setLoading(false);
            // Opcional: redirecionar para página de pacientes ou 404
            // navigate("/pacientes"); 
            return;
          }
          
          setPaciente(pacienteData);
          
          const { data: medicoesData, error: medicoesError } = await supabase
            .from('medicoes')
            .select('*')
            .eq('paciente_id', pacienteData.id) // Usar o ID real do pacienteData
            .order('data', { ascending: false });
            
          if (medicoesError) {
            console.error('Error fetching medicoes:', medicoesError);
            toast.error('Erro ao carregar medições.');
            setMedicoes([]); // Define como vazio se houver erro nas medições
          } else {
            setMedicoes(medicoesData || []);
          }
        } catch (err) {
          console.error('Unexpected error fetching patient data:', err);
          toast.error('Erro inesperado ao carregar dados do paciente.');
          setPaciente(null);
          setMedicoes([]);
        } finally {
          setLoading(false);
        }
      }
    }
    
    fetchData();
  }, [id, navigate]); // Adicionado navigate às dependências
  
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
  
  const ultimaMedicao = medicoes.length > 0 ? medicoes[0] : null;
  
  const formatarData = (dataString: string) => {
    if (!dataString) return "N/A";
    const data = new Date(dataString);
    // Adicionar verificação para datas inválidas
    if (isNaN(data.getTime())) return "Data inválida";
    return data.toLocaleDateString('pt-BR', { timeZone: 'UTC' }); // Especificar UTC para consistência
  };
  
  const idadeAtual = formatAgeHeader(paciente.data_nascimento);
  
  const handleMedicaoClick = (medicao: any) => {
    setSelectedMedicao(medicao);
    setIsDetailDialogOpen(true);
  };

  const handleEditFormSuccess = async () => {
    setIsEditDialogOpen(false);
    // Re-fetch data to show updated info
    if (id) {
      setLoading(true);
      const { data: updatedPaciente, error } = await supabase
        .from('pacientes')
        .select('*')
        .eq('id', id)
        .single();
      if (updatedPaciente && !error) setPaciente(updatedPaciente);
      setLoading(false);
    }
  };
  
  return (
    <div className="space-y-6 animate-fade-in p-4 md:p-6">
      <PatientHeader 
        paciente={paciente}
        idadeAtual={idadeAtual}
        formatarData={formatarData}
        dataNascimento={paciente.data_nascimento}
        onEditClick={() => setIsEditDialogOpen(true)}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <LastMeasurementCard 
            paciente={paciente}
            ultimaMedicao={ultimaMedicao}
            formatarData={formatarData}
          />
        </div>
        
        <div className="space-y-6">
          <PatientInfoCard 
            paciente={paciente}
            ultimaMedicao={ultimaMedicao}
            medicoesCount={medicoes.length}
          />
          
          <PatientTasks patientId={paciente.id || ""} />
        </div>
      </div>
      
      <MeasurementCharts 
        medicoes={medicoes}
        dataNascimento={paciente.data_nascimento}
        sexoPaciente={paciente.sexo}
      />
      
      <MeasurementHistoryTable 
        medicoes={medicoes}
        pacienteId={paciente.id}
        pacienteDataNascimento={paciente.data_nascimento}
        formatarData={formatarData}
        onMedicaoClick={handleMedicaoClick}
      />

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Editar Dados do Paciente</DialogTitle>
          </DialogHeader>
          {paciente && (
            <EditarPacienteForm 
              paciente={paciente} 
              onSuccess={handleEditFormSuccess}
            />
          )}
        </DialogContent>
      </Dialog>

      {selectedMedicao && (
        <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Detalhes da Medição - {formatarData(selectedMedicao.data)}</DialogTitle>
            </DialogHeader>
            <MedicaoDetails 
              medicao={selectedMedicao} 
              pacienteNascimento={paciente.data_nascimento}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
