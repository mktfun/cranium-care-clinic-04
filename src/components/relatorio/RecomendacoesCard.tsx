
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SeverityLevel } from "@/lib/cranial-utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PenLine, Save, Plus, X } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

interface RecomendacoesCardProps {
  recomendacoes?: string[];
  severityLevel: SeverityLevel;
  isReadOnly?: boolean;
  onSave?: (recomendacoes: string[]) => void;
}

export function RecomendacoesCard({ 
  recomendacoes = [], 
  severityLevel,
  isReadOnly = false,
  onSave
}: RecomendacoesCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedRecomendacoes, setEditedRecomendacoes] = useState<string[]>(recomendacoes);
  const [novaRecomendacao, setNovaRecomendacao] = useState("");

  // Recomendações padrão baseadas no nível de severidade
  const getDefaultRecomendacoes = () => {
    if (severityLevel === "normal") {
      return ["Manter acompanhamento preventivo do desenvolvimento craniano"];
    } else if (severityLevel === "leve") {
      return [
        "Reposicionamento ativo durante períodos de vigília",
        "Exercícios de fisioterapia para fortalecimento cervical",
        "Tempo supervisionado de barriga para baixo (tummy time)"
      ];
    } else if (severityLevel === "moderada") {
      return [
        "Programa intensivo de reposicionamento e fisioterapia",
        "Considerar uso de travesseiro terapêutico específico",
        "Avaliar necessidade de órtese craniana nas próximas 4-6 semanas",
        "Considerar avaliação para órtese craniana se não houver melhora em 4-6 semanas"
      ];
    } else { // severa
      return [
        "Encaminhamento para avaliação especializada de órtese craniana",
        "Iniciar tratamento com capacete ortopédico o mais breve possível",
        "Consulta com neurocirurgião pediátrico recomendada",
        "Encaminhamento para especialista em órtese craniana recomendado"
      ];
    }
  };

  const handleSaveClick = () => {
    if (onSave) {
      onSave(editedRecomendacoes);
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditedRecomendacoes(recomendacoes);
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
    setEditedRecomendacoes([...editedRecomendacoes, ...getDefaultRecomendacoes()]);
  };

  const displayRecomendacoes = isEditing ? editedRecomendacoes : recomendacoes;
  const temRecomendacoes = displayRecomendacoes && displayRecomendacoes.length > 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Recomendações Clínicas</CardTitle>
          <CardDescription>Baseadas no protocolo de avaliação craniana</CardDescription>
        </div>
        {!isReadOnly && (
          isEditing ? (
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleCancelEdit}
              >
                Cancelar
              </Button>
              <Button 
                variant="default" 
                size="sm" 
                onClick={handleSaveClick}
                className="flex items-center gap-1"
              >
                <Save className="h-4 w-4" /> Salvar
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
        {isEditing ? (
          <div className="space-y-4">
            {editedRecomendacoes.length > 0 ? (
              <ul className="space-y-3">
                {editedRecomendacoes.map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <Textarea
                      value={rec}
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
              Adicionar Recomendações Padrão
            </Button>
          </div>
        ) : (
          temRecomendacoes ? (
            <ul className="list-disc pl-5 space-y-2">
              {displayRecomendacoes.map((rec, idx) => (
                <li key={idx}>{rec}</li>
              ))}
            </ul>
          ) : (
            <div>
              <p className="text-muted-foreground">Recomendações gerais baseadas no tipo de assimetria e severidade:</p>
              <ul className="list-disc pl-5 space-y-2 mt-2">
                {severityLevel === "normal" && (
                  <li>Manter acompanhamento preventivo do desenvolvimento craniano</li>
                )}
                {severityLevel === "leve" && (
                  <>
                    <li>Reposicionamento ativo durante períodos de vigília</li>
                    <li>Exercícios de fisioterapia para fortalecimento cervical</li>
                    <li>Tempo supervisionado de barriga para baixo (tummy time)</li>
                  </>
                )}
                {severityLevel === "moderada" && (
                  <>
                    <li>Programa intensivo de reposicionamento e fisioterapia</li>
                    <li>Considerar uso de travesseiro terapêutico específico</li>
                    <li>Avaliar necessidade de órtese craniana nas próximas 4-6 semanas</li>
                  </>
                )}
                {severityLevel === "severa" && (
                  <>
                    <li>Encaminhamento para avaliação especializada de órtese craniana</li>
                    <li>Iniciar tratamento com capacete ortopédico o mais breve possível</li>
                    <li>Consulta com neurocirurgião pediátrico recomendada</li>
                  </>
                )}
              </ul>
            </div>
          )
        )}
      </CardContent>
    </Card>
  );
}
