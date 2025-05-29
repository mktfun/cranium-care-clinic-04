
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Printer, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatAge } from "@/lib/age-utils";

export default function ImprimirProntuario() {
  const { id, prontuarioId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [paciente, setPaciente] = useState<any>(null);
  const [prontuario, setProntuario] = useState<any>(null);

  useEffect(() => {
    async function fetchData() {
      if (!id || !prontuarioId) return;
      
      setLoading(true);
      try {
        // Buscar dados do paciente
        const { data: pacienteData, error: pacienteError } = await supabase
          .from('pacientes')
          .select('*')
          .eq('id', id)
          .single();
        
        if (pacienteError) throw pacienteError;
        setPaciente(pacienteData);

        // Buscar prontuário
        const { data: prontuarioData, error: prontuarioError } = await supabase
          .from('prontuarios')
          .select('*')
          .eq('id', prontuarioId)
          .single();
        
        if (prontuarioError) throw prontuarioError;
        setProntuario(prontuarioData);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        toast.error('Erro ao carregar dados para impressão.');
        navigate(`/pacientes/${id}/prontuario`);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id, prontuarioId, navigate]);

  const handlePrint = () => {
    window.print();
  };

  const formatarData = (dataString: string) => {
    if (!dataString) return "N/A";
    const data = new Date(dataString);
    if (isNaN(data.getTime())) return "Data inválida";
    return data.toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-turquesa" />
      </div>
    );
  }

  if (!paciente || !prontuario) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-semibold mb-4">Dados não encontrados</h2>
        <Button onClick={() => navigate(`/pacientes/${id}/prontuario`)}>
          Voltar ao Prontuário
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Cabeçalho - Não imprime */}
      <div className="print:hidden p-4 border-b bg-gray-50">
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={() => navigate(`/pacientes/${id}/prontuario/${prontuarioId}`)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <Button onClick={handlePrint} className="bg-turquesa hover:bg-turquesa/90">
            <Printer className="h-4 w-4 mr-2" />
            Imprimir
          </Button>
        </div>
      </div>

      {/* Conteúdo para impressão */}
      <div className="p-8 max-w-4xl mx-auto print:p-4 print:max-w-none">
        {/* Cabeçalho do Prontuário */}
        <div className="text-center mb-8 print:mb-6">
          <h1 className="text-2xl font-bold text-turquesa mb-2">PRONTUÁRIO MÉDICO</h1>
          <p className="text-lg">Cranium Care Clinic</p>
          <hr className="my-4" />
        </div>

        {/* Dados do Paciente */}
        <Card className="mb-6 print:shadow-none print:border">
          <CardHeader>
            <CardTitle>Dados do Paciente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <strong>Nome:</strong> {paciente.nome}
              </div>
              <div>
                <strong>Data de Nascimento:</strong> {formatarData(paciente.data_nascimento)}
              </div>
              <div>
                <strong>Sexo:</strong> {paciente.sexo === 'M' ? 'Masculino' : 'Feminino'}
              </div>
              <div>
                <strong>Idade:</strong> {formatAge(paciente.data_nascimento)}
              </div>
              {paciente.local_nascimento && (
                <div className="col-span-2">
                  <strong>Local de Nascimento:</strong> {paciente.local_nascimento}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Dados da Consulta */}
        <Card className="mb-6 print:shadow-none print:border">
          <CardHeader>
            <CardTitle>Dados da Consulta</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <strong>Data da Consulta:</strong> {formatarData(prontuario.data_criacao)}
              </div>
              <div>
                <strong>Peso:</strong> {prontuario.peso ? `${prontuario.peso} kg` : 'Não informado'}
              </div>
              <div>
                <strong>Altura:</strong> {prontuario.altura ? `${prontuario.altura} cm` : 'Não informado'}
              </div>
              <div>
                <strong>Tipo Sanguíneo:</strong> {prontuario.tipo_sanguineo || 'Não informado'}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Anamnese e Avaliação */}
        {(prontuario.queixa_principal || prontuario.observacoes_anamnese || prontuario.avaliacao) && (
          <Card className="mb-6 print:shadow-none print:border">
            <CardHeader>
              <CardTitle>Anamnese e Avaliação</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {prontuario.queixa_principal && (
                <div>
                  <strong>Queixa Principal:</strong>
                  <p className="mt-1">{prontuario.queixa_principal}</p>
                </div>
              )}
              {prontuario.observacoes_anamnese && (
                <div>
                  <strong>Observações da Anamnese:</strong>
                  <p className="mt-1">{prontuario.observacoes_anamnese}</p>
                </div>
              )}
              {prontuario.avaliacao && (
                <div>
                  <strong>Avaliação:</strong>
                  <p className="mt-1">{prontuario.avaliacao}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Diagnóstico */}
        {(prontuario.diagnostico || prontuario.cid) && (
          <Card className="mb-6 print:shadow-none print:border">
            <CardHeader>
              <CardTitle>Diagnóstico</CardTitle>
            </CardHeader>
            <CardContent>
              {prontuario.diagnostico && (
                <div className="mb-4">
                  <strong>Diagnóstico:</strong>
                  <p className="mt-1">{prontuario.diagnostico}</p>
                </div>
              )}
              {prontuario.cid && (
                <div>
                  <strong>CID:</strong> {prontuario.cid}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Conduta */}
        {prontuario.conduta && (
          <Card className="mb-6 print:shadow-none print:border">
            <CardHeader>
              <CardTitle>Conduta</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{prontuario.conduta}</p>
            </CardContent>
          </Card>
        )}

        {/* Prescrição */}
        {prontuario.prescricao && (
          <Card className="mb-6 print:shadow-none print:border">
            <CardHeader>
              <CardTitle>Prescrição</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{prontuario.prescricao}</p>
            </CardContent>
          </Card>
        )}

        {/* Alergias e Observações */}
        {(prontuario.alergias || prontuario.observacoes_gerais) && (
          <Card className="mb-6 print:shadow-none print:border">
            <CardHeader>
              <CardTitle>Informações Adicionais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {prontuario.alergias && (
                <div>
                  <strong>Alergias:</strong>
                  <p className="mt-1">{prontuario.alergias}</p>
                </div>
              )}
              {prontuario.observacoes_gerais && (
                <div>
                  <strong>Observações Gerais:</strong>
                  <p className="mt-1">{prontuario.observacoes_gerais}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Rodapé */}
        <div className="mt-8 pt-4 border-t print:fixed print:bottom-0 print:left-0 print:right-0 print:bg-white">
          <div className="text-center text-sm text-gray-600">
            <p>Cranium Care Clinic - Sistema de Acompanhamento Craniano Pediátrico</p>
            <p>Impresso em: {new Date().toLocaleString('pt-BR')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
