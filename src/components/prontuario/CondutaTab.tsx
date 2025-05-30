
import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Stethoscope, FileText, Save, AlertTriangle } from "lucide-react";
import { Prontuario } from "@/types";
import { toast } from "sonner";
import { useProntuarioBackup } from "@/hooks/useProntuarioBackup";

interface CondutaTabProps {
  prontuario: Prontuario;
  pacienteId: string;
  onUpdate?: (field: string, value: any) => void;
}

export function CondutaTab({ prontuario, pacienteId, onUpdate }: CondutaTabProps) {
  const [localConduta, setLocalConduta] = useState("");
  const [localAtestado, setLocalAtestado] = useState("");
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasBackupData, setHasBackupData] = useState(false);

  const { saveToBackup, loadFromBackup, clearBackup } = useProntuarioBackup(prontuario?.id);

  // Auto-save timer
  const [autoSaveTimer, setAutoSaveTimer] = useState<NodeJS.Timeout | null>(null);

  // Verificar se há dados de backup disponíveis
  const checkBackupData = useCallback(() => {
    const condutaBackup = loadFromBackup('conduta');
    const atestadoBackup = loadFromBackup('atestado');
    setHasBackupData(!!(condutaBackup || atestadoBackup));
  }, [loadFromBackup]);

  // Recuperar dados de backup se disponível
  const recoverFromBackup = useCallback(() => {
    const condutaBackup = loadFromBackup('conduta');
    const atestadoBackup = loadFromBackup('atestado');
    
    if (condutaBackup) {
      setLocalConduta(condutaBackup);
      toast.info("Dados de conduta recuperados do backup local");
    }
    if (atestadoBackup) {
      setLocalAtestado(atestadoBackup);
      toast.info("Dados de atestado recuperados do backup local");
    }
    
    setHasBackupData(false);
  }, [loadFromBackup]);

  // Sincronizar com dados do prontuário quando ele mudar
  useEffect(() => {
    console.log("Carregando dados de conduta:", prontuario);
    
    // Verificar backup primeiro
    checkBackupData();
    
    const conduta = prontuario?.conduta || "";
    const atestado = prontuario?.atestado || "";

    // Só sobrescrever se não houver backup ou se os dados do banco forem mais recentes
    if (!hasBackupData) {
      setLocalConduta(conduta);
      setLocalAtestado(atestado);
    }
    
    setHasChanges(false);

    console.log("Estados locais de conduta definidos:", { conduta, atestado });
  }, [prontuario, hasBackupData, checkBackupData]);

  // Verificar mudanças e fazer backup automático
  useEffect(() => {
    if (!prontuario) return;

    const currentConduta = prontuario?.conduta || "";
    const currentAtestado = prontuario?.atestado || "";

    const changed = 
      localConduta !== currentConduta ||
      localAtestado !== currentAtestado;

    setHasChanges(changed);

    // Auto-backup com debounce
    if (changed) {
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer);
      }
      
      const timer = setTimeout(() => {
        if (localConduta !== currentConduta) {
          saveToBackup('conduta', localConduta);
        }
        if (localAtestado !== currentAtestado) {
          saveToBackup('atestado', localAtestado);
        }
      }, 2000); // 2 segundos de debounce
      
      setAutoSaveTimer(timer);
    }

    return () => {
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer);
      }
    };
  }, [localConduta, localAtestado, prontuario, saveToBackup, autoSaveTimer]);

  const handleSave = async () => {
    if (!hasChanges) {
      toast.info("Nenhuma alteração para salvar.");
      return;
    }

    setIsSaving(true);
    try {
      const updates = [];

      // Verificar cada campo individualmente e salvar no banco
      const currentConduta = prontuario?.conduta || "";
      const currentAtestado = prontuario?.atestado || "";

      if (localConduta !== currentConduta) {
        const condutaValue = localConduta.trim() || null;
        updates.push(onUpdate?.("conduta", condutaValue));
        console.log("Salvando conduta:", condutaValue);
      }
      
      if (localAtestado !== currentAtestado) {
        const atestadoValue = localAtestado.trim() || null;
        updates.push(onUpdate?.("atestado", atestadoValue));
        console.log("Salvando atestado:", atestadoValue);
      }

      // Aguardar todas as atualizações
      await Promise.all(updates.filter(Boolean));

      // Limpar backups após salvamento bem-sucedido
      clearBackup('conduta');
      clearBackup('atestado');
      
      toast.success("Dados salvos com sucesso!");
    } catch (error) {
      toast.error("Erro ao salvar dados. Os dados foram mantidos localmente.");
      console.error("Erro ao salvar:", error);
    } finally {
      setIsSaving(false);
    }
  };

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
              <Stethoscope className="h-5 w-5 text-turquesa" />
              Conduta Médica
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
            <Label htmlFor="conduta">Conduta e Orientações</Label>
            <Textarea
              id="conduta"
              placeholder="Descreva a conduta médica, orientações e tratamentos indicados..."
              value={localConduta}
              onChange={(e) => setLocalConduta(e.target.value)}
              className="min-h-[150px]"
            />
          </div>

          {hasChanges && (
            <div className="text-sm text-orange-600 bg-orange-50 p-2 rounded">
              Há alterações não salvas nesta aba. Os dados estão sendo salvos automaticamente localmente.
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-turquesa" />
            Atestado Médico
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <Label htmlFor="atestado">Atestado</Label>
            <Textarea
              id="atestado"
              placeholder="Informações para atestado médico, se necessário..."
              value={localAtestado}
              onChange={(e) => setLocalAtestado(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
