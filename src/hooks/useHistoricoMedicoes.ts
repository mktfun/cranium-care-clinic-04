
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Medicao {
  id: string;
  paciente_id: string;
  data: string;
  indice_craniano?: number;
  cvai?: number;
  perimetro_cefalico?: number;
  diferenca_diagonais?: number;
  comprimento?: number;
  largura?: number;
  diagonal_d?: number;
  diagonal_e?: number;
  pacienteNome?: string;
  pacienteNascimento?: string;
  pacienteSexo?: 'M' | 'F';
}

interface Paciente {
  id: string;
  nome: string;
  data_nascimento: string;
  sexo: 'M' | 'F';
}

export function useHistoricoMedicoes() {
  const [medicoes, setMedicoes] = useState<Medicao[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMedicoes() {
      try {
        setLoading(true);
        
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          toast.error("Sessão expirada. Faça login novamente.");
          return;
        }
        
        // Primeiro, obter todas as medições
        const { data: medicoesData, error: medicoesError } = await supabase
          .from('medicoes')
          .select('*')
          .order('data', { ascending: false });
          
        if (medicoesError) {
          console.error("Erro ao carregar medições:", medicoesError);
          toast.error("Erro ao carregar histórico de medições");
          return;
        }
        
        // Depois, obter todos os pacientes para relacionar com as medições
        const { data: pacientesData, error: pacientesError } = await supabase
          .from('pacientes')
          .select('id, nome, data_nascimento, sexo');
          
        if (pacientesError) {
          console.error("Erro ao carregar pacientes:", pacientesError);
          toast.error("Erro ao carregar dados dos pacientes");
          return;
        }
        
        // Criar um mapa para relacionar pacientes com medições
        const pacientesMap = (pacientesData || []).reduce((acc: Record<string, Paciente>, paciente) => {
          acc[paciente.id] = {
            ...paciente,
            sexo: (paciente.sexo === 'M' || paciente.sexo === 'F') ? paciente.sexo : 'M'
          };
          return acc;
        }, {});
        
        // Combinar os dados de medições com os dados de pacientes
        const medicoesCompletas = (medicoesData || []).map(medicao => ({
          ...medicao,
          indice_craniano: medicao.indice_craniano || 0,
          cvai: medicao.cvai || 0,
          pacienteNome: pacientesMap[medicao.paciente_id]?.nome || "Paciente desconhecido",
          pacienteNascimento: pacientesMap[medicao.paciente_id]?.data_nascimento || "",
          pacienteSexo: pacientesMap[medicao.paciente_id]?.sexo || 'M' as 'M' | 'F'
        }));
        
        setMedicoes(medicoesCompletas);
      } catch (err) {
        console.error("Erro:", err);
        toast.error("Erro ao carregar dados históricos");
      } finally {
        setLoading(false);
      }
    }
    
    loadMedicoes();
  }, []);

  return { medicoes, loading };
}
