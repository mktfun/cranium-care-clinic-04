import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EditarPacienteForm } from "@/components/EditarPacienteForm";
import { PatientTasks } from "@/components/PatientTasks";
import { MedicaoDetails } from "@/components/MedicaoDetails";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Import the newly created components
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
          let patientId = id;
          let isValidUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(patientId);
          
          if (!isValidUuid) {
            const { data: matchedPatient } = await supabase
              .from('pacientes')
              .select('id')
              .filter('id', 'ilike', `%${patientId}%`)
              .maybeSingle();
              
            if (matchedPatient) {
              patientId = matchedPatient.id;
            }
          }
          
          const { data: pacienteData, error } = await supabase
            .from('pacientes')
            .select('*')
            .eq('id', patientId)
            .maybeSingle();
          
          if (error || !pacienteData) {
            toast.error("Paciente não encontrado");
            navigate("/pacientes");
            return;
          } else {
            setPaciente(pacienteData);
            
            const { data: medicoesData, error: medicoesError } = await supabase
              .from('medicoes')
              .select('*')
              .eq('paciente_id', patientId)
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
  }, [id, navigate]);
  
  if (loading) {
    return <div className="p-8 flex justify-center">Carregando...</div>;
  }
  
  if (!paciente) {
    return <div className="p-8 flex justify-center">Paciente não encontrado</div>;
  }
  
  const ultimaMedicao = medicoes.length > 0 ? medicoes[0] : null;
  
  const handleMedicaoClick = (medicao: any) => {
    setSelectedMedicao(medicao);
    setIsDetailDialogOpen(true);
  };

  const handleEditMedicao = (medicao: any, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/pacientes/${id}/medicao/${medicao.id}/editar`);
  };

  // Get patient data and normalize field names
  const dataNascimento = paciente.dataNascimento || paciente.data_nascimento;
  const sexo = paciente.sexo || 'M';
  const responsaveis = paciente.responsaveis || [];
  
  return (
    <div className="space-y-6 animate-fade-in">
      <PatientHeader 
        id={id || ""} 
        nome={paciente.nome} 
        dataNascimento={dataNascimento} 
        onEditClick={() => setIsEditDialogOpen(true)} 
      />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <LastMeasurementCard 
            pacienteId={id || ""} 
            ultimaMedicao={ultimaMedicao} 
            dataNascimento={dataNascimento} 
          />
        </div>
        
        <div className="space-y-6">
          <PatientInfoCard 
            sexo={sexo}
            dataNascimento={dataNascimento}
            ultimaMedicaoData={ultimaMedicao?.data}
            medicationsCount={medicoes.length}
            responsaveis={responsaveis}
          />
          
          <PatientTasks patientId={id || ""} />
        </div>
      </div>
      
      <MeasurementCharts 
        medicoes={medicoes} 
        dataNascimento={dataNascimento} 
        sexoPaciente={sexo} 
      />
      
      <MeasurementHistoryTable 
        medicoes={medicoes} 
        pacienteDOB={dataNascimento} 
        onMedicaoClick={handleMedicaoClick}
        onEditClick={handleEditMedicao}
      />

      {/* Dialog for editing patient information */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Paciente</DialogTitle>
          </DialogHeader>
          {paciente && (
            <EditarPacienteForm 
              paciente={paciente} 
              onSuccessCallback={() => {
                setIsEditDialogOpen(false);
                // Refetch data to update UI
                if (id) {
                  setLoading(true);
                  async function refetch() {
                    const { data: pacienteData, error } = await supabase
                      .from('pacientes')
                      .select('*')
                      .eq('id', id)
                      .maybeSingle();
                    if (error) {
                      toast.error('Erro ao recarregar dados do paciente.');
                    } else if (pacienteData) {
                      setPaciente(pacienteData);
                    }
                    setLoading(false);
                  }
                  refetch();
                }
              }}
            />
          )}
        </DialogContent>
      </Dialog>
      
      {/* Dialog for measurement details */}
      {selectedMedicao && (
        <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Detalhes da Medição</DialogTitle>
            </DialogHeader>
            <MedicaoDetails 
              medicao={selectedMedicao} 
              pacienteNascimento={dataNascimento} 
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
