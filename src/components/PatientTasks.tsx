
import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { toast } from "sonner";
import { Plus, Calendar, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "./ui/dialog";

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
  descricao?: string;
}

export function PatientTasks({ patientId }: PatientTasksProps) {
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [newTaskDueDate, setNewTaskDueDate] = useState("");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch real tasks
  useEffect(() => {
    async function fetchTasks() {
      try {
        setIsLoading(true);
        
        // Get user session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user) {
          return;
        }
        
        try {
          // Check if table exists by querying it
          const { data, error } = await supabase
            .from('tarefas')
            .select('*')
            .eq('paciente_id', patientId)
            .order('due_date', { ascending: true });
            
          if (error) {
            console.error("Error fetching tasks:", error);
            // Table likely doesn't exist, show empty state
            setTasks([]);
          } else {
            // Table exists, set tasks data
            setTasks(data || []);
          }
        } catch (err) {
          // Handle case where table doesn't exist
          console.error("Error checking tasks table:", err);
          setTasks([]);
        }
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchTasks();
  }, [patientId]);
  
  // Add new task
  const handleAddTask = async () => {
    if (!newTaskTitle.trim()) {
      toast.error("O título da tarefa não pode estar vazio");
      return;
    }
    
    if (!newTaskDueDate) {
      toast.error("A data de vencimento é obrigatória");
      return;
    }
    
    try {
      // Get user session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        toast.error("Usuário não autenticado");
        return;
      }
      
      // Create task in database if table exists
      try {
        const { data, error } = await supabase
          .from('tarefas')
          .insert([
            {
              titulo: newTaskTitle,
              descricao: newTaskDescription,
              paciente_id: patientId,
              user_id: session.user.id,
              status: 'pendente',
              due_date: newTaskDueDate
            }
          ])
          .select();
          
        if (error) {
          // Table may not exist
          console.error("Error adding task:", error);
          toast.error("Erro ao adicionar tarefa");
        } else {
          // Task added successfully
          toast.success("Tarefa adicionada com sucesso");
          setTasks([...(data || []), ...tasks]);
          setNewTaskTitle("");
          setNewTaskDescription("");
          setNewTaskDueDate("");
          setIsAddingTask(false);
        }
      } catch (err) {
        console.error("Failed to add task:", err);
        toast.error("Erro ao adicionar tarefa");
      }
    } catch (err) {
      console.error("Failed to get session:", err);
      toast.error("Erro ao adicionar tarefa");
    }
  };
  
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('pt-BR', options);
  };

  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Tarefas</CardTitle>
          <Dialog>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                size="sm"
              >
                <Plus className="h-4 w-4 mr-1" /> 
                Adicionar
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Nova Tarefa</DialogTitle>
                <DialogDescription>
                  Adicione uma nova tarefa para este paciente.
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Título da Tarefa</Label>
                  <Input
                    id="title"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="Ex: Agendar retorno"
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="description">Descrição (opcional)</Label>
                  <Textarea
                    id="description"
                    value={newTaskDescription}
                    onChange={(e) => setNewTaskDescription(e.target.value)}
                    placeholder="Detalhes adicionais sobre a tarefa..."
                    rows={3}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="dueDate">Data de Vencimento</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={newTaskDueDate}
                    onChange={(e) => setNewTaskDueDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    defaultValue={getTomorrowDate()}
                  />
                </div>
              </div>
              
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    Cancelar
                  </Button>
                </DialogClose>
                <Button type="button" onClick={handleAddTask}>Salvar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        <CardDescription>
          Tarefas relacionadas a este paciente
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : tasks.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">
              Nenhuma tarefa pendente para este paciente.
            </p>
          ) : (
            tasks.map((task) => (
              <div key={task.id} className="border rounded-md p-3 flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium">{task.titulo}</p>
                  {task.descricao && (
                    <p className="text-xs text-muted-foreground mt-1">{task.descricao}</p>
                  )}
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
      
      {tasks.length > 0 && (
        <CardFooter className="pt-0">
          <Button 
            variant="link" 
            className="px-0"
            onClick={() => navigate(`/tarefas?paciente=${patientId}`)}
          >
            Ver todas as tarefas
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
