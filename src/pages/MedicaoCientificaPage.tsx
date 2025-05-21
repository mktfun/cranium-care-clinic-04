
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import ScientificCranialForm from "@/components/scientific-cranial/ScientificCranialForm";
import ScientificCranialHistory from "@/components/scientific-cranial/ScientificCranialHistory";

export default function MedicaoCientificaPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [paciente, setPaciente] = useState<any>(null);
  const [medicoes, setMedicoes] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!id) return;
    
    const fetchPaciente = async () => {
      try {
        setLoading(true);
        
        // Carregar dados do paciente
        const { data: pacienteData, error: pacienteError } = await supabase
          .from('pacientes')
          .select('*')
          .eq('id', id)
          .single();
        
        if (pacienteError) throw pacienteError;
        if (!pacienteData) throw new Error("Paciente não encontrado");
        
        setPaciente(pacienteData);
        
        // Carregar histórico de medições
        const { data: medicoesData, error: medicoesError } = await supabase
          .from('medicoes')
          .select('*')
          .eq('paciente_id', id)
          .order('data', { ascending: false });
        
        if (medicoesError) throw medicoesError;
        
        setMedicoes(medicoesData || []);
      } catch (error: any) {
        console.error('Erro ao carregar dados:', error.message);
        toast.error("Erro ao carregar dados do paciente");
      } finally {
        setLoading(false);
      }
    };
    
    fetchPaciente();
  }, [id]);
  
  // Função para salvar nova medição
  const handleSaveMeasurement = async (medicao: any): Promise<void> => {
    try {
      if (!id) throw new Error("ID do paciente não encontrado");
      
      const { data, error } = await supabase
        .from('medicoes')
        .insert({
          ...medicao,
          paciente_id: id,
          user_id: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Atualizar estado local
      setMedicoes(prevMedicoes => [data, ...prevMedicoes]);
      
      // Retornando void explicitamente
      return;
    } catch (error: any) {
      console.error('Erro ao salvar medição:', error.message);
      toast.error("Erro ao salvar medição craniana");
      throw error;
    }
  };
  
  if (loading) {
    return (
      <div className="container my-8 flex justify-center">
        <p>Carregando dados do paciente...</p>
      </div>
    );
  }
  
  if (!paciente) {
    return (
      <div className="container my-8">
        <p className="text-red-500">Paciente não encontrado.</p>
        <Button onClick={() => navigate(-1)} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
        </Button>
      </div>
    );
  }
  
  return (
    <div className="container my-8">
      <div className="mb-6">
        <Button 
          variant="outline" 
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
        </Button>
        
        <h1 className="text-2xl font-bold mb-2">
          Avaliação Craniana Científica - {paciente.nome}
        </h1>
        <p className="text-muted-foreground">
          Utilize este formulário para realizar uma avaliação craniana baseada em métodos científicos e padrões antropométricos.
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna do formulário - 2/3 */}
        <div className="lg:col-span-2">
          <ScientificCranialForm 
            pacienteId={paciente.id}
            pacienteNome={paciente.nome}
            pacienteDataNascimento={paciente.data_nascimento}
            pacienteSexo={paciente.sexo || 'M'} 
            onSaveMeasurement={handleSaveMeasurement}
          />
        </div>
        
        {/* Coluna do histórico - 1/3 */}
        <div className="lg:col-span-1">
          <ScientificCranialHistory 
            medicoes={medicoes}
            dataNascimento={paciente.data_nascimento}
            sexo={paciente.sexo || 'M'} 
          />
        </div>
      </div>
    </div>
  );
}
