
// Types of asymmetry - using export type for isolatedModules compatibility
import type { AsymmetryType, SeverityLevel } from "@/lib/cranial-utils";

// Re-export these types
export type { AsymmetryType, SeverityLevel };

export interface Paciente {
  id: string;
  nome: string;
  data_nascimento: string;
  sexo: string;
  local_nascimento?: string; // Added missing field
  responsaveis?: any; // Changed from strict object array type to accommodate Json type from DB
  created_at?: string;
  updated_at?: string;
  user_id?: string;
  dataNascimento: string; // Required for compatibility with PacienteCard
  idadeEmMeses: number;   // Changed to required for compatibility with PacienteCard
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

export interface Medicao {
  id: string;
  paciente_id: string;
  data: string;
  comprimento: number;
  largura: number;
  diagonal_d: number;
  diagonal_e: number;
  perimetro_cefalico?: number;
  indice_craniano: number;
  diferenca_diagonais?: number;
  cvai: number;
  status: SeverityLevel;
  observacoes?: string;
  recomendacoes?: string[];
  created_at?: string;
  updated_at?: string;
  // Aliases for compatibility with existing code
  comprimento_maximo?: number;
  largura_maxima?: number;
  diagonal_direita?: number;
  diagonal_esquerda?: number;
}

export interface Consulta {
  id: string;
  paciente_id: string;
  data: string;
  tipo: string;
  descricao: string;
  observacoes?: string;
  created_at?: string;
  updated_at?: string;
  // Additional fields used in ConsultasTab.tsx
  profissional?: string;
  especialidade?: string;
  motivo?: string;
  diagnostico?: string;
  tratamento?: string;
}

export interface Prontuario {
  id: string;
  paciente_id: string;
  peso?: number;
  altura?: number;
  alergias?: string;
  tipo_sanguineo?: string;
  observacoes_gerais?: string;
  data_criacao?: string;
  created_at?: string;
  updated_at?: string;
  // Added fields that were included in the SQL schema update
  queixa_principal?: string;
  idade_gestacional?: string;
  idade_corrigida?: string;
  observacoes_anamnese?: string;
  diagnostico?: string;
  cid?: string;
  conduta?: string;
  avaliacao?: string;
  atestado?: string;
  prescricao?: string; // Added missing field
}
