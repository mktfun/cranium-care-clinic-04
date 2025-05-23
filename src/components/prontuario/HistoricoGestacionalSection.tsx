
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";

interface HistoricoGestacionalSectionProps {
  prontuarioId: string;
  initialData?: {
    idadeGestacional?: string;
    idadeCorrigida?: string;
    observacoesAnamnese?: string;
  };
}

export function HistoricoGestacionalSection({ 
  prontuarioId, 
  initialData = {} 
}: HistoricoGestacionalSectionProps) {
  const [idadeGestacional, setIdadeGestacional] = useState(initialData.idadeGestacional || "");
  const [idadeCorrigida, setIdadeCorrigida] = useState(initialData.idadeCorrigida || "");
  const [observacoesAnamnese, setObservacoesAnamnese] = useState(initialData.observacoesAnamnese || "");
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = async () => {
    // Implementar salvamento no banco
    setIsEditing(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Histórico Gestacional e de Parto</CardTitle>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="idade-gestacional">Idade Gestacional</Label>
                <Input
                  id="idade-gestacional"
                  value={idadeGestacional}
                  onChange={(e) => setIdadeGestacional(e.target.value)}
                  placeholder="Ex: 38 semanas"
                />
              </div>
              <div>
                <Label htmlFor="idade-corrigida">Idade Corrigida</Label>
                <Input
                  id="idade-corrigida"
                  value={idadeCorrigida}
                  onChange={(e) => setIdadeCorrigida(e.target.value)}
                  placeholder="Ex: 3 meses e 2 semanas"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="observacoes-anamnese">Observações da Anamnese</Label>
              <Textarea
                id="observacoes-anamnese"
                value={observacoesAnamnese}
                onChange={(e) => setObservacoesAnamnese(e.target.value)}
                placeholder="Informações sobre gestação, parto e desenvolvimento..."
                className="min-h-[100px]"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSave} size="sm">
                <Save className="h-4 w-4 mr-2" />
                Salvar
              </Button>
              <Button variant="outline" onClick={() => setIsEditing(false)} size="sm">
                Cancelar
              </Button>
            </div>
          </div>
        ) : (
          <div onClick={() => setIsEditing(true)} className="cursor-pointer space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <strong>Idade Gestacional:</strong>{" "}
                {idadeGestacional || (
                  <span className="text-muted-foreground italic">Não informado</span>
                )}
              </div>
              <div>
                <strong>Idade Corrigida:</strong>{" "}
                {idadeCorrigida || (
                  <span className="text-muted-foreground italic">Não informado</span>
                )}
              </div>
            </div>
            <div>
              <strong>Observações da Anamnese:</strong>
              <div className="mt-1">
                {observacoesAnamnese || (
                  <span className="text-muted-foreground italic">Clique para adicionar observações...</span>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
