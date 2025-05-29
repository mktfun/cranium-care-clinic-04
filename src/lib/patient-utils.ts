
import { Json } from "@/integrations/supabase/types";
import { Responsavel, Paciente } from "@/types";

export function convertSupabasePacienteToPaciente(supabasePaciente: any): Paciente {
  return {
    ...supabasePaciente,
    sexo: (supabasePaciente.sexo || 'M') as 'M' | 'F', // Ensure proper type casting
    responsaveis: convertResponsaveisFromJson(supabasePaciente.responsaveis || []),
    // Add computed properties
    dataNascimento: supabasePaciente.data_nascimento,
    idadeEmMeses: calculateAgeInMonths(supabasePaciente.data_nascimento)
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

function calculateAgeInMonths(birthDate: string): number {
  const today = new Date();
  const birth = new Date(birthDate);
  return ((today.getFullYear() - birth.getFullYear()) * 12) + 
         (today.getMonth() - birth.getMonth());
}
