
import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FileCheck, Save, Edit, AlertTriangle } from "lucide-react";
import { Prontuario } from "@/types";
import { toast } from "sonner";
import { useProntuarioBackup } from "@/hooks/useProntuarioBackup";

interface PrescricaoTabProps {
  prontuario: Prontuario;
  pacienteId: string;
  onUpdate?: (field: string, value: any) => void;
  onSaveComplete?: () => Promise<void>;
}

export function PrescricaoTab({ prontuario, pacienteId, onUpdate, onSaveComplete }: PrescricaoTabProps) {
  const [localPrescricao, setLocalPrescricao] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasBackupData, setHasBackupData] = useState(false);
  const [isLocallyEditing, setIsLocallyEditing] = useState(false);
  const [savedPrescricao, setSavedPrescricao] = useState("");

  const { saveToBackup, loadFromBackup, clearBackup } = useProntuarioBackup(prontuario?.id);

  // Auto-save timer
  const [autoSaveTimer, setAutoSaveTimer] = useState<NodeJS.Timeout | null>(null);

  // Verificar se há dados de backup disponíveis
  const checkBackupData = useCallback(() => {
    const prescricaoBackup = loadFromBackup('prescricao');
    setHasBackupData(!!prescricaoBackup);
  }, [loadFromBackup]);

  // Recuperar dados de backup se disponível
  const recoverFromBackup = useCallback(() => {
    const prescricaoBackup = loadFromBackup('prescricao');
    
    if (prescricaoBackup) {
      setLocalPrescricao(prescricaoBackup);
      toast.info("Dados de prescrição recuperados do backup local");
    }
    
    setHasBackupData(false);
    setIsLocallyEditing(true);
  }, [loadFromBackup]);

  // Sincronizar com dados do prontuário quando ele mudar
  useEffect(() => {
    if (!prontuario || isLocallyEditing) return;

    console.log("Carregando dados de prescrição:", prontuario);
    
    // Verificar backup primeiro
    checkBackupData();
    
    const prescricao = prontuario?.prescricao || "";

    // Só sobrescrever se não houver backup
    if (!hasBackupData) {
      setLocalPrescricao(prescricao);
    }
    
    setSavedPrescricao(prescricao);

    // Se há dados salvos, não está em modo de edição
    setIsEditing(!prescricao);

    console.log("Estados locais de prescrição definidos:", { prescricao });
  }, [prontuario, hasBackupData, checkBackupData, isLocallyEditing]);

  // Verificar se há mudanças não salvas
  const hasUnsavedChanges = localPrescricao !== savedPrescricao;

  // Ativar modo de edição quando houver mudanças e fazer backup automático
  useEffect(() => {
    if (hasUnsavedChanges) {
      setIsEditing(true);
      setIsLocallyEditing(true);

      // Auto-backup com debounce
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer);
      }
      
      const timer = setTimeout(() => {
        if (localPrescricao !== savedPrescricao) {
          saveToBackup('prescricao', localPrescricao);
        }
      }, 2000); // 2 segundos de debounce
      
      setAutoSaveTimer(timer);
    }

    return () => {
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer);
      }
    };
  }, [hasUnsavedChanges, localPrescricao, savedPrescricao, saveToBackup, autoSaveTimer]);

  const handleFieldChange = (value: string) => {
    setLocalPrescricao(value);
    setIsEditing(true);
    setIsLocallyEditing(true);
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

      // Buscar dados atualizados do banco
      await onSaveComplete?.();

      // Limpar backup após salvamento bem-sucedido
      clearBackup('prescricao');

      // Atualizar estado salvo após sucesso
      setSavedPrescricao(localPrescricao);

      // Sair do modo de edição
      setIsEditing(false);
      setIsLocallyEditing(false);
      
      toast.success("Dados salvos com sucesso!");
    } catch (error) {
      toast.error("Erro ao salvar dados. Os dados foram mantidos localmente.");
      console.error("Erro ao salvar:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setIsLocallyEditing(true);
  };

  const showSaveButton = isEditing || hasUnsavedChanges;

  return (
    <div className="space-y-6">
      {hasBackupData && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-orange-700">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm font-medium">Dados recuperados encontrados</span>
            </div>
            <p className="text-sm text-orange-600 mt-1">
              Foram encontrados dados não salvos anteriormente. Deseja recuperá-los?
            </p>
            <div className="flex gap-2 mt-3">
              <Button 
                size="sm" 
                onClick={recoverFromBackup}
                className="bg-orange-600 hover:bg-orange-700"
              >
                Recuperar Dados
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => setHasBackupData(false)}
              >
                Descartar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

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
              Há alterações não salvas nesta aba. Os dados estão sendo salvos automaticamente localmente.
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
