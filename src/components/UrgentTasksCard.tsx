
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, CheckCircle, Clock } from "lucide-react";

// Sample urgent tasks
const urgentTasks = [
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
        {urgentTasks.map(task => (
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
        ))}
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
