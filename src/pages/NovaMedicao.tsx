
import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CompleteMedicaoForm from "@/components/medicoes/CompleteMedicaoForm";
import { ChevronLeft, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function NovaMedicao() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [paciente, setPaciente] = useState<any>(null);
  const [prontuarios, setProntuarios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Verificar se veio do dashboard (via state ou query params)
  const fromDashboard = location.state?.fromDashboard || location.search.includes('fromDashboard=true');
  const prontuarioId = location.state?.prontuarioId;

  useEffect(() => {
    async function fetchData() {
      if (!id) return;
      
      try {
        setLoading(true);
        
        // Buscar dados do paciente
        const { data: pacienteData, error: pacienteError } = await supabase
          .from('pacientes')
          .select('*')
          .eq('id', id)
          .single();
          
        if (pacienteError) throw pacienteError;
        setPaciente(pacienteData);
        
        // Buscar prontuários do paciente
        const { data: prontuariosData, error: prontuariosError } = await supabase
          .from('prontuarios')
          .select('*')
          .eq('paciente_id', id)
          .order('data_criacao', { ascending: false });
          
        if (prontuariosError) throw prontuariosError;
        setProntuarios(prontuariosData || []);
        
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        toast.error('Erro ao carregar dados do paciente');
        navigate('/pacientes');
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, [id, navigate]);

  const handleVoltar = () => {
    if (fromDashboard) {
      navigate('/dashboard');
    } else {
      navigate(`/pacientes/${id}`);
    }
  };

  const handleCriarProntuario = () => {
    navigate(`/pacientes/${id}/prontuario`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-turquesa"></div>
      </div>
    );
  }

  if (!paciente) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-semibold mb-4">Paciente não encontrado</h2>
        <Button onClick={() => navigate("/pacientes")}>Voltar para Pacientes</Button>
      </div>
    );
  }

  // Se veio do dashboard e não há prontuários, força criação
  if (fromDashboard && prontuarios.length === 0) {
    return (
      <div className="space-y-6 animate-fade-in p-4 md:p-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleVoltar}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-3xl font-bold">Nova Medição</h2>
            <p className="text-muted-foreground">Paciente: {paciente.nome}</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              Prontuário Necessário
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Para realizar uma medição é necessário ter um prontuário criado para o paciente. 
                Isso garante que todas as informações fiquem organizadas e vinculadas à consulta.
              </AlertDescription>
            </Alert>
            
            <div className="flex gap-4">
              <Button 
                onClick={handleCriarProntuario}
                className="bg-turquesa hover:bg-turquesa/90"
              >
                Criar Primeiro Prontuário
              </Button>
              <Button 
                variant="outline" 
                onClick={handleVoltar}
              >
                Voltar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in p-4 md:p-6">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleVoltar}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-3xl font-bold">Nova Medição</h2>
          <p className="text-muted-foreground">Paciente: {paciente.nome}</p>
        </div>
      </div>

      <CompleteMedicaoForm 
        pacienteId={id!} 
        pacienteNome={paciente.nome}
        prontuarioId={prontuarioId}
        prontuarios={prontuarios}
        onSuccess={() => {
          if (fromDashboard) {
            navigate('/dashboard');
          } else {
            navigate(`/pacientes/${id}`);
          }
        }}
      />
    </div>
  );
}
