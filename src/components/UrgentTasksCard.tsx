
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Clock, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { SeverityLevel } from "@/components/StatusBadge";

interface Task {
  id: string;
  paciente_id: string;
  paciente_nome?: string;
  title: string;
  description?: string;
  due_date: string;
  status: "pendente" | "concluida" | "cancelada";
  priority: "baixa" | "media" | "alta" | "urgente";
  tipo?: string;
}

export function UrgentTasksCard() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUrgentTasks() {
      setLoading(true);
      try {
        // Buscar tarefas urgentes ou de alta prioridade que estão pendentes
        const { data, error } = await supabase
          .from('tarefas')
          .select('*, pacientes(nome)')
          .in('priority', ['urgente', 'alta'])
          .eq('status', 'pendente')
          .order('due_date', { ascending: true })
          .limit(5);
          
        if (error) {
          console.error("Error fetching urgent tasks:", error);
          toast.error("Erro ao carregar tarefas urgentes");
          return;
        }
        
        // Formatar os dados para incluir o nome do paciente diretamente no objeto de tarefa
        const formattedTasks = data?.map(task => ({
          ...task,
          paciente_nome: task.pacientes?.nome
        })) || [];
        
        setTasks(formattedTasks);
      } catch (err) {
        console.error("Unexpected error fetching urgent tasks:", err);
        toast.error("Erro inesperado ao carregar tarefas");
      } finally {
        setLoading(false);
      }
    }
    
    fetchUrgentTasks();
  }, []);
  
  const getPriorityBadgeVariant = (priority: string): {variant: string, label: string} => {
    switch (priority) {
      case "urgente":
        return { variant: "destructive", label: "Urgente" };
      case "alta":
        return { variant: "destructive", label: "Alta" };
      case "media":
        return { variant: "default", label: "Média" };
      case "baixa":
        return { variant: "outline", label: "Baixa" };
      default:
        return { variant: "outline", label: "Normal" };
    }
  };
  
  const getStatusSeverity = (dueDate: string): { level: string, text: string } => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Midnight today
    const dueDateTime = new Date(dueDate);
    dueDateTime.setHours(0, 0, 0, 0); // Midnight due date
    
    const diffTime = dueDateTime.getTime() - today.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    
    if (diffDays < 0) {
      return { level: "severa", text: "Atrasada" };
    } else if (diffDays === 0) {
      return { level: "moderada", text: "Hoje" };
    } else if (diffDays <= 2) {
      return { level: "leve", text: "Em breve" };
    } else {
      return { level: "normal", text: "No prazo" };
    }
  };
  
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('pt-BR');
    } catch {
      return "Data inválida";
    }
  };
  
  const handleMarkComplete = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tarefas')
        .update({ status: 'concluida' })
        .eq('id', taskId);
        
      if (error) {
        console.error("Error completing task:", error);
        toast.error("Erro ao concluir tarefa");
        return;
      }
      
      // Atualizar o estado local para refletir a mudança
      setTasks(tasks.filter(task => task.id !== taskId));
      toast.success("Tarefa concluída com sucesso!");
    } catch (err) {
      console.error("Unexpected error completing task:", err);
      toast.error("Erro inesperado ao concluir tarefa");
    }
  };
  
  const handleMarkCancelled = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tarefas')
        .update({ status: 'cancelada' })
        .eq('id', taskId);
        
      if (error) {
        console.error("Error cancelling task:", error);
        toast.error("Erro ao cancelar tarefa");
        return;
      }
      
      // Atualizar o estado local para refletir a mudança
      setTasks(tasks.filter(task => task.id !== taskId));
      toast.success("Tarefa cancelada com sucesso!");
    } catch (err) {
      console.error("Unexpected error cancelling task:", err);
      toast.error("Erro inesperado ao cancelar tarefa");
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center">
          <Clock className="h-5 w-5 mr-2 text-amber-500" />
          Tarefas Urgentes
        </CardTitle>
        <CardDescription>Tarefas que precisam de atenção imediata</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center text-muted-foreground py-6">Carregando tarefas...</div>
        ) : tasks.length === 0 ? (
          <div className="text-center text-muted-foreground py-6">
            Nenhuma tarefa urgente pendente
          </div>
        ) : (
          <div className="space-y-4">
            {tasks.map((task) => {
              const status = getStatusSeverity(task.due_date);
              const priority = getPriorityBadgeVariant(task.priority);
              
              return (
                <div 
                  key={task.id} 
                  className="border rounded-lg p-4 hover:border-primary/50 transition-colors cursor-pointer"
                  onClick={() => navigate(`/pacientes/${task.paciente_id}`)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1 mr-4">
                      <h4 className="font-medium">{task.title}</h4>
                      {task.paciente_nome && (
                        <div className="text-sm text-muted-foreground">
                          Paciente: {task.paciente_nome}
                        </div>
                      )}
                    </div>
                    <Badge variant={priority.variant as any}>{priority.label}</Badge>
                  </div>
                  
                  <div className="flex justify-between items-center mt-3">
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={status.level === "normal" ? "outline" : "secondary"}
                        className={`${status.level === "severa" ? "bg-red-500 hover:bg-red-500/90 text-white" : ""}`}
                      >
                        {status.text}: {formatDate(task.due_date)}
                      </Badge>
                      {task.tipo && (
                        <Badge variant="outline">{task.tipo}</Badge>
                      )}
                    </div>
                    
                    <div className="flex gap-1">
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-7 w-7 text-green-600 hover:text-green-700 hover:bg-green-50"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkComplete(task.id);
                        }}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-7 w-7 text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkCancelled(task.id);
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-7 w-7"
                        onClick={() => navigate(`/tarefas/${task.id}`)}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
            
            <div className="text-center pt-2">
              <Button
                variant="outline"
                onClick={() => navigate("/tarefas")}
              >
                Ver todas tarefas
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
