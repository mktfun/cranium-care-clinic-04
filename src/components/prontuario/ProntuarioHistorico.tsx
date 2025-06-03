
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { FilePlus, FileText, Calendar } from "lucide-react";
import { Prontuario } from "@/types";
import { ProntuarioCreationDialog } from "./ProntuarioCreationDialog";
import { ProntuarioWizard } from "./wizard/ProntuarioWizard";

interface ProntuarioHistoricoProps {
  prontuarios: Prontuario[];
  currentProntuario: Prontuario | null;
  onSelecionarProntuario: (prontuario: Prontuario) => void;
  onNovoProntuario: (prontuario: Prontuario) => void;
  pacienteId: string;
  pacienteNome: string;
  paciente: any;
}

export function ProntuarioHistorico({
  prontuarios,
  currentProntuario,
  onSelecionarProntuario,
  onNovoProntuario,
  pacienteId,
  pacienteNome,
  paciente
}: ProntuarioHistoricoProps) {
  const [isCreationDialogOpen, setIsCreationDialogOpen] = useState(false);
  const [isWizardOpen, setIsWizardOpen] = useState(false);

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

  const formatarHora = (dataString: string) => {
    if (!dataString) return "";
    const data = new Date(dataString);
    if (isNaN(data.getTime())) return "";
    return data.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleCreateWithMeasurement = () => {
    setIsCreationDialogOpen(false);
    // Redirecionar para a página de medição com flag para criar prontuário após
    window.location.href = `/pacientes/${pacienteId}/nova-medicao?createProntuario=true`;
  };

  const handleCreateWithWizard = () => {
    setIsCreationDialogOpen(false);
    setIsWizardOpen(true);
  };

  const handleWizardSuccess = (novoProntuario: Prontuario) => {
    setIsWizardOpen(false);
    onNovoProntuario(novoProntuario);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Histórico de Consultas</CardTitle>
            <Button 
              onClick={() => setIsCreationDialogOpen(true)}
              size="sm"
              className="bg-turquesa hover:bg-turquesa/90"
            >
              <FilePlus className="h-4 w-4 mr-2" />
              Nova Consulta
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[400px] p-4">
            {prontuarios.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Nenhuma consulta registrada</p>
                <p className="text-sm">Clique em "Nova Consulta" para começar</p>
              </div>
            ) : (
              <div className="space-y-2">
                {prontuarios.map((prontuario) => (
                  <div
                    key={prontuario.id}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      currentProntuario?.id === prontuario.id
                        ? 'bg-turquesa/10 border-2 border-turquesa'
                        : 'bg-muted hover:bg-muted/80 border-2 border-transparent'
                    }`}
                    onClick={() => onSelecionarProntuario(prontuario)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-turquesa" />
                        <span className="font-medium">
                          {formatarData(prontuario.data_criacao)}
                        </span>
                        {currentProntuario?.id === prontuario.id && (
                          <Badge variant="secondary" className="text-xs">
                            Atual
                          </Badge>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatarHora(prontuario.data_criacao)}
                      </span>
                    </div>
                    
                    {prontuario.queixa_principal && (
                      <p className="text-sm text-muted-foreground mt-1 truncate">
                        {prontuario.queixa_principal}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      <ProntuarioCreationDialog
        open={isCreationDialogOpen}
        onOpenChange={setIsCreationDialogOpen}
        pacienteId={pacienteId}
        pacienteNome={pacienteNome}
        onCreateWithMeasurement={handleCreateWithMeasurement}
        onCreateWithWizard={handleCreateWithWizard}
      />

      <ProntuarioWizard
        open={isWizardOpen}
        onOpenChange={setIsWizardOpen}
        pacienteId={pacienteId}
        paciente={paciente}
        onSuccess={handleWizardSuccess}
      />
    </>
  );
}
