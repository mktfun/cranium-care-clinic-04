
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, CheckCircle, Clock, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Task {
  id: string;
  title: string;
  dueDate: string;
  status: string;
  patientId: string;
  patientName: string;
  responsible: string;
}

// Dados mockados como fallback caso não consiga carregar do Supabase
const fallbackTasks = [
  {
    id: "task-1",
    title: "Reavaliação craniana de João da Silva",
    dueDate: "2025-05-05",
    status: "pending",
    patientId: "1",
    patientName: "João da Silva",
    responsible: "Dr. Ana"
  },
  {
    id: "task-2",
    title: "Verificar adaptação à órtese de Maria Oliveira",
    dueDate: "2025-05-03",
    status: "pending",
    patientId: "2",
    patientName: "Maria Oliveira",
    responsible: "Dr. Ana"
  },
  {
    id: "task-3",
    title: "Encaminhar Lucas Mendes para avaliação neurológica",
    dueDate: "2025-05-02",
    status: "pending",
    patientId: "3",
    patientName: "Lucas Mendes",
    responsible: "Dr. Ana"
  }
];

export function UrgentTasksCard() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTasks() {
      try {
        // Buscar tarefas do Supabase (vamos recuperar as próximas medições agendadas como tarefas)
        const { data: pacientesData, error: pacientesError } = await supabase
          .from('pacientes')
          .select('id, nome')
          .limit(5);
        
        if (pacientesError) {
          console.error("Erro ao buscar pacientes:", pacientesError);
          setTasks(fallbackTasks);
          return;
        }
        
        if (pacientesData && pacientesData.length > 0) {
          // Buscar a última medição de cada paciente
          const { data: medicoesData } = await supabase
            .from('medicoes')
            .select('*')
            .order('data', { ascending: false });
            
          if (medicoesData && medicoesData.length > 0) {
            // Criar tarefas baseadas em pacientes e suas últimas medições
            const taskFromMedicoes: Task[] = pacientesData.slice(0, 3).map((paciente, index) => {
              const medicoesDoPaciente = medicoesData.filter(m => m.paciente_id === paciente.id);
              const ultimaMedicao = medicoesDoPaciente[0];
              
              // Calcular próxima data de avaliação baseada no status
              const dataUltimaMedicao = ultimaMedicao ? new Date(ultimaMedicao.data) : new Date();
              let proximaAvaliacao = new Date(dataUltimaMedicao);
              
              // Definir próxima avaliação baseada no status
              if (ultimaMedicao) {
                switch(ultimaMedicao.status) {
                  case 'normal': 
                    proximaAvaliacao.setMonth(dataUltimaMedicao.getMonth() + 3); // 3 meses
                    break;
                  case 'leve': 
                    proximaAvaliacao.setMonth(dataUltimaMedicao.getMonth() + 2); // 2 meses
                    break;
                  case 'moderada': 
                  case 'severa': 
                    proximaAvaliacao.setMonth(dataUltimaMedicao.getMonth() + 1); // 1 mês
                    break;
                  default:
                    proximaAvaliacao.setMonth(dataUltimaMedicao.getMonth() + 2); // padrão
                }
              } else {
                // Se não houver medições, agenda para 1 semana no futuro
                proximaAvaliacao.setDate(dataUltimaMedicao.getDate() + 7);
              }
              
              const titulo = ultimaMedicao 
                ? `Reavaliação craniana de ${paciente.nome}` 
                : `Avaliação inicial de ${paciente.nome}`;
                
              return {
                id: `task-${paciente.id}-${index}`,
                title: titulo,
                dueDate: proximaAvaliacao.toISOString().split('T')[0],
                status: "pending",
                patientId: paciente.id,
                patientName: paciente.nome,
                responsible: "Dr. Ana"
              };
            });
            
            setTasks(taskFromMedicoes.length > 0 ? taskFromMedicoes : fallbackTasks);
          } else {
            setTasks(fallbackTasks);
          }
        } else {
          setTasks(fallbackTasks);
        }
      } catch (error) {
        console.error("Erro ao carregar tarefas:", error);
        setTasks(fallbackTasks);
      } finally {
        setLoading(false);
      }
    }
    
    fetchTasks();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR').format(date);
  };

  const handleTaskClick = (patientId: string) => {
    navigate(`/pacientes/${patientId}`);
  };

  const handleViewAllTasks = () => {
    navigate("/tarefas");
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg">Tarefas Urgentes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : tasks.length > 0 ? (
          tasks.map(task => (
            <div 
              key={task.id}
              onClick={() => handleTaskClick(task.patientId)}
              className="p-3 border rounded-md hover:bg-muted/10 cursor-pointer transition-colors"
            >
              <h4 className="font-medium text-sm">{task.title}</h4>
              <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>{formatDate(task.dueDate)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{task.responsible}</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-4 text-muted-foreground">
            Nenhuma tarefa urgente encontrada
          </div>
        )}
        <div className="flex justify-center pt-2">
          <Button 
            variant="outline" 
            className="w-full text-sm"
            onClick={handleViewAllTasks}
          >
            Ver todas as tarefas
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
