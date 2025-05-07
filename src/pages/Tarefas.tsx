
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, CheckCircle, ChevronLeft, Circle, Clock, Edit, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Define task type
interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  status: 'pending' | 'completed' | 'overdue';
  patientId: string;
  patientName: string;
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
    patientName: "João da Silva",
    responsible: "Dr. Ana"
  },
  {
    id: "task-2",
    title: "Verificar adaptação à órtese",
    description: "Avaliar se o paciente está se adaptando bem ao capacete e fazer ajustes necessários",
    dueDate: "2025-05-10",
    status: "pending",
    patientId: "1",
    patientName: "João da Silva",
    responsible: "Dr. Ana"
  },
  {
    id: "task-3",
    title: "Acompanhamento de exercícios",
    description: "Verificar se os exercícios de fisioterapia estão sendo realizados corretamente",
    dueDate: "2025-04-30",
    status: "overdue",
    patientId: "1",
    patientName: "João da Silva",
    responsible: "Fisioterapeuta João"
  },
  {
    id: "task-4",
    title: "Encaminhar para neurologista",
    description: "Enviar relatório e solicitar avaliação neurológica",
    dueDate: "2025-05-03",
    status: "completed",
    patientId: "1",
    patientName: "João da Silva",
    responsible: "Dr. Ana"
  },
  {
    id: "task-5",
    title: "Verificação da medida craniana",
    description: "Reavaliar o perímetro cefálico e comparar com medição anterior",
    dueDate: "2025-05-12",
    status: "pending",
    patientId: "2",
    patientName: "Maria Oliveira",
    responsible: "Dr. Ana"
  },
  {
    id: "task-6",
    title: "Consulta de retorno",
    description: "Avaliação pós-início do tratamento com capacete",
    dueDate: "2025-05-07",
    status: "pending",
    patientId: "3",
    patientName: "Lucas Mendes",
    responsible: "Dr. Ana"
  },
  {
    id: "task-7",
    title: "Avaliação fisioterápica",
    description: "Encaminhar para avaliação de assimetria cervical",
    dueDate: "2025-04-25",
    status: "overdue",
    patientId: "4",
    patientName: "Ana Clara Santos",
    responsible: "Dr. Ana"
  }
];

// List of sample patients
const patients = [
  { id: "1", nome: "João da Silva" },
  { id: "2", nome: "Maria Oliveira" },
  { id: "3", nome: "Lucas Mendes" },
  { id: "4", nome: "Ana Clara Santos" },
];

