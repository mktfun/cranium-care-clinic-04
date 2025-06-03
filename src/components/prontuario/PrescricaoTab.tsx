
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FileCheck, Save, Edit } from "lucide-react";
import { Prontuario } from "@/types";
import { toast } from "sonner";

interface PrescricaoTabProps {
  prontuario: Prontuario;
  pacienteId: string;
  onUpdate?: (field: string, value: any) => void;
}

export function PrescricaoTab({ prontuario, pacienteId, onUpdate }: PrescricaoTabProps) {
  const [localPrescricao, setLocalPrescricao] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedPrescricao, setSavedPrescricao] = useState("");

  // Sincronizar com dados do prontuário quando ele mudar
  useEffect(() => {
    if (!prontuario) return;

    console.log("Carregando dados de prescrição:", prontuario);
    const prescricao = prontuario?.prescricao || "";

    setLocalPrescricao(prescricao);
    setSavedPrescricao(prescricao);

    // Se há dados salvos, não está em modo de edição
    setIsEditing(!prescricao);

    console.log("Estados locais de prescrição definidos:", { prescricao });
  }, [prontuario]);

  // Verificar se há mudanças não salvas
  const hasUnsavedChanges = localPrescricao !== savedPrescricao;

  // Ativar modo de edição quando houver mudanças
  useEffect(() => {
    if (hasUnsavedChanges) {
      setIsEditing(true);
    }
  }, [hasUnsavedChanges]);

  const handleFieldChange = (value: string) => {
    setLocalPrescricao(value);
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!hasUnsavedChanges) {
      toast.info("Nenhuma alteração para salvar.");
      return;
    }

    setIsSaving(true);
    try {
      const prescricaoValue = localPrescricao.trim() || null;
      await onUpdate?.("prescricao", prescricaoValue);
      console.log("Salvando prescrição:", prescricaoValue);

      // Atualizar estado salvo após sucesso
      setSavedPrescricao(localPrescricao);

      // Sair do modo de edição
      setIsEditing(false);
      
      toast.success("Dados salvos com sucesso!");
    } catch (error) {
      toast.error("Erro ao salvar dados.");
      console.error("Erro ao salvar:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const showSaveButton = isEditing || hasUnsavedChanges;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileCheck className="h-5 w-5 text-turquesa" />
              Prescrição Médica
            </CardTitle>
            {showSaveButton ? (
              <Button 
                onClick={handleSave} 
                disabled={!hasUnsavedChanges || isSaving}
                className="bg-turquesa hover:bg-turquesa/90"
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? "Salvando..." : "Salvar"}
              </Button>
            ) : (
              <Button 
                onClick={handleEdit} 
                variant="outline"
                className="border-turquesa text-turquesa hover:bg-turquesa hover:text-white"
              >
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="prescricao">Prescrição</Label>
            <Textarea
              id="prescricao"
              placeholder="Digite a prescrição médica detalhada, incluindo medicamentos, dosagens, orientações e cuidados..."
              value={localPrescricao}
              onChange={(e) => handleFieldChange(e.target.value)}
              className="min-h-[200px]"
              disabled={!isEditing}
            />
          </div>
          
          {hasUnsavedChanges && (
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
