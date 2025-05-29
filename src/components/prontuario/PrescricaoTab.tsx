
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FileCheck, Save } from "lucide-react";
import { Prontuario } from "@/types";
import { toast } from "sonner";

interface PrescricaoTabProps {
  prontuario: Prontuario;
  pacienteId: string;
  onUpdate?: (field: string, value: any) => void;
}

export function PrescricaoTab({ prontuario, pacienteId, onUpdate }: PrescricaoTabProps) {
  const [localPrescricao, setLocalPrescricao] = useState("");
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Sincronizar com dados do prontuário quando ele mudar
  useEffect(() => {
    setLocalPrescricao(prontuario?.prescricao || "");
    setHasChanges(false);
  }, [prontuario]);

  // Verificar mudanças
  useEffect(() => {
    const changed = localPrescricao !== (prontuario?.prescricao || "");
    setHasChanges(changed);
  }, [localPrescricao, prontuario]);

  const handleSave = async () => {
    if (!hasChanges) {
      toast.info("Nenhuma alteração para salvar.");
      return;
    }

    setIsSaving(true);
    try {
      if (localPrescricao !== (prontuario?.prescricao || "")) {
        await onUpdate?.("prescricao", localPrescricao || null);
      }
      
      setHasChanges(false);
      toast.success("Dados salvos com sucesso!");
    } catch (error) {
      toast.error("Erro ao salvar dados.");
      console.error("Erro ao salvar:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileCheck className="h-5 w-5 text-turquesa" />
              Prescrição Médica
            </CardTitle>
            <Button 
              onClick={handleSave} 
              disabled={!hasChanges || isSaving}
              className="bg-turquesa hover:bg-turquesa/90"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="prescricao">Prescrição</Label>
            <Textarea
              id="prescricao"
              placeholder="Digite a prescrição médica detalhada, incluindo medicamentos, dosagens, orientações e cuidados..."
              value={localPrescricao}
              onChange={(e) => setLocalPrescricao(e.target.value)}
              className="min-h-[200px]"
            />
          </div>
          
          {hasChanges && (
            <div className="text-sm text-orange-600 bg-orange-50 p-2 rounded">
              Há alterações não salvas nesta aba.
            </div>
          )}
          
          <div className="text-sm text-muted-foreground mt-4 p-3 bg-muted rounded-lg">
            <p><strong>Dicas para prescrição:</strong></p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Inclua nome do medicamento, dosagem e frequência</li>
              <li>Especifique duração do tratamento</li>
              <li>Adicione orientações especiais para o cuidador</li>
              <li>Mencione sinais de alerta para retorno</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
