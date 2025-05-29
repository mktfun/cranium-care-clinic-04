
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Brain, Plus, TrendingUp, Calendar, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { formatAge } from "@/lib/age-utils";
import { getSeverityInfo } from "@/lib/cranial-classification-utils";

interface Medicao {
  id: string;
  data: string;
  comprimento: number;
  largura: number;
  diagonal_d: number;
  diagonal_e: number;
  perimetro_cefalico?: number;
  indice_craniano: number;
  diferenca_diagonais?: number;
  cvai: number;
  status: string;
  observacoes?: string;
  recomendacoes?: string[];
  prontuario_id?: string;
}

interface AvaliacoesCraniaisTabProps {
  pacienteId: string;
  prontuarioId?: string;
}

export function AvaliacoesCraniaisTab({ pacienteId, prontuarioId }: AvaliacoesCraniaisTabProps) {
  const [medicoes, setMedicoes] = useState<Medicao[]>([]);
  const [paciente, setPaciente] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, [pacienteId, prontuarioId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Buscar dados do paciente
      const { data: pacienteData, error: pacienteError } = await supabase
        .from('pacientes')
        .select('*')
        .eq('id', pacienteId)
        .single();
      
      if (pacienteError) throw pacienteError;
      setPaciente(pacienteData);

      // Buscar medições cranianas - filtrando por prontuário se especificado
      let query = supabase
        .from('medicoes')
        .select('*')
        .eq('paciente_id', pacienteId)
        .order('data', { ascending: false });
      
      // Se há um prontuarioId específico, filtrar apenas as medições deste prontuário
      if (prontuarioId) {
        query = query.eq('prontuario_id', prontuarioId);
      }
      
      const { data: medicoesData, error: medicoesError } = await query;
      
      if (medicoesError) throw medicoesError;
      setMedicoes(medicoesData || []);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      toast.error('Erro ao carregar avaliações cranianas');
    } finally {
      setLoading(false);
    }
  };

  const formatarData = (dataString: string) => {
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR');
  };

  const getStatusBadge = (status: string) => {
    const severityInfo = getSeverityInfo(status as any);
    return (
      <Badge 
        variant={severityInfo.variant as any}
        className={severityInfo.className}
      >
        {severityInfo.label}
      </Badge>
    );
  };

  const getEvolutionTrend = () => {
    if (medicoes.length < 2) return null;
    
    const latest = medicoes[0];
    const previous = medicoes[1];
    
    const isImproving = latest.cvai < previous.cvai;
    
    return (
      <div className={`flex items-center gap-1 text-sm ${isImproving ? 'text-green-600' : 'text-orange-600'}`}>
        <TrendingUp className={`h-4 w-4 ${isImproving ? '' : 'rotate-180'}`} />
        {isImproving ? 'Melhorando' : 'Necessita atenção'}
      </div>
    );
  };

  const handleNovaMedicao = () => {
    if (prontuarioId) {
      // Se estamos em um prontuário específico, criar medição para este prontuário
      navigate(`/pacientes/${pacienteId}/nova-medicao`, { 
        state: { prontuarioId, fromProntuario: true } 
      });
    } else {
      // Comportamento padrão - redirecionar para seleção
      navigate(`/pacientes/${pacienteId}/nova-medicao`);
    }
  };

  const handleVerRelatorio = (medicaoId: string) => {
    navigate(`/pacientes/${pacienteId}/relatorios/${medicaoId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium flex items-center gap-2">
            <Brain className="h-5 w-5 text-turquesa" />
            Avaliações Cranianas
            {prontuarioId && <span className="text-sm text-muted-foreground">(desta consulta)</span>}
          </h3>
          <p className="text-sm text-muted-foreground">
            {prontuarioId 
              ? "Medições associadas a esta consulta específica"
              : "Histórico de medições e análises craniométricas"
            }
          </p>
        </div>
        <Button 
          onClick={handleNovaMedicao}
          className="bg-turquesa hover:bg-turquesa/90"
        >
          <Plus className="h-4 w-4 mr-2" />
          {prontuarioId ? "Nova Medição para Esta Consulta" : "Nova Medição"}
        </Button>
      </div>

      {medicoes.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">
              {prontuarioId 
                ? "Nenhuma medição para esta consulta"
                : "Nenhuma avaliação craniana encontrada"
              }
            </h3>
            <p className="text-muted-foreground mb-6">
              {prontuarioId
                ? "Realize uma medição craniana para esta consulta específica."
                : "Realize a primeira medição craniana para iniciar o acompanhamento."
              }
            </p>
            <Button 
              onClick={handleNovaMedicao}
              className="bg-turquesa hover:bg-turquesa/90"
            >
              <Plus className="h-4 w-4 mr-2" />
              {prontuarioId ? "Primeira Medição desta Consulta" : "Primeira Medição"}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Resumo Geral */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Resumo das Avaliações
                {getEvolutionTrend()}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-turquesa">{medicoes.length}</div>
                  <div className="text-sm text-muted-foreground">
                    {prontuarioId ? "Medições desta Consulta" : "Total de Medições"}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {medicoes[0] ? medicoes[0].cvai.toFixed(1) + '%' : '--'}
                  </div>
                  <div className="text-sm text-muted-foreground">CVAI Atual</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {medicoes[0] ? medicoes[0].indice_craniano.toFixed(1) + '%' : '--'}
                  </div>
                  <div className="text-sm text-muted-foreground">IC Atual</div>
                </div>
                <div className="text-center">
                  {medicoes[0] && getStatusBadge(medicoes[0].status)}
                  <div className="text-sm text-muted-foreground mt-1">Status Atual</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lista de Medições */}
          <Card>
            <CardHeader>
              <CardTitle>
                {prontuarioId ? "Medições desta Consulta" : "Histórico de Medições"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {medicoes.map((medicao, index) => (
                  <div key={medicao.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{formatarData(medicao.data)}</span>
                          {paciente && (
                            <span className="text-sm text-muted-foreground">
                              (Idade: {formatAge(paciente.data_nascimento, medicao.data)})
                            </span>
                          )}
                        </div>
                        {getStatusBadge(medicao.status)}
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className="text-sm text-muted-foreground">
                          Medição #{medicoes.length - index}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleVerRelatorio(medicao.id)}
                          className="flex items-center gap-1"
                        >
                          <FileText className="h-4 w-4" />
                          Ver Relatório
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">CVAI</div>
                        <div className="font-medium">{medicao.cvai.toFixed(1)}%</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Índice Craniano</div>
                        <div className="font-medium">{medicao.indice_craniano.toFixed(1)}%</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Comprimento</div>
                        <div className="font-medium">{medicao.comprimento.toFixed(1)} mm</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Largura</div>
                        <div className="font-medium">{medicao.largura.toFixed(1)} mm</div>
                      </div>
                    </div>

                    {medicao.observacoes && (
                      <div className="mt-3 pt-3 border-t">
                        <div className="text-sm">
                          <div className="text-muted-foreground mb-1">Observações:</div>
                          <div>{medicao.observacoes}</div>
                        </div>
                      </div>
                    )}

                    {medicao.recomendacoes && medicao.recomendacoes.length > 0 && (
                      <div className="mt-3 pt-3 border-t">
                        <div className="text-sm">
                          <div className="text-muted-foreground mb-1">Recomendações:</div>
                          <ul className="list-disc list-inside space-y-1">
                            {medicao.recomendacoes.map((rec, i) => (
                              <li key={i}>{rec}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
