
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatAge } from "@/lib/age-utils";
import { getCranialStatus } from "@/lib/cranial-utils";
import { StatusBadge } from "@/components/StatusBadge";
import { Eye, FileBarChart2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AvaliacoesCraniaisTabProps {
  pacienteId: string;
}

export function AvaliacoesCraniaisTab({ pacienteId }: AvaliacoesCraniaisTabProps) {
  const [medicoes, setMedicoes] = useState<any[]>([]);
  const [paciente, setPaciente] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        
        // Buscar dados do paciente para data de nascimento
        const { data: pacienteData, error: pacienteError } = await supabase
          .from('pacientes')
          .select('data_nascimento')
          .eq('id', pacienteId)
          .single();
        
        if (pacienteError) {
          console.error('Erro ao carregar dados do paciente:', pacienteError);
          toast.error('Erro ao carregar dados do paciente.');
        } else {
          setPaciente(pacienteData);
        }
        
        // Buscar medições
        const { data: medicoesData, error: medicoesError } = await supabase
          .from('medicoes')
          .select('*')
          .eq('paciente_id', pacienteId)
          .order('data', { ascending: false });
        
        if (medicoesError) {
          console.error('Erro ao carregar medições:', medicoesError);
          toast.error('Erro ao carregar medições.');
        } else {
          setMedicoes(medicoesData || []);
        }
      } catch (err) {
        console.error('Erro inesperado:', err);
        toast.error('Erro ao carregar dados.');
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, [pacienteId]);
  
  const formatarData = (dataString: string) => {
    if (!dataString) return "N/A";
    const data = new Date(dataString);
    if (isNaN(data.getTime())) return "Data inválida";
    return data.toLocaleDateString('pt-BR');
  };
  
  const handleVerRelatorio = (medicaoId: string) => {
    navigate(`/pacientes/${pacienteId}/relatorios/${medicaoId}`);
  };
  
  const handleNovaAvaliacao = () => {
    navigate(`/pacientes/${pacienteId}/nova-medicao`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Avaliações Cranianas</h3>
        <Button 
          onClick={handleNovaAvaliacao}
          className="flex items-center gap-1 bg-turquesa hover:bg-turquesa/90"
        >
          <FileBarChart2 className="h-4 w-4" /> Nova Avaliação
        </Button>
      </div>
      
      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="mt-2 text-muted-foreground">Carregando avaliações...</p>
        </div>
      ) : medicoes.length > 0 ? (
        <div className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-border">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Data</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Idade</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Índice Craniano</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">CVAI</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {medicoes.map((medicao) => {
                      const { asymmetryType, severityLevel } = getCranialStatus(
                        medicao.indice_craniano, 
                        medicao.cvai
                      );
                      return (
                        <tr key={medicao.id} className="hover:bg-muted/50">
                          <td className="px-4 py-3 whitespace-nowrap text-sm">{formatarData(medicao.data)}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">
                            {paciente?.data_nascimento ? formatAge(paciente.data_nascimento, medicao.data) : "N/A"}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">
                            {medicao.indice_craniano ? `${medicao.indice_craniano.toFixed(1)}%` : '-'}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">
                            {medicao.cvai ? `${medicao.cvai.toFixed(1)}%` : '-'}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">
                            <StatusBadge status={severityLevel} asymmetryType={asymmetryType} />
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleVerRelatorio(medicao.id)}
                              className="flex items-center gap-1 text-turquesa hover:text-turquesa/90"
                            >
                              <Eye className="h-4 w-4" /> Ver Relatório
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardContent className="py-8 text-center">
            <FileBarChart2 className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">Nenhuma avaliação craniana registrada para este paciente.</p>
            <Button 
              className="mt-4 bg-turquesa hover:bg-turquesa/90"
              onClick={handleNovaAvaliacao}
            >
              <FileBarChart2 className="h-4 w-4 mr-2" /> Realizar Avaliação
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
