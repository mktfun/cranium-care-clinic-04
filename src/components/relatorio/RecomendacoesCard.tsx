import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SeverityLevel } from "@/lib/cranial-utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PenLine, Save, Plus, X } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { type CHOAClassification } from "@/lib/choa-plagiocephaly-scale";

interface RecomendacoesCardProps {
  recomendacoes?: string[] | null;
  severityLevel: SeverityLevel;
  isReadOnly?: boolean;
  medicaoId?: string;
  onRecomendacoesUpdated?: (recomendacoes: string[]) => void;
  choaClassification?: CHOAClassification;
  choaRecommendations?: string[];
}

export function RecomendacoesCard({ 
  recomendacoes, 
  severityLevel,
  isReadOnly = false,
  medicaoId,
  onRecomendacoesUpdated,
  choaClassification,
  choaRecommendations = []
}: RecomendacoesCardProps) {
  // Ensure recomendacoes is always an array, never null
  const safeRecomendacoes = Array.isArray(recomendacoes) ? recomendacoes : [];
  
  const [isEditing, setIsEditing] = useState(false);
  const [editedRecomendacoes, setEditedRecomendacoes] = useState<string[]>(safeRecomendacoes);
  const [novaRecomendacao, setNovaRecomendacao] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Usar recomendações CHOA como padrão quando disponíveis
  const getDefaultRecomendacoes = () => {
    if (choaRecommendations.length > 0) {
      return choaRecommendations;
    }
    
    // Fallback para recomendações baseadas em severidade
    if (severityLevel === "normal") {
      return ["Manter acompanhamento preventivo do desenvolvimento craniano"];
    } else if (severityLevel === "leve") {
      return [
        "Programa de reposicionamento ativo",
        "Exercícios de fisioterapia para fortalecimento cervical",
        "Tempo supervisionado de barriga para baixo (tummy time)"
      ];
    } else if (severityLevel === "moderada") {
      return [
        "Programa intensivo de reposicionamento e fisioterapia",
        "Considerar uso de travesseiro terapêutico específico",
        "Avaliar necessidade de órtese craniana nas próximas 4-6 semanas"
      ];
    } else { // severa
      return [
        "Encaminhamento para avaliação especializada de órtese craniana",
        "Iniciar tratamento com capacete ortopédico o mais breve possível",
        "Consulta com neurocirurgião pediátrico recomendada"
      ];
    }
  };

  const handleSaveClick = async () => {
    if (!medicaoId) {
      toast.error("ID da medição não encontrado");
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('medicoes')
        .update({ 
          recomendacoes: editedRecomendacoes,
          updated_at: new Date().toISOString()
        })
        .eq('id', medicaoId);

      if (error) {
        console.error('Erro ao salvar recomendações:', error);
        toast.error("Erro ao salvar recomendações");
        return;
      }

      toast.success("Recomendações salvas com sucesso!");
      setIsEditing(false);
      
      if (onRecomendacoesUpdated) {
        onRecomendacoesUpdated(editedRecomendacoes);
      }
    } catch (err) {
      console.error('Erro ao salvar recomendações:', err);
      toast.error("Erro ao salvar recomendações");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditedRecomendacoes(safeRecomendacoes);
    setIsEditing(false);
    setNovaRecomendacao("");
  };

  const handleRecomendacaoChange = (index: number, value: string) => {
    const newRecomendacoes = [...editedRecomendacoes];
    newRecomendacoes[index] = value;
    setEditedRecomendacoes(newRecomendacoes);
  };

  const handleRemoveRecomendacao = (index: number) => {
    const newRecomendacoes = editedRecomendacoes.filter((_, i) => i !== index);
    setEditedRecomendacoes(newRecomendacoes);
  };

  const handleAddRecomendacao = () => {
    if (novaRecomendacao.trim()) {
      setEditedRecomendacoes([...editedRecomendacoes, novaRecomendacao]);
      setNovaRecomendacao("");
    }
  };

  const handleAddDefaultRecomendacoes = () => {
    const defaultRecs = getDefaultRecomendacoes();
    const uniqueRecs = defaultRecs.filter(rec => !editedRecomendacoes.includes(rec));
    setEditedRecomendacoes([...editedRecomendacoes, ...uniqueRecs]);
  };

  const displayRecomendacoes = isEditing ? editedRecomendacoes : safeRecomendacoes;
  const temRecomendacoes = displayRecomendacoes && displayRecomendacoes.length > 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Recomendações Clínicas</CardTitle>
          <CardDescription>
            {choaClassification 
              ? `Baseadas na Escala CHOA (Nível ${choaClassification.level}) - Children's Healthcare of Atlanta`
              : "Baseadas no protocolo de avaliação craniana"
            }
          </CardDescription>
        </div>
        {!isReadOnly && medicaoId && (
          isEditing ? (
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleCancelEdit}
                disabled={isSaving}
              >
                Cancelar
              </Button>
              <Button 
                variant="default" 
                size="sm" 
                onClick={handleSaveClick}
                disabled={isSaving}
                className="flex items-center gap-1"
              >
                <Save className="h-4 w-4" /> 
                {isSaving ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          ) : (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-1"
            >
              <PenLine className="h-4 w-4" /> Editar
            </Button>
          )
        )}
      </CardHeader>
      <CardContent>
        {choaClassification && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm font-medium text-blue-800 mb-1">
              Recomendação CHOA (Nível {choaClassification.level}):
            </p>
            <p className="text-sm text-blue-700">
              {choaClassification.recommendation}
            </p>
          </div>
        )}

        {isEditing ? (
          <div className="space-y-4">
            {editedRecomendacoes.length > 0 ? (
              <ul className="space-y-3">
                {editedRecomendacoes.map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <Textarea
                      value={rec || ""}
                      onChange={(e) => handleRecomendacaoChange(idx, e.target.value)}
                      className="flex-1 min-h-[60px]"
                    />
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleRemoveRecomendacao(idx)}
                      className="mt-1"
                    >
                      <X className="h-4 w-4 text-destructive" />
                    </Button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground italic">Nenhuma recomendação adicionada.</p>
            )}
            
            <div className="flex gap-2 mt-4">
              <Input
                placeholder="Nova recomendação"
                value={novaRecomendacao}
                onChange={(e) => setNovaRecomendacao(e.target.value)}
                className="flex-1"
              />
              <Button 
                onClick={handleAddRecomendacao}
                disabled={!novaRecomendacao.trim()}
                className="flex items-center gap-1"
              >
                <Plus className="h-4 w-4" /> Adicionar
              </Button>
            </div>
            
            <Button 
              variant="outline" 
              className="mt-2 w-full"
              onClick={handleAddDefaultRecomendacoes}
            >
              {choaRecommendations.length > 0 
                ? "Adicionar Recomendações CHOA" 
                : "Adicionar Recomendações Padrão"
              }
            </Button>
          </div>
        ) : (
          temRecomendacoes ? (
            <ul className="list-disc pl-5 space-y-2">
              {displayRecomendacoes.map((rec, idx) => (
                <li key={idx}>{rec || ""}</li>
              ))}
            </ul>
          ) : (
            <div>
              <p className="text-muted-foreground">
                {choaRecommendations.length > 0 
                  ? "Recomendações baseadas na Escala CHOA:"
                  : "Recomendações gerais baseadas no tipo de assimetria e severidade:"
                }
              </p>
              <ul className="list-disc pl-5 space-y-2 mt-2">
                {(choaRecommendations.length > 0 ? choaRecommendations : getDefaultRecomendacoes()).map((rec, idx) => (
                  <li key={idx}>{rec}</li>
                ))}
              </ul>
            </div>
          )
        )}
      </CardContent>
    </Card>
  );
}
