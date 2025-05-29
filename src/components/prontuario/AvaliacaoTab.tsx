
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Activity, Clock, Heart, Brain, Save } from "lucide-react";
import { Prontuario } from "@/types";
import { toast } from "sonner";

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

  // Sincronizar com dados do prontuário quando ele mudar
  useEffect(() => {
    setLocalQueixaPrincipal(prontuario?.queixa_principal || "");
    setLocalIdadeGestacional(prontuario?.idade_gestacional || "");
    setLocalIdadeCorrigida(prontuario?.idade_corrigida || "");
    setLocalObservacoesAnamnese(prontuario?.observacoes_anamnese || "");
    setLocalAvaliacao(prontuario?.avaliacao || "");
    setHasChanges(false);
  }, [prontuario]);

  // Verificar mudanças
  useEffect(() => {
    const changed = 
      localQueixaPrincipal !== (prontuario?.queixa_principal || "") ||
      localIdadeGestacional !== (prontuario?.idade_gestacional || "") ||
      localIdadeCorrigida !== (prontuario?.idade_corrigida || "") ||
      localObservacoesAnamnese !== (prontuario?.observacoes_anamnese || "") ||
      localAvaliacao !== (prontuario?.avaliacao || "");

    setHasChanges(changed);
  }, [localQueixaPrincipal, localIdadeGestacional, localIdadeCorrigida, localObservacoesAnamnese, localAvaliacao, prontuario]);

  const handleSave = async () => {
    if (!hasChanges) {
      toast.info("Nenhuma alteração para salvar.");
      return;
    }

    setIsSaving(true);
    try {
      const updates = [];

      if (localQueixaPrincipal !== (prontuario?.queixa_principal || "")) {
        updates.push(onUpdate?.("queixa_principal", localQueixaPrincipal || null));
      }
      if (localIdadeGestacional !== (prontuario?.idade_gestacional || "")) {
        updates.push(onUpdate?.("idade_gestacional", localIdadeGestacional || null));
      }
      if (localIdadeCorrigida !== (prontuario?.idade_corrigida || "")) {
        updates.push(onUpdate?.("idade_corrigida", localIdadeCorrigida || null));
      }
      if (localObservacoesAnamnese !== (prontuario?.observacoes_anamnese || "")) {
        updates.push(onUpdate?.("observacoes_anamnese", localObservacoesAnamnese || null));
      }
      if (localAvaliacao !== (prontuario?.avaliacao || "")) {
        updates.push(onUpdate?.("avaliacao", localAvaliacao || null));
      }

      await Promise.all(updates.filter(Boolean));
      
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
