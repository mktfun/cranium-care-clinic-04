
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Activity, Save } from "lucide-react";
import { Prontuario } from "@/types";
import { CIDSearchInput } from "@/components/prontuario/CIDSearchInput";
import { toast } from "sonner";

interface DiagnosticoTabProps {
  prontuario: Prontuario;
  pacienteId: string;
  onUpdate?: (field: string, value: any) => void;
}

export function DiagnosticoTab({ prontuario, pacienteId, onUpdate }: DiagnosticoTabProps) {
  const [localDiagnostico, setLocalDiagnostico] = useState("");
  const [localCid, setLocalCid] = useState("");
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Sincronizar com dados do prontuário quando ele mudar
  useEffect(() => {
    console.log("Carregando dados de diagnóstico:", prontuario);
    const diagnostico = prontuario?.diagnostico || "";
    const cid = prontuario?.cid || "";

    setLocalDiagnostico(diagnostico);
    setLocalCid(cid);
    setHasChanges(false);

    console.log("Estados locais de diagnóstico definidos:", { diagnostico, cid });
  }, [prontuario]);

  // Verificar mudanças
  useEffect(() => {
    if (!prontuario) return;

    const currentDiagnostico = prontuario?.diagnostico || "";
    const currentCid = prontuario?.cid || "";

    const changed = 
      localDiagnostico !== currentDiagnostico ||
      localCid !== currentCid;

    setHasChanges(changed);
  }, [localDiagnostico, localCid, prontuario]);

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
              onChange={(e) => setLocalDiagnostico(e.target.value)}
              className="min-h-[150px]"
            />
          </div>

          <CIDSearchInput
            value={localCid}
            onChange={setLocalCid}
            onCIDSelect={handleCIDSelect}
            placeholder="Digite o código CID ou busque por diagnóstico..."
            label="Código CID"
          />

          {hasChanges && (
            <div className="text-sm text-orange-600 bg-orange-50 p-2 rounded">
              Há alterações não salvas nesta aba.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
