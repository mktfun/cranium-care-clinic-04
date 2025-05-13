
export type AsymmetryType = "Normal" | "Plagiocefalia" | "Braquicefalia" | "Dolicocefalia" | "Misto";
export type SeverityLevel = "normal" | "leve" | "moderada" | "severa";

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
