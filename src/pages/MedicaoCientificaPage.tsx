
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ChevronLeft, FileText, History } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { formatAgeHeader } from "@/lib/age-utils";
import ScientificCranialForm from "@/components/scientific-cranial/ScientificCranialForm";
import ScientificCranialHistory from "@/components/scientific-cranial/ScientificCranialHistory";

export default function MedicaoCientificaPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [paciente, setPaciente] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [medicoes, setMedicoes] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("nova-medicao");
  
  useEffect(() => {
    async function fetchData() {
      if (id) {
        setLoading(true);
        try {
          // Fetch patient data
          const { data: pacienteData, error: pacienteError } = await supabase
            .from('pacientes')
            .select('*')
            .eq('id', id)
            .single();
            
          if (pacienteError) {
            console.error("Erro ao buscar dados do paciente:", pacienteError);
            toast.error("Erro ao carregar dados do paciente.");
            navigate("/pacientes");
            return;
          }
          
          setPaciente(pacienteData);
          
          // Fetch measurements
          const { data: medicoesData, error: medicoesError } = await supabase
            .from('medicoes')
            .select('*')
            .eq('paciente_id', id)
            .order('data', { ascending: false });
            
          if (medicoesError) {
            console.error("Erro ao buscar medições:", medicoesError);
            toast.error("Erro ao carregar medições.");
          } else {
            setMedicoes(medicoesData || []);
          }
          
        } catch (error) {
          console.error("Erro inesperado:", error);
          toast.error("Ocorreu um erro ao carregar os dados.");
        } finally {
          setLoading(false);
        }
      }
    }
    
    fetchData();
  }, [id, navigate]);
  
  const handleSaveMeasurement = async (medicao: any) => {
    try {
      const { data, error } = await supabase
        .from('medicoes')
        .insert([{
          ...medicao,
          user_id: (await supabase.auth.getUser()).data.user?.id
        }])
        .select()
        .single();
      
      if (error) {
        console.error("Erro ao salvar medição:", error);
        throw new Error(error.message);
      }
      
      // Atualizar a lista de medições
      setMedicoes(prevMedicoes => [data, ...prevMedicoes]);
      
      // Mudar para a aba de histórico após salvar
      setActiveTab("historico");
      
      return data;
    } catch (error) {
      console.error("Falha ao salvar medição:", error);
      throw error;
    }
  };
  
  const formatarData = (data: string) => {
    if (!data) return "N/A";
    
    const dataObj = new Date(data);
    if (isNaN(dataObj.getTime())) return "Data inválida";
    
    return dataObj.toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-turquesa" />
      </div>
    );
  }

  if (!paciente) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-semibold mb-4">Paciente não encontrado</h2>
        <p className="text-muted-foreground mb-6">O paciente que você está procurando não foi encontrado no sistema.</p>
        <Button onClick={() => navigate("/pacientes")}>Voltar para Pacientes</Button>
      </div>
    );
  }

  const idadeAtual = formatAgeHeader(paciente.data_nascimento);

  return (
    <div className="space-y-6 animate-fade-in p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate(`/pacientes/${id}`)}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-3xl font-bold">{paciente.nome}</h2>
            <p className="text-muted-foreground">
              {idadeAtual} • Nasc.: {formatarData(paciente.data_nascimento)}
            </p>
          </div>
        </div>
      </div>

      <Separator />
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="nova-medicao" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Nova Medição Científica
          </TabsTrigger>
          <TabsTrigger value="historico" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Histórico e Evolução
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="nova-medicao" className="pt-4">
          <ScientificCranialForm 
            pacienteId={id || ""}
            pacienteNome={paciente.nome}
            pacienteDataNascimento={paciente.data_nascimento}
            pacienteSexo={paciente.sexo || 'M'}
            onSaveMeasurement={handleSaveMeasurement}
          />
        </TabsContent>
        
        <TabsContent value="historico" className="pt-4">
          <ScientificCranialHistory 
            medicoes={medicoes}
            dataNascimento={paciente.data_nascimento}
            sexo={paciente.sexo || 'M'}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
