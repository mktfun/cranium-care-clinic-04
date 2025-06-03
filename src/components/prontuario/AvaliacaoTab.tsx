
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Activity, Clock, Heart, Brain, Save, Edit } from "lucide-react";
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
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Estados para rastrear valores salvos
  const [savedQueixaPrincipal, setSavedQueixaPrincipal] = useState("");
  const [savedIdadeGestacional, setSavedIdadeGestacional] = useState("");
  const [savedIdadeCorrigida, setSavedIdadeCorrigida] = useState("");
  const [savedObservacoesAnamnese, setSavedObservacoesAnamnese] = useState("");
  const [savedAvaliacao, setSavedAvaliacao] = useState("");

  // Sincronizar com dados do prontuário quando ele mudar
  useEffect(() => {
    if (!prontuario) return;

    console.log("Carregando dados de avaliação:", prontuario);
    
    const queixaPrincipal = prontuario?.queixa_principal || "";
    const idadeGestacional = prontuario?.idade_gestacional || "";
    const idadeCorrigida = prontuario?.idade_corrigida || "";
    const observacoesAnamnese = prontuario?.observacoes_anamnese || "";
    const avaliacao = prontuario?.avaliacao || "";

    // Atualizar estados locais e salvos
    setLocalQueixaPrincipal(queixaPrincipal);
    setLocalIdadeGestacional(idadeGestacional);
    setLocalIdadeCorrigida(idadeCorrigida);
    setLocalObservacoesAnamnese(observacoesAnamnese);
    setLocalAvaliacao(avaliacao);

    setSavedQueixaPrincipal(queixaPrincipal);
    setSavedIdadeGestacional(idadeGestacional);
    setSavedIdadeCorrigida(idadeCorrigida);
    setSavedObservacoesAnamnese(observacoesAnamnese);
    setSavedAvaliacao(avaliacao);

    // Se há dados salvos, não está em modo de edição
    const hasData = queixaPrincipal || idadeGestacional || idadeCorrigida || observacoesAnamnese || avaliacao;
    setIsEditing(!hasData);

    console.log("Estados locais de avaliação definidos:", { 
      queixaPrincipal, idadeGestacional, idadeCorrigida, observacoesAnamnese, avaliacao 
    });
  }, [prontuario]);

  // Verificar se há mudanças não salvas
  const hasUnsavedChanges = 
    localQueixaPrincipal !== savedQueixaPrincipal ||
    localIdadeGestacional !== savedIdadeGestacional ||
    localIdadeCorrigida !== savedIdadeCorrigida ||
    localObservacoesAnamnese !== savedObservacoesAnamnese ||
    localAvaliacao !== savedAvaliacao;

  // Ativar modo de edição quando houver mudanças
  useEffect(() => {
    if (hasUnsavedChanges) {
      setIsEditing(true);
    }
  }, [hasUnsavedChanges]);

  const handleFieldChange = (field: string, value: string) => {
    switch (field) {
      case 'queixaPrincipal':
        setLocalQueixaPrincipal(value);
        break;
      case 'idadeGestacional':
        setLocalIdadeGestacional(value);
        break;
      case 'idadeCorrigida':
        setLocalIdadeCorrigida(value);
        break;
      case 'observacoesAnamnese':
        setLocalObservacoesAnamnese(value);
        break;
      case 'avaliacao':
        setLocalAvaliacao(value);
        break;
    }
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!hasUnsavedChanges) {
      toast.info("Nenhuma alteração para salvar.");
      return;
    }

    setIsSaving(true);
    try {
      const updates = [];

      // Verificar cada campo individualmente e salvar no banco
      if (localQueixaPrincipal !== savedQueixaPrincipal) {
        const queixaValue = localQueixaPrincipal.trim() || null;
        updates.push(onUpdate?.("queixa_principal", queixaValue));
        console.log("Salvando queixa principal:", queixaValue);
      }
      
      if (localIdadeGestacional !== savedIdadeGestacional) {
        const idadeGestValue = localIdadeGestacional.trim() || null;
        updates.push(onUpdate?.("idade_gestacional", idadeGestValue));
        console.log("Salvando idade gestacional:", idadeGestValue);
      }
      
      if (localIdadeCorrigida !== savedIdadeCorrigida) {
        const idadeCorrValue = localIdadeCorrigida.trim() || null;
        updates.push(onUpdate?.("idade_corrigida", idadeCorrValue));
        console.log("Salvando idade corrigida:", idadeCorrValue);
      }
      
      if (localObservacoesAnamnese !== savedObservacoesAnamnese) {
        const obsAnamValue = localObservacoesAnamnese.trim() || null;
        updates.push(onUpdate?.("observacoes_anamnese", obsAnamValue));
        console.log("Salvando observações anamnese:", obsAnamValue);
      }
      
      if (localAvaliacao !== savedAvaliacao) {
        const avaliacaoValue = localAvaliacao.trim() || null;
        updates.push(onUpdate?.("avaliacao", avaliacaoValue));
        console.log("Salvando avaliação:", avaliacaoValue);
      }

      // Aguardar todas as atualizações
      await Promise.all(updates.filter(Boolean));

      // Atualizar estados salvos após sucesso
      setSavedQueixaPrincipal(localQueixaPrincipal);
      setSavedIdadeGestacional(localIdadeGestacional);
      setSavedIdadeCorrigida(localIdadeCorrigida);
      setSavedObservacoesAnamnese(localObservacoesAnamnese);
      setSavedAvaliacao(localAvaliacao);

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
              <Activity className="h-5 w-5 text-turquesa" />
              Anamnese
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
            <Label htmlFor="queixa_principal">Queixa Principal</Label>
            <Textarea
              id="queixa_principal"
              placeholder="Descreva a queixa principal que motivou a consulta..."
              value={localQueixaPrincipal}
              onChange={(e) => handleFieldChange('queixaPrincipal', e.target.value)}
              className="min-h-[100px]"
              disabled={!isEditing}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="idade_gestacional">Idade Gestacional</Label>
              <Input
                id="idade_gestacional"
                placeholder="Ex: 38 semanas"
                value={localIdadeGestacional}
                onChange={(e) => handleFieldChange('idadeGestacional', e.target.value)}
                disabled={!isEditing}
              />
            </div>
            <div>
              <Label htmlFor="idade_corrigida">Idade Corrigida</Label>
              <Input
                id="idade_corrigida"
                placeholder="Ex: 2 meses corrigidos"
                value={localIdadeCorrigida}
                onChange={(e) => handleFieldChange('idadeCorrigida', e.target.value)}
                disabled={!isEditing}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="observacoes_anamnese">Observações da Anamnese</Label>
            <Textarea
              id="observacoes_anamnese"
              placeholder="Observações complementares sobre a história clínica..."
              value={localObservacoesAnamnese}
              onChange={(e) => handleFieldChange('observacoesAnamnese', e.target.value)}
              className="min-h-[120px]"
              disabled={!isEditing}
            />
          </div>

          {hasUnsavedChanges && (
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
              onChange={(e) => handleFieldChange('avaliacao', e.target.value)}
              className="min-h-[150px]"
              disabled={!isEditing}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
