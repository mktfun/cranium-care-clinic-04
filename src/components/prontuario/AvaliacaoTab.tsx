
import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Activity, Clock, Heart, Brain, Save, AlertTriangle } from "lucide-react";
import { Prontuario } from "@/types";
import { toast } from "sonner";
import { useProntuarioBackup } from "@/hooks/useProntuarioBackup";

interface AvaliacaoTabProps {
  prontuario: Prontuario;
  pacienteId: string;
  onUpdate?: (field: string, value: any) => void;
}

export function AvaliacaoTab({ prontuario, pacienteId, onUpdate }: AvaliacaoTabProps) {
  const [localQueixaPrincipal, setLocalQueixaPrincipal] = useState("");
  const [localIdadeGestacional, setLocalIdadeGestacional] = useState("");
  const [localIdadeCorrigida, setLocalIdadeCorrigida] = useState("");
  const [localObservacoesAnamnese, setLocalObservacoesAnamnese] = useState("");
  const [localAvaliacao, setLocalAvaliacao] = useState("");
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasBackupData, setHasBackupData] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const { saveToBackup, loadFromBackup, clearBackup } = useProntuarioBackup(prontuario?.id);

  // Auto-save timer
  const [autoSaveTimer, setAutoSaveTimer] = useState<NodeJS.Timeout | null>(null);

  // Verificar se há dados de backup disponíveis
  const checkBackupData = useCallback(() => {
    const queixaBackup = loadFromBackup('queixa_principal');
    const idadeGestBackup = loadFromBackup('idade_gestacional');
    const idadeCorrBackup = loadFromBackup('idade_corrigida');
    const obsAnamBackup = loadFromBackup('observacoes_anamnese');
    const avaliacaoBackup = loadFromBackup('avaliacao');
    setHasBackupData(!!(queixaBackup || idadeGestBackup || idadeCorrBackup || obsAnamBackup || avaliacaoBackup));
  }, [loadFromBackup]);

  // Recuperar dados de backup se disponível
  const recoverFromBackup = useCallback(() => {
    const queixaBackup = loadFromBackup('queixa_principal');
    const idadeGestBackup = loadFromBackup('idade_gestacional');
    const idadeCorrBackup = loadFromBackup('idade_corrigida');
    const obsAnamBackup = loadFromBackup('observacoes_anamnese');
    const avaliacaoBackup = loadFromBackup('avaliacao');
    
    if (queixaBackup) {
      setLocalQueixaPrincipal(queixaBackup);
      toast.info("Dados de queixa principal recuperados do backup local");
    }
    if (idadeGestBackup) {
      setLocalIdadeGestacional(idadeGestBackup);
      toast.info("Dados de idade gestacional recuperados do backup local");
    }
    if (idadeCorrBackup) {
      setLocalIdadeCorrigida(idadeCorrBackup);
      toast.info("Dados de idade corrigida recuperados do backup local");
    }
    if (obsAnamBackup) {
      setLocalObservacoesAnamnese(obsAnamBackup);
      toast.info("Dados de observações anamnese recuperados do backup local");
    }
    if (avaliacaoBackup) {
      setLocalAvaliacao(avaliacaoBackup);
      toast.info("Dados de avaliação recuperados do backup local");
    }
    
    setHasBackupData(false);
  }, [loadFromBackup]);

  // Sincronizar com dados do prontuário quando ele mudar
  useEffect(() => {
    if (!prontuario) return;
    
    console.log("Carregando dados de avaliação:", prontuario);
    
    // Verificar backup primeiro
    checkBackupData();
    
    const queixaPrincipal = prontuario?.queixa_principal || "";
    const idadeGestacional = prontuario?.idade_gestacional || "";
    const idadeCorrigida = prontuario?.idade_corrigida || "";
    const observacoesAnamnese = prontuario?.observacoes_anamnese || "";
    const avaliacao = prontuario?.avaliacao || "";

    // Só sobrescrever se não houver backup E não estiver inicializado OU se não há mudanças locais pendentes
    const shouldUpdate = (!hasBackupData && !isInitialized) || !hasChanges;
    
    if (shouldUpdate) {
      setLocalQueixaPrincipal(queixaPrincipal);
      setLocalIdadeGestacional(idadeGestacional);
      setLocalIdadeCorrigida(idadeCorrigida);
      setLocalObservacoesAnamnese(observacoesAnamnese);
      setLocalAvaliacao(avaliacao);
      setHasChanges(false);
      setIsInitialized(true);
    }

    console.log("Estados locais de avaliação definidos:", { 
      queixaPrincipal, idadeGestacional, idadeCorrigida, observacoesAnamnese, avaliacao,
      shouldUpdate, hasBackupData, isInitialized, hasChanges
    });
  }, [prontuario, hasBackupData, isInitialized, hasChanges, checkBackupData]);

  // Verificar mudanças e fazer backup automático
  useEffect(() => {
    if (!prontuario || !isInitialized) return;

    const currentQueixaPrincipal = prontuario?.queixa_principal || "";
    const currentIdadeGestacional = prontuario?.idade_gestacional || "";
    const currentIdadeCorrigida = prontuario?.idade_corrigida || "";
    const currentObservacoesAnamnese = prontuario?.observacoes_anamnese || "";
    const currentAvaliacao = prontuario?.avaliacao || "";

    const changed = 
      localQueixaPrincipal !== currentQueixaPrincipal ||
      localIdadeGestacional !== currentIdadeGestacional ||
      localIdadeCorrigida !== currentIdadeCorrigida ||
      localObservacoesAnamnese !== currentObservacoesAnamnese ||
      localAvaliacao !== currentAvaliacao;

    setHasChanges(changed);

    // Auto-backup com debounce
    if (changed) {
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer);
      }
      
      const timer = setTimeout(() => {
        if (localQueixaPrincipal !== currentQueixaPrincipal) {
          saveToBackup('queixa_principal', localQueixaPrincipal);
        }
        if (localIdadeGestacional !== currentIdadeGestacional) {
          saveToBackup('idade_gestacional', localIdadeGestacional);
        }
        if (localIdadeCorrigida !== currentIdadeCorrigida) {
          saveToBackup('idade_corrigida', localIdadeCorrigida);
        }
        if (localObservacoesAnamnese !== currentObservacoesAnamnese) {
          saveToBackup('observacoes_anamnese', localObservacoesAnamnese);
        }
        if (localAvaliacao !== currentAvaliacao) {
          saveToBackup('avaliacao', localAvaliacao);
        }
      }, 2000); // 2 segundos de debounce
      
      setAutoSaveTimer(timer);
    }

    return () => {
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer);
      }
    };
  }, [localQueixaPrincipal, localIdadeGestacional, localIdadeCorrigida, localObservacoesAnamnese, localAvaliacao, prontuario, saveToBackup, autoSaveTimer, isInitialized]);

  const handleSave = async () => {
    if (!hasChanges) {
      toast.info("Nenhuma alteração para salvar.");
      return;
    }

    setIsSaving(true);
    try {
      const updates = [];

      // Verificar cada campo individualmente e salvar no banco
      const currentQueixaPrincipal = prontuario?.queixa_principal || "";
      const currentIdadeGestacional = prontuario?.idade_gestacional || "";
      const currentIdadeCorrigida = prontuario?.idade_corrigida || "";
      const currentObservacoesAnamnese = prontuario?.observacoes_anamnese || "";
      const currentAvaliacao = prontuario?.avaliacao || "";

      if (localQueixaPrincipal !== currentQueixaPrincipal) {
        const queixaValue = localQueixaPrincipal.trim() || null;
        updates.push(onUpdate?.("queixa_principal", queixaValue));
        console.log("Salvando queixa principal:", queixaValue);
      }
      
      if (localIdadeGestacional !== currentIdadeGestacional) {
        const idadeGestValue = localIdadeGestacional.trim() || null;
        updates.push(onUpdate?.("idade_gestacional", idadeGestValue));
        console.log("Salvando idade gestacional:", idadeGestValue);
      }
      
      if (localIdadeCorrigida !== currentIdadeCorrigida) {
        const idadeCorrValue = localIdadeCorrigida.trim() || null;
        updates.push(onUpdate?.("idade_corrigida", idadeCorrValue));
        console.log("Salvando idade corrigida:", idadeCorrValue);
      }
      
      if (localObservacoesAnamnese !== currentObservacoesAnamnese) {
        const obsAnamValue = localObservacoesAnamnese.trim() || null;
        updates.push(onUpdate?.("observacoes_anamnese", obsAnamValue));
        console.log("Salvando observações anamnese:", obsAnamValue);
      }
      
      if (localAvaliacao !== currentAvaliacao) {
        const avaliacaoValue = localAvaliacao.trim() || null;
        updates.push(onUpdate?.("avaliacao", avaliacaoValue));
        console.log("Salvando avaliação:", avaliacaoValue);
      }

      // Aguardar todas as atualizações
      await Promise.all(updates.filter(Boolean));

      // Limpar backups após salvamento bem-sucedido
      clearBackup('queixa_principal');
      clearBackup('idade_gestacional');
      clearBackup('idade_corrigida');
      clearBackup('observacoes_anamnese');
      clearBackup('avaliacao');
      
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
              Anamnese
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
            <Label htmlFor="queixa_principal">Queixa Principal</Label>
            <Textarea
              id="queixa_principal"
              placeholder="Descreva a queixa principal que motivou a consulta..."
              value={localQueixaPrincipal}
              onChange={(e) => setLocalQueixaPrincipal(e.target.value)}
              className="min-h-[100px]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="idade_gestacional">Idade Gestacional</Label>
              <Input
                id="idade_gestacional"
                placeholder="Ex: 38 semanas"
                value={localIdadeGestacional}
                onChange={(e) => setLocalIdadeGestacional(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="idade_corrigida">Idade Corrigida</Label>
              <Input
                id="idade_corrigida"
                placeholder="Ex: 2 meses corrigidos"
                value={localIdadeCorrigida}
                onChange={(e) => setLocalIdadeCorrigida(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="observacoes_anamnese">Observações da Anamnese</Label>
            <Textarea
              id="observacoes_anamnese"
              placeholder="Observações complementares sobre a história clínica..."
              value={localObservacoesAnamnese}
              onChange={(e) => setLocalObservacoesAnamnese(e.target.value)}
              className="min-h-[120px]"
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
            <Brain className="h-5 w-5 text-turquesa" />
            Avaliação Clínica
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <Label htmlFor="avaliacao">Avaliação</Label>
            <Textarea
              id="avaliacao"
              placeholder="Descreva os achados da avaliação clínica..."
              value={localAvaliacao}
              onChange={(e) => setLocalAvaliacao(e.target.value)}
              className="min-h-[150px]"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
