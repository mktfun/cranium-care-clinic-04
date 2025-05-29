
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
    console.log("Carregando dados de avaliação:", prontuario);
    const queixaPrincipal = prontuario?.queixa_principal || "";
    const idadeGestacional = prontuario?.idade_gestacional || "";
    const idadeCorrigida = prontuario?.idade_corrigida || "";
    const observacoesAnamnese = prontuario?.observacoes_anamnese || "";
    const avaliacao = prontuario?.avaliacao || "";

    setLocalQueixaPrincipal(queixaPrincipal);
    setLocalIdadeGestacional(idadeGestacional);
    setLocalIdadeCorrigida(idadeCorrigida);
    setLocalObservacoesAnamnese(observacoesAnamnese);
    setLocalAvaliacao(avaliacao);
    setHasChanges(false);

    console.log("Estados locais de avaliação definidos:", { 
      queixaPrincipal, idadeGestacional, idadeCorrigida, observacoesAnamnese, avaliacao 
    });
  }, [prontuario]);

  // Verificar mudanças
  useEffect(() => {
    if (!prontuario) return;

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
  }, [localQueixaPrincipal, localIdadeGestacional, localIdadeCorrigida, localObservacoesAnamnese, localAvaliacao, prontuario]);

  const handleSave = async () => {
    if (!hasChanges) {
      toast.info("Nenhuma alteração para salvar.");
      return;
    }

    setIsSaving(true);
    try {
      const updates = [];

      // Verificar cada campo individualmente e preparar as atualizações
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
