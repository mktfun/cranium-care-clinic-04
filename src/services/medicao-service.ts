
import { format } from 'date-fns';
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { SeverityLevel } from "@/lib/cranial-utils";

// Function to convert SeverityLevel to Database status_medicao enum
export function convertSeverityToStatus(severity: SeverityLevel): Database["public"]["Enums"]["status_medicao"] {
  // Map the severity to the database enum values
  switch (severity) {
    case "normal":
      return "normal";
    case "leve":
      return "leve";
    case "moderada":
      return "moderada";
    case "severa":
      return "severa";
    default:
      return "normal"; // Default fallback
  }
}

interface MedicaoData {
  paciente_id: string;
  user_id: string;
  data: string;
  comprimento: number | null;
  largura: number | null;
  diagonal_d: number | null;
  diagonal_e: number | null;
  diferenca_diagonais: number | null;
  indice_craniano: number | null;
  cvai: number | null;
  status: SeverityLevel;
  observacoes: string;
  recomendacoes: string[];
}

export async function saveMedicaoToDatabase(medicaoData: MedicaoData) {
  try {
    // Convert severity to proper enum value
    const dbStatus = convertSeverityToStatus(medicaoData.status);
    
    const { error } = await supabase
      .from('medicoes')
      .insert({
        paciente_id: medicaoData.paciente_id,
        user_id: medicaoData.user_id,
        data: medicaoData.data,
        comprimento: medicaoData.comprimento,
        largura: medicaoData.largura,
        diagonal_d: medicaoData.diagonal_d,
        diagonal_e: medicaoData.diagonal_e,
        diferenca_diagonais: medicaoData.diferenca_diagonais,
        indice_craniano: medicaoData.indice_craniano,
        cvai: medicaoData.cvai,
        status: dbStatus,
        observacoes: medicaoData.observacoes,
        recomendacoes: medicaoData.recomendacoes,
      });

    if (error) {
      console.error("Erro ao salvar medição:", error);
      return { success: false, error };
    }
    return { success: true };
  } catch (error) {
    console.error("Erro ao salvar medição:", error);
    return { success: false, error };
  }
}

export function formatMeasurementDate(date: Date | undefined): string {
  return date ? format(date, 'yyyy-MM-dd') : new Date().toISOString().split('T')[0];
}
