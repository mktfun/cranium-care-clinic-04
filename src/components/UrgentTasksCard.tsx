import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Loader2 } from "lucide-react"; // Removido CheckCircle que não era usado
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
// import { toast } from "sonner"; // Removido toast pois não estava sendo usado para erros aqui
import { getCranialStatus, SeverityLevel } from "@/lib/cranial-utils"; // Importando getCranialStatus

interface Task {
  id: string;
  title: string;
  dueDate: string;
  status: string; // "pending", "completed", etc.
  patientId: string;
  patientName: string;
  responsible?: string; // Tornar opcional, pois pode não vir sempre do backend
}

export function UrgentTasksCard() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTasks() {
      setLoading(true);
      let urgentTasks: Task[] = [];
      try {
        const { data: pacientesData, error: pacientesError } = await supabase
          .from("pacientes")
          .select("id, nome, medicoes(id, data, indice_craniano, cvai)") // Fetching medicoes directly
          .order("created_at", { ascending: false }); // Ordenar por mais recentes ou outro critério

        if (pacientesError) {
          console.error("Erro ao buscar pacientes e suas medições:", pacientesError);
          setTasks([]); // Define como vazio em caso de erro
          setLoading(false);
          return;
        }

        if (pacientesData) {
          const hoje = new Date();
          const inicioHoje = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());

          pacientesData.forEach((paciente: any) => {
            if (paciente.medicoes && paciente.medicoes.length > 0) {
              // Ordenar medições do paciente pela data mais recente primeiro
              const medicoesOrdenadas = [...paciente.medicoes].sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
              const ultimaMedicao = medicoesOrdenadas[0];
              
              const { severityLevel } = getCranialStatus(ultimaMedicao.indice_craniano || 0, ultimaMedicao.cvai || 0);
              const dataUltimaMedicao = new Date(ultimaMedicao.data);
              let proximaAvaliacao = new Date(dataUltimaMedicao);

              switch(severityLevel) {
                case SeverityLevel.Normal: proximaAvaliacao.setMonth(dataUltimaMedicao.getMonth() + 3); break;
                case SeverityLevel.Leve: proximaAvaliacao.setMonth(dataUltimaMedicao.getMonth() + 2); break;
                case SeverityLevel.Moderada: proximaAvaliacao.setMonth(dataUltimaMedicao.getMonth() + 1); break;
                case SeverityLevel.Severa: proximaAvaliacao.setMonth(dataUltimaMedicao.getMonth() + 1); break;
                default: proximaAvaliacao.setMonth(dataUltimaMedicao.getMonth() + 2); // Padrão de 2 meses
              }
              
              // Considerar tarefa urgente se a próxima avaliação for nos próximos 7 dias ou estiver atrasada
              const diffTime = proximaAvaliacao.getTime() - inicioHoje.getTime();
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

              if (diffDays <= 7) { // Inclui tarefas atrasadas (diffDays negativo) e para os próximos 7 dias
                urgentTasks.push({
                  id: `task-reav-${paciente.id}-${ultimaMedicao.id}`,
                  title: `Reavaliação de ${paciente.nome}`,
                  dueDate: proximaAvaliacao.toISOString().split("T")[0],
                  status: "pending",
                  patientId: paciente.id,
                  patientName: paciente.nome,
                  responsible: "Clínica" // Pode ser ajustado se houver um médico responsável pela tarefa
                });
              }
            }
          });
          
          // Ordenar tarefas pela data de vencimento mais próxima
          urgentTasks.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
          setTasks(urgentTasks.slice(0, 3)); // Limitar a 3 tarefas no card
        } else {
          setTasks([]); // Nenhum paciente encontrado
        }

      } catch (error) {
        console.error("Erro ao carregar tarefas urgentes:", error);
        setTasks([]); // Define como vazio em caso de erro genérico
      } finally {
        setLoading(false);
      }
    }
    
    fetchTasks();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    // Adicionar verificação para datas inválidas que podem vir do toISOString
    if (isNaN(date.getTime())) return "Data inválida";
    return new Intl.DateTimeFormat("pt-BR", {timeZone: "UTC"}).format(date);
  };

  const handleTaskClick = (patientId: string) => {
    navigate(`/pacientes/${patientId}`);
  };

  const handleViewAllTasks = () => {
    // Idealmente, navegar para uma página de tarefas que também use lógica real
    // Por agora, pode ser a página de notificações que lista tarefas também
    navigate("/notificacoes"); 
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="text-lg">Tarefas Urgentes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 flex-grow flex flex-col justify-between">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : tasks.length > 0 ? (
          <div className="space-y-3">
            {tasks.map(task => (
              <div 
                key={task.id}
                onClick={() => handleTaskClick(task.patientId)}
                className="p-3 border rounded-md hover:bg-muted/10 cursor-pointer transition-colors dark:border-gray-700 dark:hover:bg-gray-700/50"
              >
                <h4 className="font-medium text-sm text-card-foreground dark:text-gray-200">{task.title}</h4>
                <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-muted-foreground dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{formatDate(task.dueDate)}</span>
                  </div>
                  {task.responsible && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      <span>{task.responsible}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-muted-foreground flex-grow flex flex-col justify-center items-center">
            <Calendar className="h-10 w-10 mb-2 text-gray-400 dark:text-gray-500" />
            <p>Nenhuma tarefa urgente no momento.</p>
          </div>
        )}
        <div className="pt-2 mt-auto">
          <Button 
            variant="outline"
            className="w-full text-sm dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
            onClick={handleViewAllTasks}
          >
            Ver todas as tarefas
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

