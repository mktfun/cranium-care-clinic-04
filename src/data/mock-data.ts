
export type Status = "normal" | "leve" | "moderada" | "severa";

import type { AsymmetryType as GlobalAsymmetryType, SeverityLevel } from "@/lib/cranial-utils";

export type AsymmetryType = GlobalAsymmetryType;

export interface Medicao {
  id: string;
  data: string;
  comprimento: number; // mm
  largura: number; // mm
  diagonalD: number; // mm
  diagonalE: number; // mm
  diferencaDiagonais: number; // mm
  indiceCraniano: number; // %
  cvai: number; // %
  perimetroCefalico?: number; // mm
  status: Status;
  asymmetryType?: AsymmetryType;
  observacoes?: string;
  recomendacoes?: string[];
}

export interface Paciente {
  id: string;
  nome: string;
  dataNascimento: string;
  idadeEmMeses: number;
  sexo: "M" | "F";
  responsaveis: {
    nome: string;
    telefone: string;
    email: string;
  }[];
  medicoes: Medicao[];
}

// Helper for calculating age in months and days
export const calcularIdadeEmMeses = (dataNascimento: string) => {
  const nascimento = new Date(dataNascimento);
  const hoje = new Date();
  
  let meses = (hoje.getFullYear() - nascimento.getFullYear()) * 12;
  meses -= nascimento.getMonth();
  meses += hoje.getMonth();
  
  // Ajuste para dia do mês
  if (hoje.getDate() < nascimento.getDate()) {
    meses--;
  }
  
  return meses;
};

// Import from cranial-utils
import { getCranialStatus } from "@/lib/cranial-utils";

// Empty arrays - data will come from Supabase
export const pacientes: Paciente[] = [];

export const obterPacientes = () => {
  // This function is deprecated - data should come from Supabase
  console.warn('obterPacientes is deprecated. Use Supabase queries instead.');
  return [];
};

export const obterPacientePorId = (id: string) => {
  // This function is deprecated - data should come from Supabase
  console.warn('obterPacientePorId is deprecated. Use Supabase queries instead.');
  return null;
};

export const obterUltimaMedicao = (pacienteId: string) => {
  // This function is deprecated - data should come from Supabase
  console.warn('obterUltimaMedicao is deprecated. Use Supabase queries instead.');
  return null;
};

export const obterStatusDistribuicao = () => {
  // This function is deprecated - data should come from Supabase
  console.warn('obterStatusDistribuicao is deprecated. Use Supabase queries instead.');
  return { normal: 0, leve: 0, moderada: 0, severa: 0 };
};

export const obterMedicoesRecentes = () => {
  // This function is deprecated - data should come from Supabase
  console.warn('obterMedicoesRecentes is deprecated. Use Supabase queries instead.');
  return [];
};
