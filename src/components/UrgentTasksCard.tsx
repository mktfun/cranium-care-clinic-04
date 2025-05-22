
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Clock, ChevronRight, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

export interface Task {
  id: string;
  paciente_id: string;
  paciente_nome?: string;
  titulo: string;
  descricao?: string;
  due_date: string;
  status: string;
  priority?: string; 
  tipo?: string;
  responsible?: string;
}

export function UrgentTasksCard() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUrgentTasks = async () => {
      setLoading(true);
      try {
        // Get current date
        const today = new Date();
        const formattedDate = today.toISOString().split('T')[0]; // YYYY-MM-DD format
        
        // Query tasks that are urgent or high priority and not completed
        const { data, error } = await supabase
          .from('tarefas')
          .select(`
            id,
            titulo,
            descricao,
            paciente_id,
            due_date,
            status,
            responsible,
            pacientes(nome)
          `)
          .in('status', ['pendente', 'overdue'])
          .lte('due_date', formattedDate)
          .order('due_date', { ascending: true })
          .limit(3);

        if (error) {
          console.error("Error fetching urgent tasks:", error);
          throw error;
        }

        // Format the tasks with proper structure
        const formattedTasks = data?.map(item => ({
          id: item.id,
          paciente_id: item.paciente_id,
          paciente_nome: item.pacientes?.nome || "Paciente não encontrado",
          titulo: item.titulo,
          descricao: item.descricao || "",
          due_date: item.due_date,
          status: item.due_date < formattedDate ? "overdue" : item.status,
          priority: 'alta', // Todas são urgentes neste card
          tipo: "Tarefa", // Default tipo
          responsible: item.responsible || "Não atribuído"
        })) || [];

        setTasks(formattedTasks);
      } catch (err) {
        console.error("Unexpected error fetching urgent tasks:", err);
        toast({
          title: "Erro",
          description: "Erro ao carregar tarefas urgentes",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
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
        throw error;
      }
      
      // Remove from list
      setTasks(tasks.filter(task => task.id !== taskId));
      toast({
        title: "Sucesso",
        description: "Tarefa concluída com sucesso!"
      });
    } catch (err) {
      console.error("Unexpected error completing task:", err);
      toast({
        title: "Erro",
        description: "Erro ao concluir tarefa",
        variant: "destructive"
      });
    }
  };
  
  const handleMarkCancelled = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tarefas')
        .update({ status: 'cancelada' })
        .eq('id', taskId);
        
      if (error) {
        throw error;
      }
      
      // Remove from list
      setTasks(tasks.filter(task => task.id !== taskId));
      toast({
        title: "Sucesso",
        description: "Tarefa cancelada com sucesso!"
      });
    } catch (err) {
      console.error("Unexpected error cancelling task:", err);
      toast({
        title: "Erro",
        description: "Erro ao cancelar tarefa",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="h-full max-h-[350px] overflow-y-auto flex flex-col border-2 border-blue-100 rounded-xl">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-amber-500" />
          <CardTitle className="text-lg font-medium">Tarefas Urgentes</CardTitle>
        </div>
        <CardDescription>Tarefas que precisam de atenção imediata</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center items-center text-muted-foreground py-6">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Carregando tarefas...</span>
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center text-muted-foreground py-6">
            <p className="mb-4">Nenhuma tarefa urgente pendente</p>
            <Button 
              onClick={() => navigate("/tarefas")} 
              variant="outline"
              className="bg-blue-500 text-white hover:bg-blue-600"
            >
              Gerenciar Tarefas
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {tasks.map((task) => {
              const status = getStatusSeverity(task.due_date);
              const priority = getPriorityBadgeVariant(task.priority || 'alta');
              
              return (
                <div 
                  key={task.id} 
                  className="border rounded-lg p-4 hover:border-primary/50 transition-colors cursor-pointer"
                  onClick={() => navigate(`/pacientes/${task.paciente_id}`)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1 mr-4">
                      <h4 className="font-medium">{task.titulo}</h4>
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
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/tarefas`);
                        }}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
            
            <div className="text-center pt-2 pb-1">
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
