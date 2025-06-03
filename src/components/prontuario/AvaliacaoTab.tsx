
import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Activity, Clock, Heart, Brain, Save } from "lucide-react";
import { Prontuario } from "@/types";
import { toast } from "sonner";
import { useProntuarioBackup } from "@/hooks/useProntuarioBackup";
import { useDebounce } from "@/hooks/use-debounce";

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
  const [dataLoaded, setDataLoaded] = useState(false);

  // Sistema de backup
  const { saveToBackup, loadFromBackup, clearBackup } = useProntuarioBackup(prontuario?.id);

  // Debounce para auto-backup
  const debouncedQueixaPrincipal = useDebounce(localQueixaPrincipal, 1000);
  const debouncedIdadeGestacional = useDebounce(localIdadeGestacional, 1000);
  const debouncedIdadeCorrigida = useDebounce(localIdadeCorrigida, 1000);
  const debouncedObservacoesAnamnese = useDebounce(localObservacoesAnamnese, 1000);
  const debouncedAvaliacao = useDebounce(localAvaliacao, 1000);

  // Carregar dados iniciais com backup
  const loadInitialData = useCallback(() => {
    if (!prontuario?.id) return;

    console.log("Carregando dados iniciais para avaliação:", prontuario);

    // Tentar carregar do backup primeiro
    const backupQueixa = loadFromBackup('queixa_principal');
    const backupIdadeGest = loadFromBackup('idade_gestacional');
    const backupIdadeCorr = loadFromBackup('idade_corrigida');
    const backupObsAnamnese = loadFromBackup('observacoes_anamnese');
    const backupAvaliacao = loadFromBackup('avaliacao');

    // Usar backup se disponível, senão usar dados do prontuário
    const queixaPrincipal = backupQueixa !== null ? backupQueixa : (prontuario?.queixa_principal || "");
    const idadeGestacional = backupIdadeGest !== null ? backupIdadeGest : (prontuario?.idade_gestacional || "");
    const idadeCorrigida = backupIdadeCorr !== null ? backupIdadeCorr : (prontuario?.idade_corrigida || "");
    const observacoesAnamnese = backupObsAnamnese !== null ? backupObsAnamnese : (prontuario?.observacoes_anamnese || "");
    const avaliacao = backupAvaliacao !== null ? backupAvaliacao : (prontuario?.avaliacao || "");

    setLocalQueixaPrincipal(queixaPrincipal);
    setLocalIdadeGestacional(idadeGestacional);
    setLocalIdadeCorrigida(idadeCorrigida);
    setLocalObservacoesAnamnese(observacoesAnamnese);
    setLocalAvaliacao(avaliacao);
    setDataLoaded(true);

    console.log("Estados locais de avaliação definidos:", { 
      queixaPrincipal, idadeGestacional, idadeCorrigida, observacoesAnamnese, avaliacao 
    });

    // Se há backup, indicar que há mudanças
    if (backupQueixa !== null || backupIdadeGest !== null || backupIdadeCorr !== null || 
        backupObsAnamnese !== null || backupAvaliacao !== null) {
      setHasChanges(true);
      toast.info("Dados recuperados do backup local.");
    }
  }, [prontuario, loadFromBackup]);

  // Carregar dados apenas uma vez quando o prontuário muda
  useEffect(() => {
    if (prontuario?.id && !dataLoaded) {
      loadInitialData();
    }
  }, [prontuario?.id, loadInitialData, dataLoaded]);

  // Reset dataLoaded quando prontuário muda
  useEffect(() => {
    setDataLoaded(false);
  }, [prontuario?.id]);

  // Auto-backup dos dados
  useEffect(() => {
    if (dataLoaded && debouncedQueixaPrincipal !== (prontuario?.queixa_principal || "")) {
      saveToBackup('queixa_principal', debouncedQueixaPrincipal);
    }
  }, [debouncedQueixaPrincipal, saveToBackup, dataLoaded, prontuario?.queixa_principal]);

  useEffect(() => {
    if (dataLoaded && debouncedIdadeGestacional !== (prontuario?.idade_gestacional || "")) {
      saveToBackup('idade_gestacional', debouncedIdadeGestacional);
    }
  }, [debouncedIdadeGestacional, saveToBackup, dataLoaded, prontuario?.idade_gestacional]);

  useEffect(() => {
    if (dataLoaded && debouncedIdadeCorrigida !== (prontuario?.idade_corrigida || "")) {
      saveToBackup('idade_corrigida', debouncedIdadeCorrigida);
    }
  }, [debouncedIdadeCorrigida, saveToBackup, dataLoaded, prontuario?.idade_corrigida]);

  useEffect(() => {
    if (dataLoaded && debouncedObservacoesAnamnese !== (prontuario?.observacoes_anamnese || "")) {
      saveToBackup('observacoes_anamnese', debouncedObservacoesAnamnese);
    }
  }, [debouncedObservacoesAnamnese, saveToBackup, dataLoaded, prontuario?.observacoes_anamnese]);

  useEffect(() => {
    if (dataLoaded && debouncedAvaliacao !== (prontuario?.avaliacao || "")) {
      saveToBackup('avaliacao', debouncedAvaliacao);
    }
  }, [debouncedAvaliacao, saveToBackup, dataLoaded, prontuario?.avaliacao]);

  // Verificar mudanças apenas após dados carregados
  useEffect(() => {
    if (!prontuario || !dataLoaded) return;

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
  }, [localQueixaPrincipal, localIdadeGestacional, localIdadeCorrigida, localObservacoesAnamnese, localAvaliacao, prontuario, dataLoaded]);

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
        clearBackup('queixa_principal');
      }
      
      if (localIdadeGestacional !== currentIdadeGestacional) {
        const idadeGestValue = localIdadeGestacional.trim() || null;
        updates.push(onUpdate?.("idade_gestacional", idadeGestValue));
        console.log("Salvando idade gestacional:", idadeGestValue);
        clearBackup('idade_gestacional');
      }
      
      if (localIdadeCorrigida !== currentIdadeCorrigida) {
        const idadeCorrValue = localIdadeCorrigida.trim() || null;
        updates.push(onUpdate?.("idade_corrigida", idadeCorrValue));
        console.log("Salvando idade corrigida:", idadeCorrValue);
        clearBackup('idade_corrigida');
      }
      
      if (localObservacoesAnamnese !== currentObservacoesAnamnese) {
        const obsAnamValue = localObservacoesAnamnese.trim() || null;
        updates.push(onUpdate?.("observacoes_anamnese", obsAnamValue));
        console.log("Salvando observações anamnese:", obsAnamValue);
        clearBackup('observacoes_anamnese');
      }
      
      if (localAvaliacao !== currentAvaliacao) {
        const avaliacaoValue = localAvaliacao.trim() || null;
        updates.push(onUpdate?.("avaliacao", avaliacaoValue));
        console.log("Salvando avaliação:", avaliacaoValue);
        clearBackup('avaliacao');
      }

      // Aguardar todas as atualizações
      await Promise.all(updates.filter(Boolean));
      
      toast.success("Dados salvos com sucesso!");
    } catch (error) {
      toast.error("Erro ao salvar dados.");
      console.error("Erro ao salvar:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // Proteção contra perda de dados ao sair da página
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasChanges) {
        e.preventDefault();
        e.returnValue = 'Você tem alterações não salvas. Deseja realmente sair?';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasChanges]);

  return (
    <div className="space-y-6">
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
              Há alterações não salvas nesta aba.
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
