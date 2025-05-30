
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, CheckCircle, Circle, Clock, Edit, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Task } from "@/types";

interface PatientTasksProps {
  patientId: string;
}

// Função para transformar dados do Supabase para o tipo Task
const transformSupabaseTaskToTask = (supabaseTask: any): Task => {
  return {
    id: supabaseTask.id,
    titulo: supabaseTask.titulo,
    descricao: supabaseTask.descricao,
    due_date: supabaseTask.due_date,
    status: supabaseTask.status as 'pendente' | 'em_progresso' | 'concluida',
    paciente_id: supabaseTask.paciente_id,
    responsible: supabaseTask.responsible,
    user_id: supabaseTask.user_id,
    created_at: supabaseTask.created_at,
    updated_at: supabaseTask.updated_at
  };
};

export function PatientTasks({ patientId }: PatientTasksProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [isNewTaskDialogOpen, setIsNewTaskDialogOpen] = useState(false);
  const [isEditTaskDialogOpen, setIsEditTaskDialogOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  
  // Form state for new/edit task
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskDueDate, setTaskDueDate] = useState("");
  const [taskResponsible, setTaskResponsible] = useState("");
  const [taskStatus, setTaskStatus] = useState<'pendente' | 'em_progresso' | 'concluida'>('pendente');

  // Fetch tasks from Supabase
  const fetchTasks = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tarefas')
        .select('*')
        .eq('paciente_id', patientId)
        .order('due_date', { ascending: true });

      if (error) {
        console.error('Erro ao buscar tarefas:', error);
        toast.error('Erro ao carregar tarefas');
        return;
      }

      // Transformar dados para o tipo Task correto
      const transformedTasks = (data || []).map(transformSupabaseTaskToTask);
      setTasks(transformedTasks);
    } catch (error) {
      console.error('Erro inesperado:', error);
      toast.error('Erro inesperado ao carregar tarefas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (patientId) {
      fetchTasks();
    }
  }, [patientId]);
  
  const handleCreateTask = async () => {
    if (!taskTitle || !taskDueDate || !taskResponsible) {
      toast.error("Por favor, preencha todos os campos obrigatórios");
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('tarefas')
        .insert({
          titulo: taskTitle,
          descricao: taskDescription,
          due_date: taskDueDate,
          status: 'pendente',
          paciente_id: patientId,
          responsible: taskResponsible,
          user_id: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar tarefa:', error);
        toast.error('Erro ao criar tarefa');
        return;
      }

      const newTask = transformSupabaseTaskToTask(data);
      setTasks([...tasks, newTask]);
      resetTaskForm();
      setIsNewTaskDialogOpen(false);
      toast.success("Tarefa criada com sucesso!");
    } catch (error) {
      console.error('Erro inesperado:', error);
      toast.error('Erro inesperado ao criar tarefa');
    }
  };
  
  const handleEditTask = async () => {
    if (!currentTask || !taskTitle || !taskDueDate || !taskResponsible) {
      toast.error("Por favor, preencha todos os campos obrigatórios");
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('tarefas')
        .update({
          titulo: taskTitle,
          descricao: taskDescription,
          due_date: taskDueDate,
          responsible: taskResponsible,
          status: taskStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', currentTask.id)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar tarefa:', error);
        toast.error('Erro ao atualizar tarefa');
        return;
      }

      const updatedTask = transformSupabaseTaskToTask(data);
      const updatedTasks = tasks.map(task => 
        task.id === currentTask.id ? updatedTask : task
      );
      
      setTasks(updatedTasks);
      resetTaskForm();
      setCurrentTask(null);
      setIsEditTaskDialogOpen(false);
      toast.success("Tarefa atualizada com sucesso!");
    } catch (error) {
      console.error('Erro inesperado:', error);
      toast.error('Erro inesperado ao atualizar tarefa');
    }
  };
  
  const handleDeleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tarefas')
        .delete()
        .eq('id', taskId);

      if (error) {
        console.error('Erro ao excluir tarefa:', error);
        toast.error('Erro ao excluir tarefa');
        return;
      }

      setTasks(tasks.filter(task => task.id !== taskId));
      toast.success("Tarefa excluída com sucesso!");
    } catch (error) {
      console.error('Erro inesperado:', error);
      toast.error('Erro inesperado ao excluir tarefa');
    }
  };
  
  const handleToggleTaskStatus = async (task: Task) => {
    const newStatus = task.status === 'concluida' ? 'pendente' : 'concluida';
    
    try {
      const { data, error } = await supabase
        .from('tarefas')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', task.id)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar status:', error);
        toast.error('Erro ao atualizar status da tarefa');
        return;
      }

      const updatedTask = transformSupabaseTaskToTask(data);
      setTasks(tasks.map(t => t.id === task.id ? updatedTask : t));
    } catch (error) {
      console.error('Erro inesperado:', error);
      toast.error('Erro inesperado ao atualizar status');
    }
  };
  
  const handleOpenEditDialog = (task: Task) => {
    setCurrentTask(task);
    setTaskTitle(task.titulo);
    setTaskDescription(task.descricao || "");
    setTaskDueDate(task.due_date);
    setTaskResponsible(task.responsible || "");
    setTaskStatus(task.status);
    setIsEditTaskDialogOpen(true);
  };
  
  const resetTaskForm = () => {
    setTaskTitle("");
    setTaskDescription("");
    setTaskDueDate("");
    setTaskResponsible("");
    setTaskStatus('pendente');
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR').format(date);
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'concluida': return 'bg-green-500 hover:bg-green-600';
      case 'em_progresso': return 'bg-blue-500 hover:bg-blue-600';
      default: return 'bg-yellow-500 hover:bg-yellow-600';
    }
  };
  
  const getStatusText = (status: string) => {
    switch (status) {
      case 'concluida': return 'Concluída';
      case 'em_progresso': return 'Em Progresso';
      default: return 'Pendente';
    }
  };
  
  const isPastDue = (dateString: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(dateString);
    return dueDate < today && dateString !== '';
  };
  
  // Sort tasks by status and due date
  const sortedTasks = [...tasks].sort((a, b) => {
    // Sort by status priority (pending > in_progress > completed)
    const statusPriority = { pendente: 0, em_progresso: 1, concluida: 2 };
    if (statusPriority[a.status] !== statusPriority[b.status]) {
      return statusPriority[a.status] - statusPriority[b.status];
    }
    // Then sort by due date (earliest first)
    return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
  });

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tarefas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-muted-foreground">Carregando tarefas...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Tarefas</CardTitle>
          <Dialog open={isNewTaskDialogOpen} onOpenChange={setIsNewTaskDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-turquesa hover:bg-turquesa/90">
                <Plus className="w-4 h-4 mr-1" /> Nova Tarefa
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Nova Tarefa</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label htmlFor="title" className="text-sm font-medium">Título*</label>
                  <Input
                    id="title"
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    placeholder="Ex: Reavaliação craniana"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="description" className="text-sm font-medium">Descrição</label>
                  <Textarea
                    id="description"
                    value={taskDescription}
                    onChange={(e) => setTaskDescription(e.target.value)}
                    placeholder="Digite os detalhes da tarefa"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="dueDate" className="text-sm font-medium">Data de Vencimento*</label>
                    <Input
                      id="dueDate"
                      type="date"
                      value={taskDueDate}
                      onChange={(e) => setTaskDueDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="responsible" className="text-sm font-medium">Responsável*</label>
                    <Input
                      id="responsible"
                      value={taskResponsible}
                      onChange={(e) => setTaskResponsible(e.target.value)}
                      placeholder="Ex: Dr. Ana"
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsNewTaskDialogOpen(false)}>Cancelar</Button>
                <Button onClick={handleCreateTask} className="bg-turquesa hover:bg-turquesa/90">Criar Tarefa</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isEditTaskDialogOpen} onOpenChange={setIsEditTaskDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Editar Tarefa</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label htmlFor="edit-title" className="text-sm font-medium">Título*</label>
                  <Input
                    id="edit-title"
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="edit-description" className="text-sm font-medium">Descrição</label>
                  <Textarea
                    id="edit-description"
                    value={taskDescription}
                    onChange={(e) => setTaskDescription(e.target.value)}
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="edit-dueDate" className="text-sm font-medium">Data de Vencimento*</label>
                    <Input
                      id="edit-dueDate"
                      type="date"
                      value={taskDueDate}
                      onChange={(e) => setTaskDueDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="edit-responsible" className="text-sm font-medium">Responsável*</label>
                    <Input
                      id="edit-responsible"
                      value={taskResponsible}
                      onChange={(e) => setTaskResponsible(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="edit-status" className="text-sm font-medium">Status</label>
                    <Select value={taskStatus} onValueChange={(value: 'pendente' | 'em_progresso' | 'concluida') => setTaskStatus(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pendente">Pendente</SelectItem>
                        <SelectItem value="em_progresso">Em Progresso</SelectItem>
                        <SelectItem value="concluida">Concluída</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditTaskDialogOpen(false)}>Cancelar</Button>
                <Button onClick={handleEditTask} className="bg-turquesa hover:bg-turquesa/90">Salvar Alterações</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {sortedTasks.length > 0 ? (
              sortedTasks.map(task => (
                <div 
                  key={task.id} 
                  className={`p-3 border rounded-md transition-all duration-200 ${
                    task.status === 'concluida' ? 'bg-muted/50 border-muted' : 'bg-card hover:bg-muted/10'
                  } ${isPastDue(task.due_date) && task.status !== 'concluida' ? 'border-red-200 bg-red-50' : ''}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <button 
                        onClick={() => handleToggleTaskStatus(task)}
                        className="mt-1 text-muted-foreground hover:text-primary transition-colors"
                      >
                        {task.status === 'concluida' ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <Circle className="h-5 w-5" />
                        )}
                      </button>
                      <div>
                        <h4 className={`font-medium ${task.status === 'concluida' ? 'line-through text-muted-foreground' : ''}`}>
                          {task.titulo}
                        </h4>
                        {task.descricao && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {task.descricao}
                          </p>
                        )}
                        <div className="flex flex-wrap items-center gap-2 mt-2 text-xs">
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>{formatDate(task.due_date)}</span>
                            {isPastDue(task.due_date) && task.status !== 'concluida' && (
                              <span className="text-red-500 font-medium">(Atrasada)</span>
                            )}
                          </div>
                          {task.responsible && (
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Clock className="h-3.5 w-3.5" />
                              <span>{task.responsible}</span>
                            </div>
                          )}
                          <Badge 
                            className={`text-white ${getStatusColor(task.status)}`}
                          >
                            {getStatusText(task.status)}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8" 
                        onClick={() => handleOpenEditDialog(task)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-destructive hover:text-destructive" 
                        onClick={() => handleDeleteTask(task.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p className="mb-2">Nenhuma tarefa encontrada</p>
                <Button 
                  onClick={() => setIsNewTaskDialogOpen(true)} 
                  variant="outline" 
                  className="mt-2"
                >
                  <Plus className="w-4 h-4 mr-1" /> Adicionar Tarefa
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
