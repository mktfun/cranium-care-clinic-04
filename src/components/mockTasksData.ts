
import { Task } from "@/types";

// Create mock data to use when the Supabase API fails or for testing
export const mockUrgentTasks: Task[] = [
  {
    id: "1",
    paciente_id: "1",
    paciente_nome: "João Silva",
    title: "Reavaliação Craniana",
    description: "Realizar nova medição e verificar progresso",
    due_date: "2025-05-20",
    status: "pendente",
    priority: "alta",
    tipo: "Avaliação"
  },
  {
    id: "2",
    paciente_id: "2",
    paciente_nome: "Maria Oliveira",
    title: "Ajuste de Órtese",
    description: "Verificar adaptação e fazer ajustes necessários",
    due_date: "2025-05-15",
    status: "pendente",
    priority: "urgente",
    tipo: "Tratamento"
  }
];
