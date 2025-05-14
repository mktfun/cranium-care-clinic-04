import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Loader2, ChevronLeft } from "lucide-react";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { EditarPacienteForm } from "@/components/EditarPacienteForm";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Paciente } from "@/types";

export default function DetalhePaciente() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [paciente, setPaciente] = useState<Paciente | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPaciente() {
      if (id) {
        setLoading(true);
        try {
          const { data: pacienteData, error: pacienteError } = await supabase
            .from('pacientes')
            .select('*')
            .eq('id', id)
            .single();

          if (pacienteError) {
            console.error("Erro ao carregar paciente:", pacienteError);
            toast.error("Erro ao carregar dados do paciente.");
          }

          if (pacienteData) {
            setPaciente(pacienteData);
          }
        } catch (error) {
          console.error("Erro ao buscar paciente:", error);
          toast.error("Erro ao buscar dados do paciente.");
        } finally {
          setLoading(false);
        }
      }
    }

    fetchPaciente();
  }, [id]);

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

  const formatarData = (data: string) => {
    try {
      const parsedDate = new Date(data);
      return format(parsedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    } catch (error) {
      console.error("Erro ao formatar a data:", error);
      return "Data inválida";
    }
  };

  return (
    <div className="space-y-6 animate-fade-in p-4 md:p-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/pacientes")}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-3xl font-bold">{paciente.nome}</h2>
            <p className="text-muted-foreground">
              Cadastrado em: {formatarData(paciente.created_at || '')}
            </p>
          </div>
        </div>
        <Button onClick={() => navigate(`/pacientes/${id}/prontuario`)} className="bg-turquesa hover:bg-turquesa/90">
          Ver Prontuário
        </Button>
      </div>

      <Separator />

      {/* Detalhes do Paciente */}
      <Card>
        <CardHeader>
          <CardTitle>Informações do Paciente</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Nome Completo</p>
              <p className="text-lg">{paciente.nome}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Data de Nascimento</p>
              <p className="text-lg">{formatarData(paciente.data_nascimento)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Sexo</p>
              <p className="text-lg">{paciente.sexo}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Editar Paciente</CardTitle>
        </CardHeader>
        <CardContent>
          <EditarPacienteForm
            paciente={paciente}
          />
        </CardContent>
      </Card>
    </div>
  );
}
