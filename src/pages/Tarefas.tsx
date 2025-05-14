
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, CheckCircle, ChevronLeft, Circle, Clock, Edit, Plus, Trash2, Loader2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";

// Define task type
interface Task {
  id: string;
  titulo: string;
  descricao: string;
  due_date: string;
  status: string;
  paciente_id: string;
  paciente_nome?: string;
  responsible: string;
}

export default function Tarefas() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [isNewTaskDialogOpen, setIsNewTaskDialogOpen] = useState(false);
  const [isEditTaskDialogOpen, setIsEditTaskDialogOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [patientFilter, setPatientFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState<any[]>([]);
  
  // Form state for new/edit task
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskDueDate, setTaskDueDate] = useState("");
  const [taskResponsible, setTaskResponsible] = useState("");
  const [taskPatientId, setTaskPatientId] = useState("");

  useEffect(() => {
    async function fetchTasks() {
      try {
        setLoading(true);
        
        // Buscar pacientes primeiro
        const { data: patientsData, error: patientsError } = await supabase
          .from("pacientes")
          .select("id, nome")
          .order("nome");
          
        if (patientsError) {
          throw patientsError;
        }
        
        setPatients(patientsData || []);
        
        // Buscar tarefas
        const { data: tasksData, error: tasksError } = await supabase
          .from("tarefas")
          .select(`
            *,
            pacientes:paciente_id (nome)
          `)
          .order("due_date", { ascending: true });
          
        if (tasksError) {
          throw tasksError;
        }
        
        // Formatar os dados das tarefas
        const formattedTasks = tasksData?.map(task => ({
          id: task.id,
          titulo: task.titulo,
          descricao: task.descricao || "",
          due_date: task.due_date,
          status: task.status || "pendente",
          paciente_id: task.paciente_id,
          paciente_nome: task.pacientes?.nome || "Paciente não encontrado",
          responsible: task.responsible || "Não atribuído"
        })) || [];
        
        // Atualizar status para overdue se a data estiver no passado
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const tasksWithUpdatedStatus = formattedTasks.map(task => {
          const taskDate = new Date(task.due_date);
          
          if (task.status === "pendente" && taskDate < today) {
            return { ...task, status: "overdue" };
          }
          return task;
        });
        
        setTasks(tasksWithUpdatedStatus);
      } catch (error) {
        console.error("Error loading tasks:", error);
        toast({
          title: "Erro",
          description: "Erro ao carregar tarefas",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    }
    
    fetchTasks();
  }, []);

  useEffect(() => {
    // Apply filters
    let result = [...tasks];
    
    if (statusFilter !== "all") {
      result = result.filter(task => task.status === statusFilter);
    }
    
    if (patientFilter !== "all") {
      result = result.filter(task => task.paciente_id === patientFilter);
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(task => 
        task.titulo.toLowerCase().includes(query) || 
        task.descricao.toLowerCase().includes(query) ||
        (task.paciente_nome && task.paciente_nome.toLowerCase().includes(query))
      );
    }
    
    // Sort by status and due date
    result.sort((a, b) => {
      // Sort by status priority (overdue > pendente > completed)
      const statusPriority: Record<string, number> = { 
        overdue: 0, 
        pendente: 1, 
        concluida: 2,
        cancelada: 3
      };
      
      const aPriority = statusPriority[a.status] ?? 99;
      const bPriority = statusPriority[b.status] ?? 99;
      
      if (aPriority !== bPriority) {
        return aPriority - bPriority;
      }
      
      // Then sort by due date (earliest first)
      return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
    });
    
    setFilteredTasks(result);
  }, [tasks, statusFilter, patientFilter, searchQuery]);
  
  const handleCreateTask = async () => {
    if (!taskTitle || !taskDueDate || !taskPatientId) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Erro",
          description: "Usuário não autenticado",
          variant: "destructive"
        });
        return;
      }
      
      const newTask = {
        titulo: taskTitle,
        descricao: taskDescription,
        due_date: taskDueDate,
        status: 'pendente',
        paciente_id: taskPatientId,
        user_id: session.user.id,
        responsible: taskResponsible || "Não atribuído"
      };
      
      const { data, error } = await supabase
        .from("tarefas")
        .insert([newTask])
        .select(`
          *,
          pacientes:paciente_id (nome)
        `);
        
      if (error) {
        throw error;
      }
      
      if (data && data[0]) {
        const formattedTask = {
          id: data[0].id,
          titulo: data[0].titulo,
          descricao: data[0].descricao || "",
          due_date: data[0].due_date,
          status: data[0].status,
          paciente_id: data[0].paciente_id,
          paciente_nome: data[0].pacientes?.nome || "Paciente não encontrado",
          responsible: data[0].responsible
        };
        
        setTasks([...tasks, formattedTask]);
      }
      
      resetTaskForm();
      setIsNewTaskDialogOpen(false);
      
      toast({
        title: "Sucesso",
        description: "Tarefa criada com sucesso!",
      });
    } catch (error: any) {
      console.error("Error creating task:", error);
      toast({
        title: "Erro",
        description: `Erro ao criar tarefa: ${error.message}`,
        variant: "destructive"
      });
    }
  };
  
  const handleEditTask = async () => {
    if (!currentTask || !taskTitle || !taskDueDate || !taskPatientId) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const updatedTaskData = {
        titulo: taskTitle,
        descricao: taskDescription,
        due_date: taskDueDate,
        paciente_id: taskPatientId,
        responsible: taskResponsible || "Não atribuído"
      };
      
      const { data, error } = await supabase
        .from("tarefas")
        .update(updatedTaskData)
        .eq("id", currentTask.id)
        .select(`
          *,
          pacientes:paciente_id (nome)
        `);
        
      if (error) {
        throw error;
      }
      
      if (data && data[0]) {
        const updatedTask = {
          id: data[0].id,
          titulo: data[0].titulo,
          descricao: data[0].descricao || "",
          due_date: data[0].due_date,
          status: data[0].status,
          paciente_id: data[0].paciente_id,
          paciente_nome: data[0].pacientes?.nome || "Paciente não encontrado",
          responsible: data[0].responsible
        };
        
        setTasks(tasks.map(task => 
          task.id === currentTask.id ? updatedTask : task
        ));
      }
      
      resetTaskForm();
      setCurrentTask(null);
      setIsEditTaskDialogOpen(false);
      
      toast({
        title: "Sucesso",
        description: "Tarefa atualizada com sucesso!",
      });
    } catch (error: any) {
      console.error("Error updating task:", error);
      toast({
        title: "Erro",
        description: `Erro ao atualizar tarefa: ${error.message}`,
        variant: "destructive"
      });
    }
  };
  
  const handleDeleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from("tarefas")
        .delete()
        .eq("id", taskId);
        
      if (error) {
        throw error;
      }
      
      setTasks(tasks.filter(task => task.id !== taskId));
      
      toast({
        title: "Sucesso",
        description: "Tarefa excluída com sucesso!",
      });
    } catch (error: any) {
      console.error("Error deleting task:", error);
      toast({
        title: "Erro",
        description: `Erro ao excluir tarefa: ${error.message}`,
        variant: "destructive"
      });
    }
  };
  
  const handleToggleTaskStatus = async (taskId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === "concluida" ? "pendente" : "concluida";
      
      const { data, error } = await supabase
        .from("tarefas")
        .update({ status: newStatus })
        .eq("id", taskId)
        .select();
        
      if (error) {
        throw error;
      }
      
      if (data) {
        setTasks(tasks.map(task => 
          task.id === taskId ? { ...task, status: newStatus } : task
        ));
      }
      
      toast({
        title: "Sucesso",
        description: `Tarefa marcada como ${newStatus === "concluida" ? "concluída" : "pendente"}!`,
      });
    } catch (error: any) {
      console.error("Error updating task status:", error);
      toast({
        title: "Erro",
        description: `Erro ao atualizar status da tarefa: ${error.message}`,
        variant: "destructive"
      });
    }
  };
  
  const handleOpenEditDialog = (task: Task) => {
    setCurrentTask(task);
    setTaskTitle(task.titulo);
    setTaskDescription(task.descricao);
    setTaskDueDate(task.due_date);
    setTaskResponsible(task.responsible);
    setTaskPatientId(task.paciente_id);
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
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('pt-BR').format(date);
    } catch (error) {
      console.error("Error formatting date:", error);
      return dateString;
    }
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'concluida': return 'bg-green-500 hover:bg-green-600';
      case 'overdue': return 'bg-red-500 hover:bg-red-600';
      case 'cancelada': return 'bg-gray-500 hover:bg-gray-600';
      default: return 'bg-yellow-500 hover:bg-yellow-600';
    }
  };
  
  const getStatusText = (status: string) => {
    switch (status) {
      case 'concluida': return 'Concluída';
      case 'overdue': return 'Atrasada';
      case 'cancelada': return 'Cancelada';
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
                      <label htmlFor="responsible" className="text-sm font-medium">Responsável</label>
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
                    <SelectItem value="pendente">Pendentes</SelectItem>
                    <SelectItem value="concluida">Concluídas</SelectItem>
                    <SelectItem value="overdue">Atrasadas</SelectItem>
                    <SelectItem value="cancelada">Canceladas</SelectItem>
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

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-turquesa mr-2" />
              <span>Carregando tarefas...</span>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTasks.length > 0 ? (
                filteredTasks.map(task => (
                  <div 
                    key={task.id} 
                    className={`p-4 border rounded-md transition-all duration-200 ${
                      task.status === 'concluida' ? 'bg-muted/50 border-muted' : 'bg-card hover:bg-muted/10'
                    }`}
                  >
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <button 
                          onClick={() => handleToggleTaskStatus(task.id, task.status)}
                          className="mt-1 text-muted-foreground hover:text-primary transition-colors"
                        >
                          {task.status === 'concluida' ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <Circle className="h-5 w-5" />
                          )}
                        </button>
                        <div className="flex-1">
                          <h4 className={`font-medium ${task.status === 'concluida' ? 'line-through text-muted-foreground' : ''}`}>
                            {task.titulo}
                          </h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {task.descricao}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 mt-2 text-xs">
                            <Link to={`/pacientes/${task.paciente_id}`} className="text-primary hover:underline">
                              {task.paciente_nome}
                            </Link>
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Calendar className="h-3.5 w-3.5" />
                              <span>{formatDate(task.due_date)}</span>
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
          )}
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
                <label htmlFor="edit-responsible" className="text-sm font-medium">Responsável</label>
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
