
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
  sexo: string;
  responsaveis: Responsavel[];
  local_nascimento?: string;
  created_at: string;
  updated_at: string;
  user_id: string;
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
  status: string;
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
}
