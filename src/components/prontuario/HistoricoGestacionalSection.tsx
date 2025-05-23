
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('prontuarios')
        .update({ 
          idade_gestacional: idadeGestacional,
          idade_corrigida: idadeCorrigida,
          observacoes_anamnese: observacoesAnamnese
        })
        .eq('id', prontuarioId);

      if (error) {
        console.error('Erro ao salvar histórico gestacional:', error);
        toast.error('Erro ao salvar histórico gestacional.');
        return;
      }

      toast.success('Histórico gestacional salvo com sucesso!');
      setIsEditing(false);
    } catch (error) {
      console.error('Erro inesperado:', error);
      toast.error('Erro inesperado ao salvar.');
    } finally {
      setIsSaving(false);
    }
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
              <Button onClick={handleSave} size="sm" disabled={isSaving}>
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? 'Salvando...' : 'Salvar'}
              </Button>
              <Button variant="outline" onClick={() => setIsEditing(false)} size="sm" disabled={isSaving}>
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
