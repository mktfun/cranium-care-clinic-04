
import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { toast } from "sonner";
import { Plus, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface PatientTasksProps {
  patientId: string;
}

interface Task {
  id: string;
  titulo: string;
  paciente_id: string;
  due_date: string;
  status: 'pendente' | 'concluida' | 'atrasada';
  user_id?: string;
}

export function PatientTasks({ patientId }: PatientTasksProps) {
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch patient tasks (mock data for now)
  useEffect(() => {
    async function fetchTasks() {
      try {
        setIsLoading(true);
        // Mock data since we don't have a tarefas table yet
        const mockTasks: Task[] = [
          {
            id: "1",
            titulo: "Agendar retorno em 3 meses",
            paciente_id: patientId,
            status: "pendente",
            due_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          },
          {
            id: "2",
            titulo: "Analisar últimas medições",
            paciente_id: patientId,
            status: "pendente",
            due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          }
        ];
        
        setTasks(mockTasks);
      } catch (err) {
        console.error("Failed to fetch tasks:", err);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchTasks();
  }, [patientId]);
  
  // Add new task
  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newTaskTitle.trim()) {
      toast.error("O título da tarefa não pode estar vazio");
      return;
    }
    
    try {
      // Set due date to tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const newTask: Task = {
        id: `task-${Date.now()}`,
        titulo: newTaskTitle,
        paciente_id: patientId,
        status: 'pendente',
        due_date: tomorrow.toISOString().split('T')[0]
      };
      
      // In a real app, we would save to the database here
      // For now, just update the local state
      setTasks([newTask, ...tasks]);
      toast.success("Tarefa adicionada com sucesso");
      setNewTaskTitle("");
      setIsAddingTask(false);
    } catch (err) {
      console.error("Failed to add task:", err);
      toast.error("Erro ao adicionar tarefa");
    }
  };
  
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('pt-BR', options);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Tarefas</CardTitle>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setIsAddingTask(!isAddingTask)}
          >
            <Plus className="h-4 w-4 mr-1" /> 
            Adicionar
          </Button>
        </div>
        <CardDescription>
          Tarefas relacionadas a este paciente
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {isAddingTask && (
          <form onSubmit={handleAddTask} className="mb-4">
            <div className="flex gap-2">
              <Input
                placeholder="Nova tarefa..."
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                className="flex-1"
              />
              <Button type="submit">Salvar</Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setIsAddingTask(false);
                  setNewTaskTitle("");
                }}
              >
                Cancelar
              </Button>
            </div>
          </form>
        )}
        
        <div className="space-y-3">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Carregando tarefas...</p>
          ) : tasks.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma tarefa pendente para este paciente.</p>
          ) : (
            tasks.map((task) => (
              <div key={task.id} className="border rounded-md p-3 flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium">{task.titulo}</p>
                  <div className="flex items-center mt-1">
                    <Calendar className="h-3 w-3 mr-1 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {formatDate(task.due_date)}
                    </span>
                  </div>
                </div>
                <div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => navigate(`/tarefas/${task.id}`)}
                  >
                    Ver
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
      
      <CardFooter className="pt-0">
        <Button 
          variant="link" 
          className="px-0"
          onClick={() => navigate(`/tarefas?paciente=${patientId}`)}
        >
          Ver todas as tarefas
        </Button>
      </CardFooter>
    </Card>
  );
}
