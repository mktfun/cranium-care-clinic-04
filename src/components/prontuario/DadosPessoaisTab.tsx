
import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Baby, User, Heart, Scale, Ruler, Droplet, Save, AlertTriangle } from "lucide-react";
import { Prontuario } from "@/types";
import { toast } from "sonner";
import { useProntuarioBackup } from "@/hooks/useProntuarioBackup";

interface DadosPessoaisTabProps {
  paciente: any;
  prontuario: Prontuario;
  onUpdate?: (field: string, value: any) => void;
}

export function DadosPessoaisTab({ paciente, prontuario, onUpdate }: DadosPessoaisTabProps) {
  const [localPeso, setLocalPeso] = useState("");
  const [localAltura, setLocalAltura] = useState("");
  const [localTipoSanguineo, setLocalTipoSanguineo] = useState("");
  const [localAlergias, setLocalAlergias] = useState("");
  const [localObservacoesGerais, setLocalObservacoesGerais] = useState("");
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasBackupData, setHasBackupData] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const { saveToBackup, loadFromBackup, clearBackup } = useProntuarioBackup(prontuario?.id);

  // Auto-save timer
  const [autoSaveTimer, setAutoSaveTimer] = useState<NodeJS.Timeout | null>(null);

  // Verificar se há dados de backup disponíveis
  const checkBackupData = useCallback(() => {
    const pesoBackup = loadFromBackup('peso');
    const alturaBackup = loadFromBackup('altura');
    const tipoSangBackup = loadFromBackup('tipo_sanguineo');
    const alergiasBackup = loadFromBackup('alergias');
    const obsGeraisBackup = loadFromBackup('observacoes_gerais');
    setHasBackupData(!!(pesoBackup || alturaBackup || tipoSangBackup || alergiasBackup || obsGeraisBackup));
  }, [loadFromBackup]);

  // Recuperar dados de backup se disponível
  const recoverFromBackup = useCallback(() => {
    const pesoBackup = loadFromBackup('peso');
    const alturaBackup = loadFromBackup('altura');
    const tipoSangBackup = loadFromBackup('tipo_sanguineo');
    const alergiasBackup = loadFromBackup('alergias');
    const obsGeraisBackup = loadFromBackup('observacoes_gerais');
    
    if (pesoBackup) {
      setLocalPeso(pesoBackup.toString());
      toast.info("Dados de peso recuperados do backup local");
    }
    if (alturaBackup) {
      setLocalAltura(alturaBackup.toString());
      toast.info("Dados de altura recuperados do backup local");
    }
    if (tipoSangBackup) {
      setLocalTipoSanguineo(tipoSangBackup);
      toast.info("Dados de tipo sanguíneo recuperados do backup local");
    }
    if (alergiasBackup) {
      setLocalAlergias(alergiasBackup);
      toast.info("Dados de alergias recuperados do backup local");
    }
    if (obsGeraisBackup) {
      setLocalObservacoesGerais(obsGeraisBackup);
      toast.info("Dados de observações gerais recuperados do backup local");
    }
    
    setHasBackupData(false);
  }, [loadFromBackup]);

  // Sincronizar com dados do prontuário quando ele mudar
  useEffect(() => {
    if (!prontuario) return;

    console.log("Carregando dados do prontuário:", prontuario);
    
    // Verificar backup primeiro
    checkBackupData();
    
    const peso = prontuario?.peso?.toString() || "";
    const altura = prontuario?.altura?.toString() || "";
    const tipoSanguineo = prontuario?.tipo_sanguineo || "";
    const alergias = prontuario?.alergias || "";
    const observacoesGerais = prontuario?.observacoes_gerais || "";

    // Só sobrescrever se não houver backup E não estiver inicializado OU se não há mudanças locais pendentes
    const shouldUpdate = (!hasBackupData && !isInitialized) || !hasChanges;
    
    if (shouldUpdate) {
      setLocalPeso(peso);
      setLocalAltura(altura);
      setLocalTipoSanguineo(tipoSanguineo);
      setLocalAlergias(alergias);
      setLocalObservacoesGerais(observacoesGerais);
      setHasChanges(false);
      setIsInitialized(true);
    }

    console.log("Estados locais definidos:", { 
      peso, altura, tipoSanguineo, alergias, observacoesGerais,
      shouldUpdate, hasBackupData, isInitialized, hasChanges
    });
  }, [prontuario, hasBackupData, isInitialized, hasChanges, checkBackupData]);

  // Verificar mudanças e fazer backup automático
  useEffect(() => {
    if (!prontuario || !isInitialized) return;

    const currentPeso = prontuario?.peso?.toString() || "";
    const currentAltura = prontuario?.altura?.toString() || "";
    const currentTipoSanguineo = prontuario?.tipo_sanguineo || "";
    const currentAlergias = prontuario?.alergias || "";
    const currentObservacoesGerais = prontuario?.observacoes_gerais || "";

    const changed = 
      localPeso !== currentPeso ||
      localAltura !== currentAltura ||
      localTipoSanguineo !== currentTipoSanguineo ||
      localAlergias !== currentAlergias ||
      localObservacoesGerais !== currentObservacoesGerais;

    setHasChanges(changed);

    // Auto-backup com debounce
    if (changed) {
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer);
      }
      
      const timer = setTimeout(() => {
        if (localPeso !== currentPeso) {
          saveToBackup('peso', localPeso);
        }
        if (localAltura !== currentAltura) {
          saveToBackup('altura', localAltura);
        }
        if (localTipoSanguineo !== currentTipoSanguineo) {
          saveToBackup('tipo_sanguineo', localTipoSanguineo);
        }
        if (localAlergias !== currentAlergias) {
          saveToBackup('alergias', localAlergias);
        }
        if (localObservacoesGerais !== currentObservacoesGerais) {
          saveToBackup('observacoes_gerais', localObservacoesGerais);
        }
      }, 2000); // 2 segundos de debounce
      
      setAutoSaveTimer(timer);
    }

    return () => {
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer);
      }
    };
  }, [localPeso, localAltura, localTipoSanguineo, localAlergias, localObservacoesGerais, prontuario, saveToBackup, autoSaveTimer, isInitialized]);

  const handleSave = async () => {
    if (!hasChanges) {
      toast.info("Nenhuma alteração para salvar.");
      return;
    }

    setIsSaving(true);
    try {
      const updates = [];

      // Verificar cada campo individualmente e salvar no banco
      const currentPeso = prontuario?.peso?.toString() || "";
      const currentAltura = prontuario?.altura?.toString() || "";
      const currentTipoSanguineo = prontuario?.tipo_sanguineo || "";
      const currentAlergias = prontuario?.alergias || "";
      const currentObservacoesGerais = prontuario?.observacoes_gerais || "";

      if (localPeso !== currentPeso) {
        const pesoValue = localPeso.trim() ? parseFloat(localPeso) : null;
        updates.push(onUpdate?.("peso", pesoValue));
        console.log("Salvando peso:", pesoValue);
      }
      
      if (localAltura !== currentAltura) {
        const alturaValue = localAltura.trim() ? parseFloat(localAltura) : null;
        updates.push(onUpdate?.("altura", alturaValue));
        console.log("Salvando altura:", alturaValue);
      }
      
      if (localTipoSanguineo !== currentTipoSanguineo) {
        const tipoValue = localTipoSanguineo.trim() || null;
        updates.push(onUpdate?.("tipo_sanguineo", tipoValue));
        console.log("Salvando tipo sanguíneo:", tipoValue);
      }
      
      if (localAlergias !== currentAlergias) {
        const alergiasValue = localAlergias.trim() || null;
        updates.push(onUpdate?.("alergias", alergiasValue));
        console.log("Salvando alergias:", alergiasValue);
      }
      
      if (localObservacoesGerais !== currentObservacoesGerais) {
        const observacoesValue = localObservacoesGerais.trim() || null;
        updates.push(onUpdate?.("observacoes_gerais", observacoesValue));
        console.log("Salvando observações gerais:", observacoesValue);
      }

      // Aguardar todas as atualizações
      await Promise.all(updates.filter(Boolean));

      // Limpar backups após salvamento bem-sucedido
      clearBackup('peso');
      clearBackup('altura');
      clearBackup('tipo_sanguineo');
      clearBackup('alergias');
      clearBackup('observacoes_gerais');
      
      toast.success("Dados salvos com sucesso!");
    } catch (error) {
      toast.error("Erro ao salvar dados. Os dados foram mantidos localmente.");
      console.error("Erro ao salvar:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const formatarData = (dataString: string) => {
    if (!dataString) return "N/A";
    const data = new Date(dataString);
    if (isNaN(data.getTime())) return "Data inválida";
    return data.toLocaleDateString('pt-BR');
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

      {/* Dados de Nascimento */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Baby className="h-5 w-5 text-turquesa" />
            Dados de Nascimento
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Nome Completo</Label>
              <Input value={paciente?.nome || ""} disabled className="bg-muted" />
            </div>
            <div>
              <Label>Data de Nascimento</Label>
              <Input value={formatarData(paciente?.data_nascimento)} disabled className="bg-muted" />
            </div>
            <div>
              <Label>Sexo</Label>
              <Input value={paciente?.sexo || ""} disabled className="bg-muted" />
            </div>
            <div>
              <Label>Local de Nascimento</Label>
              <Input value={paciente?.local_nascimento || "Não informado"} disabled className="bg-muted" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dados Atuais */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-turquesa" />
              Dados Atuais da Consulta
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="peso">
                <Scale className="h-4 w-4 inline mr-1" />
                Peso (kg)
              </Label>
              <Input
                id="peso"
                type="number"
                step="0.1"
                placeholder="Ex: 3.5"
                value={localPeso}
                onChange={(e) => setLocalPeso(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="altura">
                <Ruler className="h-4 w-4 inline mr-1" />
                Altura (cm)
              </Label>
              <Input
                id="altura"
                type="number"
                step="0.1"
                placeholder="Ex: 50.5"
                value={localAltura}
                onChange={(e) => setLocalAltura(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="tipo_sanguineo">
                <Droplet className="h-4 w-4 inline mr-1" />
                Tipo Sanguíneo
              </Label>
              <Input
                id="tipo_sanguineo"
                placeholder="Ex: O+"
                value={localTipoSanguineo}
                onChange={(e) => setLocalTipoSanguineo(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="alergias">
              <Heart className="h-4 w-4 inline mr-1" />
              Alergias Conhecidas
            </Label>
            <Textarea
              id="alergias"
              placeholder="Descreva alergias conhecidas, medicamentosas ou alimentares..."
              value={localAlergias}
              onChange={(e) => setLocalAlergias(e.target.value)}
              className="min-h-[80px]"
            />
          </div>

          <div>
            <Label htmlFor="observacoes_gerais">Observações Gerais</Label>
            <Textarea
              id="observacoes_gerais"
              placeholder="Observações gerais sobre o paciente..."
              value={localObservacoesGerais}
              onChange={(e) => setLocalObservacoesGerais(e.target.value)}
              className="min-h-[100px]"
            />
          </div>

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
