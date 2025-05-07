
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, CheckCircle, Circle, Clock, Edit, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

// Define task type
interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  status: 'pending' | 'completed' | 'overdue';
  patientId: string;
  responsible: string;
}

// Sample tasks for demonstration
const initialTasks: Task[] = [
  {
    id: "task-1",
    title: "Reavaliação craniana",
    description: "Realizar nova medição e avaliar a evolução do tratamento",
    dueDate: "2025-05-15",
    status: "pending",
    patientId: "1",
    responsible: "Dr. Ana"
  },
  {
    id: "task-2",
    title: "Verificar adaptação à órtese",
    description: "Avaliar se o paciente está se adaptando bem ao capacete e fazer ajustes necessários",
    dueDate: "2025-05-10",
    status: "pending",
    patientId: "1",
    responsible: "Dr. Ana"
  },
  {
    id: "task-3",
    title: "Acompanhamento de exercícios",
    description: "Verificar se os exercícios de fisioterapia estão sendo realizados corretamente",
    dueDate: "2025-04-30",
    status: "overdue",
    patientId: "1",
    responsible: "Fisioterapeuta João"
  },
  {
    id: "task-4",
    title: "Encaminhar para neurologista",
    description: "Enviar relatório e solicitar avaliação neurológica",
    dueDate: "2025-05-03",
    status: "completed",
    patientId: "1",
    responsible: "Dr. Ana"
  }
];

interface PatientTasksProps {
  patientId: string;
}

export function PatientTasks({ patientId }: PatientTasksProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks.filter(task => task.patientId === patientId));
  const [isNewTaskDialogOpen, setIsNewTaskDialogOpen] = useState(false);
  const [isEditTaskDialogOpen, setIsEditTaskDialogOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  
  // Form state for new/edit task
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskDueDate, setTaskDueDate] = useState("");
  const [taskResponsible, setTaskResponsible] = useState("");
  
  const handleCreateTask = () => {
    if (!taskTitle || !taskDueDate || !taskResponsible) {
      toast.error("Por favor, preencha todos os campos obrigatórios");
      return;
    }
    
    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: taskTitle,
      description: taskDescription,
      dueDate: taskDueDate,
      status: 'pending',
      patientId,
      responsible: taskResponsible
    };
    
    setTasks([...tasks, newTask]);
    resetTaskForm();
    setIsNewTaskDialogOpen(false);
    toast.success("Tarefa criada com sucesso!");
  };
  
  const handleEditTask = () => {
    if (!currentTask || !taskTitle || !taskDueDate || !taskResponsible) {
      toast.error("Por favor, preencha todos os campos obrigatórios");
      return;
    }
    
    const updatedTasks = tasks.map(task => 
      task.id === currentTask.id 
        ? { 
            ...task, 
            title: taskTitle, 
            description: taskDescription, 
            dueDate: taskDueDate, 
            responsible: taskResponsible 
          } 
        : task
    );
    
    setTasks(updatedTasks);
    resetTaskForm();
    setCurrentTask(null);
    setIsEditTaskDialogOpen(false);
    toast.success("Tarefa atualizada com sucesso!");
  };
  
  const handleDeleteTask = (taskId: string) => {
    setTasks(tasks.filter(task => task.id !== taskId));
    toast.success("Tarefa excluída com sucesso!");
  };
  
  const handleToggleTaskStatus = (taskId: string) => {
    setTasks(tasks.map(task => 
      task.id === taskId 
        ? { ...task, status: task.status === 'completed' ? 'pending' : 'completed' } 
        : task
    ));
  };
  
  const handleOpenEditDialog = (task: Task) => {
    setCurrentTask(task);
    setTaskTitle(task.title);
    setTaskDescription(task.description);
    setTaskDueDate(task.dueDate);
    setTaskResponsible(task.responsible);
    setIsEditTaskDialogOpen(true);
  };
  
  const resetTaskForm = () => {
    setTaskTitle("");
    setTaskDescription("");
    setTaskDueDate("");
    setTaskResponsible("");
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR').format(date);
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500 hover:bg-green-600';
      case 'overdue': return 'bg-red-500 hover:bg-red-600';
      default: return 'bg-yellow-500 hover:bg-yellow-600';
    }
  };
  
  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Concluída';
      case 'overdue': return 'Atrasada';
      default: return 'Pendente';
    }
  };
  
  const isPastDue = (dateString: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(dateString);
    return dueDate < today && dateString !== '';
  };
  
  // Update status for overdue tasks
  const tasksWithUpdatedStatus = tasks.map(task => {
    if (task.status !== 'completed' && isPastDue(task.dueDate)) {
      return { ...task, status: 'overdue' as 'overdue' };
    }
    return task;
  });
  
  // Sort tasks by status and due date
  const sortedTasks = [...tasksWithUpdatedStatus].sort((a, b) => {
    // Sort by status priority (overdue > pending > completed)
    const statusPriority = { overdue: 0, pending: 1, completed: 2 };
    if (statusPriority[a.status] !== statusPriority[b.status]) {
      return statusPriority[a.status] - statusPriority[b.status];
    }
    // Then sort by due date (earliest first)
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });

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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    task.status === 'completed' ? 'bg-muted/50 border-muted' : 'bg-card hover:bg-muted/10'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <button 
                        onClick={() => handleToggleTaskStatus(task.id)}
                        className="mt-1 text-muted-foreground hover:text-primary transition-colors"
                      >
                        {task.status === 'completed' ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <Circle className="h-5 w-5" />
                        )}
                      </button>
                      <div>
                        <h4 className={`font-medium ${task.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>
                          {task.title}
                        </h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {task.description}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 mt-2 text-xs">
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>{formatDate(task.dueDate)}</span>
                          </div>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Clock className="h-3.5 w-3.5" />
                            <span>{task.responsible}</span>
                          </div>
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
