
import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Activity, Save, AlertTriangle } from "lucide-react";
import { Prontuario } from "@/types";
import { CIDSearchInput } from "@/components/prontuario/CIDSearchInput";
import { toast } from "sonner";
import { useProntuarioBackup } from "@/hooks/useProntuarioBackup";

interface DiagnosticoTabProps {
  prontuario: Prontuario;
  pacienteId: string;
  onUpdate?: (field: string, value: any) => void;
  onSaveComplete?: () => Promise<void>;
}

export function DiagnosticoTab({ prontuario, pacienteId, onUpdate, onSaveComplete }: DiagnosticoTabProps) {
  const [localDiagnostico, setLocalDiagnostico] = useState("");
  const [localCid, setLocalCid] = useState("");
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasBackupData, setHasBackupData] = useState(false);
  const [isLocallyEditing, setIsLocallyEditing] = useState(false);

  const { saveToBackup, loadFromBackup, clearBackup } = useProntuarioBackup(prontuario?.id);

  // Auto-save timer
  const [autoSaveTimer, setAutoSaveTimer] = useState<NodeJS.Timeout | null>(null);

  // Verificar se há dados de backup disponíveis
  const checkBackupData = useCallback(() => {
    const diagnosticoBackup = loadFromBackup('diagnostico');
    const cidBackup = loadFromBackup('cid');
    setHasBackupData(!!(diagnosticoBackup || cidBackup));
  }, [loadFromBackup]);

  // Recuperar dados de backup se disponível
  const recoverFromBackup = useCallback(() => {
    const diagnosticoBackup = loadFromBackup('diagnostico');
    const cidBackup = loadFromBackup('cid');
    
    if (diagnosticoBackup) {
      setLocalDiagnostico(diagnosticoBackup);
      toast.info("Dados de diagnóstico recuperados do backup local");
    }
    if (cidBackup) {
      setLocalCid(cidBackup);
      toast.info("Dados de CID recuperados do backup local");
    }
    
    setHasBackupData(false);
    setIsLocallyEditing(true);
  }, [loadFromBackup]);

  // Sincronizar com dados do prontuário quando ele mudar
  useEffect(() => {
    if (!prontuario || isLocallyEditing) return;

    console.log("Carregando dados de diagnóstico:", prontuario);
    
    // Verificar backup primeiro
    checkBackupData();
    
    const diagnostico = prontuario?.diagnostico || "";
    const cid = prontuario?.cid || "";

    // Só sobrescrever se não houver backup
    if (!hasBackupData) {
      setLocalDiagnostico(diagnostico);
      setLocalCid(cid);
    }
    
    setHasChanges(false);

    console.log("Estados locais de diagnóstico definidos:", { diagnostico, cid });
  }, [prontuario, hasBackupData, checkBackupData, isLocallyEditing]);

  // Verificar mudanças e fazer backup automático
  useEffect(() => {
    if (!prontuario) return;

    const currentDiagnostico = prontuario?.diagnostico || "";
    const currentCid = prontuario?.cid || "";

    const changed = 
      localDiagnostico !== currentDiagnostico ||
      localCid !== currentCid;

    setHasChanges(changed);

    // Auto-backup com debounce
    if (changed) {
      setIsLocallyEditing(true);
      
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer);
      }
      
      const timer = setTimeout(() => {
        if (localDiagnostico !== currentDiagnostico) {
          saveToBackup('diagnostico', localDiagnostico);
        }
        if (localCid !== currentCid) {
          saveToBackup('cid', localCid);
        }
      }, 2000); // 2 segundos de debounce
      
      setAutoSaveTimer(timer);
    }

    return () => {
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer);
      }
    };
  }, [localDiagnostico, localCid, prontuario, saveToBackup, autoSaveTimer]);

  const handleCIDSelect = (cid: any) => {
    setLocalCid(cid.codigo);
    // Auto-append CID description to diagnostic notes if not already present
    const cidDescription = `${cid.codigo} - ${cid.descricao}`;
    if (!localDiagnostico.includes(cidDescription)) {
      const newDiagnostico = localDiagnostico 
        ? `${localDiagnostico}\n\n${cidDescription}`
        : cidDescription;
      setLocalDiagnostico(newDiagnostico);
    }
    setIsLocallyEditing(true);
  };

  const handleSave = async () => {
    if (!hasChanges) {
      toast.info("Nenhuma alteração para salvar.");
      return;
    }

    setIsSaving(true);
    try {
      const updates = [];

      // Verificar cada campo individualmente e salvar no banco
      const currentDiagnostico = prontuario?.diagnostico || "";
      const currentCid = prontuario?.cid || "";

      if (localDiagnostico !== currentDiagnostico) {
        const diagnosticoValue = localDiagnostico.trim() || null;
        updates.push(onUpdate?.("diagnostico", diagnosticoValue));
        console.log("Salvando diagnóstico:", diagnosticoValue);
      }
      
      if (localCid !== currentCid) {
        const cidValue = localCid.trim() || null;
        updates.push(onUpdate?.("cid", cidValue));
        console.log("Salvando CID:", cidValue);
      }

      // Aguardar todas as atualizações
      await Promise.all(updates.filter(Boolean));

      // Buscar dados atualizados do banco
      await onSaveComplete?.();

      // Limpar backups após salvamento bem-sucedido
      clearBackup('diagnostico');
      clearBackup('cid');
      
      // Resetar flag de edição local
      setIsLocallyEditing(false);
      
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
              <Activity className="h-5 w-5 text-turquesa" />
              Diagnóstico
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
            <Label htmlFor="diagnostico">Diagnóstico Clínico</Label>
            <Textarea
              id="diagnostico"
              placeholder="Descreva o diagnóstico baseado na avaliação clínica..."
              value={localDiagnostico}
              onChange={(e) => {
                setLocalDiagnostico(e.target.value);
                setIsLocallyEditing(true);
              }}
              className="min-h-[150px]"
            />
          </div>

          <CIDSearchInput
            value={localCid}
            onChange={(value) => {
              setLocalCid(value);
              setIsLocallyEditing(true);
            }}
            onCIDSelect={handleCIDSelect}
            placeholder="Digite o código CID ou busque por diagnóstico..."
            label="Código CID"
          />

          {hasChanges && (
            <div className="text-sm text-orange-600 bg-orange-50 p-2 rounded">
              Há alterações não salvas nesta aba. Os dados estão sendo salvos automaticamente localmente.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
