export interface Responsavel {
  nome: string;
  telefone?: string;
  email?: string;
  parentesco?: string;
}

export interface Paciente {
  id: string;
  nome: string;
  data_nascimento: string;
  sexo: 'M' | 'F';
  responsaveis: Responsavel[];
  local_nascimento?: string;
  cpf?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  // Additional computed properties for UI
  dataNascimento?: string; // Alias for data_nascimento
  idadeEmMeses?: number;
  ultimaMedicao?: {
    data: string;
    status: SeverityLevel;
    asymmetryType: AsymmetryType;
  };
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
  created_at: string;
  updated_at: string;
  user_id: string;
}

export interface Prontuario {
  id: string;
  paciente_id: string;
  data_criacao: string;
  peso?: number;
  altura?: number;
  tipo_sanguineo?: string;
  queixa_principal?: string;
  observacoes_anamnese?: string;
  avaliacao?: string;
  diagnostico?: string;
  cid?: string;
  conduta?: string;
  prescricao?: string;
  alergias?: string;
  observacoes_gerais?: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  // Additional fields from database
  idade_gestacional?: string;
  idade_corrigida?: string;
  atestado?: string;
  local_nascimento?: string;
}

// Cranial classification types
export type AsymmetryType = "Braquicefalia" | "Dolicocefalia" | "Plagiocefalia" | "Misto" | "Normal";
export type SeverityLevel = "normal" | "leve" | "moderada" | "severa";

// Task interface
export interface Task {
  id: string;
  titulo: string;
  descricao?: string;
  status: 'pendente' | 'em_progresso' | 'concluida';
  due_date: string;
  paciente_id: string;
  user_id: string;
  responsible?: string;
  created_at: string;
  updated_at: string;
}

// Notification interface
export interface Notificacao {
  id: string;
  user_id: string;
  title: string;
  message: string;
  read: boolean;
  link?: string;
  created_at: string;
}

// Colaborador interface
export interface Colaborador {
  id: string;
  email: string;
  nome?: string;
  empresa_id: string;
  empresa_nome?: string;
  permissao: 'visualizar' | 'editar' | 'admin';
  status: 'pendente' | 'ativo' | 'inativo';
  created_at: string;
  updated_at: string;
}
