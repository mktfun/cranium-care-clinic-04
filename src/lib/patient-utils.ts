
import { Json } from "@/integrations/supabase/types";

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

export function convertSupabasePacienteToPaciente(supabasePaciente: any): Paciente {
  return {
    ...supabasePaciente,
    responsaveis: Array.isArray(supabasePaciente.responsaveis) 
      ? supabasePaciente.responsaveis 
      : []
  };
}

export function convertResponsaveisFromJson(responsaveis: Json): Responsavel[] {
  if (Array.isArray(responsaveis)) {
    return responsaveis.map((resp: any) => ({
      nome: resp?.nome || '',
      telefone: resp?.telefone || '',
      email: resp?.email || '',
      parentesco: resp?.parentesco || ''
    }));
  }
  return [];
}
