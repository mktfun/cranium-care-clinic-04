
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, Plus, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { MedicoesHistoricoTable } from "@/components/relatorio/MedicoesHistoricoTable";
import { Separator } from "@/components/ui/separator";

interface AvaliacoesCraniaisTabProps {
  pacienteId: string;
  prontuarioId: string;
}

export function AvaliacoesCraniaisTab({ pacienteId, prontuarioId }: AvaliacoesCraniaisTabProps) {
  const navigate = useNavigate();
  const [medicoes, setMedicoes] = useState<any[]>([]);
  const [paciente, setPaciente] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        // Buscar dados do paciente
        const { data: pacienteData, error: pacienteError } = await supabase
          .from('pacientes')
          .select('*')
          .eq('id', pacienteId)
          .single();

        if (pacienteError) {
          console.error('Erro ao buscar paciente:', pacienteError);
        } else {
          setPaciente(pacienteData);
        }

        // Buscar medições do paciente
        const { data: medicoesData, error: medicoesError } = await supabase
          .from('medicoes')
          .select('*')
          .eq('paciente_id', pacienteId)
          .order('data', { ascending: false });

        if (medicoesError) {
          console.error('Erro ao buscar medições:', medicoesError);
        } else {
          setMedicoes(medicoesData || []);
        }
      } catch (error) {
        console.error('Erro inesperado:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [pacienteId]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-turquesa" />
              Avaliações Cranianas
            </CardTitle>
            <Button 
              onClick={() => navigate(`/pacientes/${pacienteId}/nova-medicao`)}
              className="bg-turquesa hover:bg-turquesa/90"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nova Medição
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {medicoes.length === 0 ? (
            <div className="text-center py-8">
              <Brain className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma avaliação craniana registrada</h3>
              <p className="text-muted-foreground mb-4">
                Adicione a primeira medição craniana para este paciente.
              </p>
              <Button 
                onClick={() => navigate(`/pacientes/${pacienteId}/nova-medicao`)}
                className="bg-turquesa hover:bg-turquesa/90"
              >
                <Plus className="h-4 w-4 mr-2" />
                Criar primeira medição
              </Button>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-muted-foreground">
                  {medicoes.length} medição{medicoes.length > 1 ? 'ões' : ''} registrada{medicoes.length > 1 ? 's' : ''}
                </p>
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/pacientes/${pacienteId}/historico`)}
                >
                  Ver histórico completo
                </Button>
              </div>
              
              <Separator className="mb-4" />
              
              <MedicoesHistoricoTable
                medicoes={medicoes.slice(0, 5)} // Mostrar apenas as 5 mais recentes
                dataNascimento={paciente?.data_nascimento || ''}
                pacienteId={pacienteId}
                showReportButtons={true}
                className="w-full"
              />
              
              {medicoes.length > 5 && (
                <div className="mt-4 text-center">
                  <Button 
                    variant="outline" 
                    onClick={() => navigate(`/pacientes/${pacienteId}/historico`)}
                  >
                    Ver todas as {medicoes.length} medições
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