export default function Tarefas() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [isNewTaskDialogOpen, setIsNewTaskDialogOpen] = useState(false);
  const [isEditTaskDialogOpen, setIsEditTaskDialogOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [patientFilter, setPatientFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  
  // Form state for new/edit task
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskDueDate, setTaskDueDate] = useState("");
  const [taskResponsible, setTaskResponsible] = useState("");
  const [taskPatientId, setTaskPatientId] = useState("");

  useEffect(() => {
    // In a real app, fetch tasks from API
    // For now, use initialTasks with updated status based on due date
    const tasksWithUpdatedStatus = initialTasks.map(task => {
      if (task.status !== 'completed' && isPastDue(task.dueDate)) {
        return { ...task, status: 'overdue' as 'overdue' };
      }
      return task;
    });
    
    setTasks(tasksWithUpdatedStatus);
  }, []);

  useEffect(() => {
    // Apply filters
    let result = [...tasks];
    
    if (statusFilter !== "all") {
      result = result.filter(task => task.status === statusFilter);
    }
    
    if (patientFilter !== "all") {
      result = result.filter(task => task.patientId === patientFilter);
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(task => 
        task.title.toLowerCase().includes(query) || 
        task.description.toLowerCase().includes(query) ||
        task.patientName.toLowerCase().includes(query)
      );
    }
    
    // Sort by status and due date
    result.sort((a, b) => {
      // Sort by status priority (overdue > pending > completed)
      const statusPriority = { overdue: 0, pending: 1, completed: 2 };
      if (statusPriority[a.status] !== statusPriority[b.status]) {
        return statusPriority[a.status] - statusPriority[b.status];
      }
      // Then sort by due date (earliest first)
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });
    
    setFilteredTasks(result);
  }, [tasks, statusFilter, patientFilter, searchQuery]);
  
  const handleCreateTask = () => {
    if (!taskTitle || !taskDueDate || !taskResponsible || !taskPatientId) {
      toast.error("Por favor, preencha todos os campos obrigatórios");
      return;
    }
    
    const selectedPatient = patients.find(patient => patient.id === taskPatientId);
    if (!selectedPatient) {
      toast.error("Paciente inválido");
      return;
    }
    
    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: taskTitle,
      description: taskDescription,
      dueDate: taskDueDate,
      status: 'pending',
      patientId: taskPatientId,
      patientName: selectedPatient.nome,
      responsible: taskResponsible
    };
    
    setTasks([...tasks, newTask]);
    resetTaskForm();
    setIsNewTaskDialogOpen(false);
    toast.success("Tarefa criada com sucesso!");
  };
  
  const handleEditTask = () => {
    if (!currentTask || !taskTitle || !taskDueDate || !taskResponsible || !taskPatientId) {
      toast.error("Por favor, preencha todos os campos obrigatórios");
      return;
    }
    
    const selectedPatient = patients.find(patient => patient.id === taskPatientId);
    if (!selectedPatient) {
      toast.error("Paciente inválido");
      return;
    }
    
    const updatedTasks = tasks.map(task => 
      task.id === currentTask.id 
        ? { 
            ...task, 
            title: taskTitle, 
            description: taskDescription, 
            dueDate: taskDueDate, 
            responsible: taskResponsible,
            patientId: taskPatientId,
            patientName: selectedPatient.nome
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
    setTaskPatientId(task.patientId);
    setIsEditTaskDialogOpen(true);
  };
  
  const resetTaskForm = () => {
    setTaskTitle("");
    setTaskDescription("");
    setTaskDueDate("");
    setTaskResponsible("");
    setTaskPatientId("");
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

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Link to="/dashboard">
          <Button variant="ghost" size="icon">
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h2 className="text-3xl font-bold">Tarefas</h2>
      </div>
      
      <Card>
        <CardHeader className="pb-2">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle>Lista de Tarefas</CardTitle>
            <Dialog open={isNewTaskDialogOpen} onOpenChange={setIsNewTaskDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-turquesa hover:bg-turquesa/90 whitespace-nowrap">
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
                  <div className="space-y-2">
                    <label htmlFor="patient" className="text-sm font-medium">Paciente*</label>
                    <Select value={taskPatientId} onValueChange={setTaskPatientId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um paciente" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {patients.map(patient => (
                            <SelectItem key={patient.id} value={patient.id}>
                              {patient.nome}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
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
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Pesquisar tarefas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2 flex-col sm:flex-row">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="all">Todos os status</SelectItem>
                    <SelectItem value="pending">Pendentes</SelectItem>
                    <SelectItem value="completed">Concluídas</SelectItem>
                    <SelectItem value="overdue">Atrasadas</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>

              <Select value={patientFilter} onValueChange={setPatientFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filtrar por paciente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="all">Todos os pacientes</SelectItem>
                    {patients.map(patient => (
                      <SelectItem key={patient.id} value={patient.id}>
                        {patient.nome}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-3">
            {filteredTasks.length > 0 ? (
              filteredTasks.map(task => (
                <div 
                  key={task.id} 
                  className={`p-4 border rounded-md transition-all duration-200 ${
                    task.status === 'completed' ? 'bg-muted/50 border-muted' : 'bg-card hover:bg-muted/10'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
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
                      <div className="flex-1">
                        <h4 className={`font-medium ${task.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>
                          {task.title}
                        </h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {task.description}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 mt-2 text-xs">
                          <Link to={`/pacientes/${task.patientId}`} className="text-primary hover:underline">
                            {task.patientName}
                          </Link>
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
                    
                    <div className="flex items-center gap-1 self-end md:self-start">
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
              <div className="text-center py-12 text-muted-foreground">
                <p className="mb-2">Nenhuma tarefa encontrada</p>
                <p className="text-sm mb-4">Ajuste os filtros ou crie uma nova tarefa</p>
                <Button 
                  onClick={() => setIsNewTaskDialogOpen(true)} 
                  className="bg-turquesa hover:bg-turquesa/90"
                >
                  <Plus className="w-4 h-4 mr-1" /> Adicionar Tarefa
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

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
            <div className="space-y-2">
              <label htmlFor="edit-patient" className="text-sm font-medium">Paciente*</label>
              <Select value={taskPatientId} onValueChange={setTaskPatientId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um paciente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {patients.map(patient => (
                      <SelectItem key={patient.id} value={patient.id}>
                        {patient.nome}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
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
    </div>
  );
}
