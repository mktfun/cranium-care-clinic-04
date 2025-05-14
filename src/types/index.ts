
// Types of asymmetry - importing from cranial-utils.ts to ensure consistency
import type { AsymmetryType, SeverityLevel } from "@/lib/cranial-utils";

// Re-export these types
export type { AsymmetryType, SeverityLevel };

export interface Paciente {
  id: string;
  nome: string;
  data_nascimento: string;
  sexo: string;
  responsaveis?: {
    nome: string;
    telefone?: string;
    email?: string;
    parentesco?: string;
  }[];
  created_at?: string;
  updated_at?: string;
  user_id?: string;
  dataNascimento?: string; // Added for compatibility with existing components
  idadeEmMeses?: number;   // Added for compatibility with existing components
  ultimaMedicao?: {
    data: string;
    status: SeverityLevel;
    asymmetryType: AsymmetryType;
  };
}

export interface Task {
  id: string;
  paciente_id: string;
  paciente_nome: string;
  title: string;
  description: string;
  due_date: string;
  status: string;
  priority: string;
  tipo: string;
}
