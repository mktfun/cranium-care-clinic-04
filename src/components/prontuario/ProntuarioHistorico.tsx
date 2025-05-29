
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FilePlus, Calendar, Activity, FileText } from "lucide-react";
import { Prontuario } from "@/types";

interface ProntuarioHistoricoProps {
  prontuarios: Prontuario[];
  currentProntuario: Prontuario | null;
  onSelecionarProntuario: (prontuario: Prontuario) => void;
  onNovoProntuario: () => void;
}

export function ProntuarioHistorico({
  prontuarios,
  currentProntuario,
  onSelecionarProntuario,
  onNovoProntuario
}: ProntuarioHistoricoProps) {
  const formatarData = (dataString: string) => {
    if (!dataString) return "N/A";
    const data = new Date(dataString);
    if (isNaN(data.getTime())) return "Data inválida";
    return data.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatarDataCompleta = (dataString: string) => {
    if (!dataString) return "N/A";
    const data = new Date(dataString);
    if (isNaN(data.getTime())) return "Data inválida";
    return data.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const getDiagnosticoResumo = (prontuario: Prontuario) => {
    if (prontuario.diagnostico) {
      const primeiraLinha = prontuario.diagnostico.split('\n')[0];
      return primeiraLinha.length > 50 
        ? primeiraLinha.substring(0, 50) + "..."
        : primeiraLinha;
    }
    return "Sem diagnóstico registrado";
  };

  return (
    <Card className="h-fit">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="h-4 w-4 text-turquesa" />
            Histórico de Consultas
          </CardTitle>
          <Button 
            size="sm"
            onClick={onNovoProntuario}
            className="bg-turquesa hover:bg-turquesa/90"
          >
            <FilePlus className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {prontuarios.length === 0 ? (
          <div className="text-center py-6">
            <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground mb-3">
              Nenhuma consulta registrada
            </p>
            <Button 
              size="sm"
              onClick={onNovoProntuario}
              className="bg-turquesa hover:bg-turquesa/90"
            >
              <FilePlus className="h-4 w-4 mr-1" />
              Primeira Consulta
            </Button>
          </div>
        ) : (
          prontuarios.map((prontuario, index) => (
            <div
              key={prontuario.id}
              className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                currentProntuario?.id === prontuario.id
                  ? 'border-turquesa bg-turquesa/5'
                  : 'border-border hover:border-turquesa/50 hover:bg-muted/50'
              }`}
              onClick={() => onSelecionarProntuario(prontuario)}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">
                    {formatarData(prontuario.data_criacao)}
                  </span>
                </div>
                {index === 0 && (
                  <Badge variant="secondary" className="text-xs">
                    Mais recente
                  </Badge>
                )}
              </div>
              
              <div className="space-y-1">
                <div className="flex items-start gap-2">
                  <Activity className="h-3 w-3 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {getDiagnosticoResumo(prontuario)}
                  </p>
                </div>
                
                {prontuario.cid && (
                  <div className="flex items-center gap-1">
                    <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                      {prontuario.cid}
                    </Badge>
                  </div>
                )}
              </div>
              
              <div className="text-xs text-muted-foreground mt-2">
                {formatarDataCompleta(prontuario.data_criacao)}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
