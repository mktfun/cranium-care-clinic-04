
// Types of asymmetry - importing from cranial-utils.ts to ensure consistency
import { AsymmetryType, SeverityLevel } from "@/lib/cranial-utils";

// Re-export these types
export { AsymmetryType, SeverityLevel };

export interface Paciente {
  id: string;
  nome: string;
  data_nascimento: string;
  dataNascimento?: string; // For backward compatibility
  sexo: string;
  idadeEmMeses?: number; // For backward compatibility
  responsaveis?: any;
  created_at?: string;
  updated_at?: string;
  user_id?: string;
  ultimaMedicao?: {  // Add ultimaMedicao property to Paciente interface
    data: string;
    status: SeverityLevel;
    asymmetryType: AsymmetryType;
  };
}

export interface Medicao {
  id: string;
  paciente_id: string;
  data: string;
  comprimento_maximo: number;
  largura_maxima: number;
  diagonal_direita?: number;
  diagonal_d?: number; // Backward compatibility
  diagonal_esquerda?: number;
  diagonal_e?: number; // Backward compatibility
  diferenca_diagonais: number;
  cvai?: number;
  indice_craniano?: number;
  perimetro_cefalico?: number;
  observacoes?: string;
  recomendacoes?: string[];
  created_at?: string;
  updated_at?: string;
}

// New interface for Prontuario
export interface Prontuario {
  id: string;
  paciente_id: string;
  data_criacao: string;
  altura?: number;
  peso?: number;
  tipo_sanguineo?: string;
  alergias?: string;
  observacoes_gerais?: string;
  created_at?: string;
  updated_at?: string;
}

// New interface for HistoricoMedico
export interface HistoricoMedico {
  id: string;
  prontuario_id?: string;
  paciente_id: string;
  data: string;
  tipo: string;
  descricao: string;
  observacoes?: string;
  created_at?: string;
  updated_at?: string;
}

// Task interface for UrgentTasksCard
export interface Task {
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

// Consulta interface for ConsultasTab
export interface Consulta {
  id: string;
  paciente_id: string;
  data: string;
  profissional: string;
  especialidade?: string;
  motivo?: string;
  diagnostico?: string;
  tratamento?: string;
  observacoes?: string;
  created_at?: string;
  updated_at?: string;
}

// Types for Supabase tables that we can't directly modify in the read-only file
export interface TablesInterface {
  medicoes: {
    Row: any;
  };
  pacientes: {
    Row: any;
  };
  usuarios: {
    Row: any;
  };
  tarefas: {
    Row: Task;
  };
  consultas: {
    Row: Consulta;
  };
}
