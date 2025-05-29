
import { Json } from "@/integrations/supabase/types";
import { Responsavel, Paciente } from "@/types";

export function convertSupabasePacienteToPaciente(supabasePaciente: any): Paciente {
  return {
    ...supabasePaciente,
    sexo: supabasePaciente.sexo || 'M', // Default to 'M' if null
    responsaveis: convertResponsaveisFromJson(supabasePaciente.responsaveis || [])
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
