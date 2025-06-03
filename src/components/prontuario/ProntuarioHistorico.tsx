
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, FilePlus, Calendar } from "lucide-react";
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
  const [showCreationDialog, setShowCreationDialog] = useState(false);
  const [showWizard, setShowWizard] = useState(false);

  const formatarData = (dataString: string) => {
    if (!dataString) return "N/A";
    const data = new Date(dataString);
    if (isNaN(data.getTime())) return "Data inválida";
    return data.toLocaleDateString('pt-BR');
  };

  const handleCreateWithMeasurement = () => {
    setShowCreationDialog(false);
    // Redirecionar para página de medição
    window.location.href = `/pacientes/${pacienteId}/nova-medicao`;
  };

  const handleCreateWithWizard = () => {
    setShowCreationDialog(false);
    setShowWizard(true);
  };

  const handleWizardSuccess = (novoProntuario: Prontuario) => {
    setShowWizard(false);
    onNovoProntuario(novoProntuario);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="h-4 w-4 text-turquesa" />
            Histórico de Consultas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button 
            onClick={() => setShowCreationDialog(true)}
            className="w-full bg-turquesa hover:bg-turquesa/90"
          >
            <FilePlus className="h-4 w-4 mr-2" />
            Nova Consulta
          </Button>
          
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {prontuarios.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenhuma consulta encontrada
              </p>
            ) : (
              prontuarios.map((prontuario) => (
                <div
                  key={prontuario.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    currentProntuario?.id === prontuario.id
                      ? "bg-turquesa/10 border-turquesa"
                      : "hover:bg-accent"
                  }`}
                  onClick={() => onSelecionarProntuario(prontuario)}
                >
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">
                      {formatarData(prontuario.data_criacao)}
                    </span>
                  </div>
                  {prontuario.queixa_principal && (
                    <p className="text-xs text-muted-foreground mt-1 truncate">
                      {prontuario.queixa_principal}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <ProntuarioCreationDialog
        open={showCreationDialog}
        onOpenChange={setShowCreationDialog}
        pacienteId={pacienteId}
        pacienteNome={pacienteNome}
        onCreateWithMeasurement={handleCreateWithMeasurement}
        onCreateWithWizard={handleCreateWithWizard}
      />

      <ProntuarioWizard
        open={showWizard}
        onOpenChange={setShowWizard}
        pacienteId={pacienteId}
        paciente={paciente}
        onSuccess={handleWizardSuccess}
      />
    </>
  );
}
