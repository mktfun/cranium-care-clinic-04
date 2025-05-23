
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CondutaSectionProps {
  prontuarioId: string;
  initialValue?: string;
}

export function CondutaSection({ prontuarioId, initialValue = "" }: CondutaSectionProps) {
  const [conduta, setConduta] = useState(initialValue);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('prontuarios')
        .update({ conduta: conduta })
        .eq('id', prontuarioId);

      if (error) {
        console.error('Erro ao salvar conduta:', error);
        toast.error('Erro ao salvar conduta.');
        return;
      }

      toast.success('Conduta salva com sucesso!');
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
        <CardTitle className="text-lg">Conduta</CardTitle>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <div className="space-y-4">
            <Textarea
              value={conduta}
              onChange={(e) => setConduta(e.target.value)}
              placeholder="Descreva a conduta médica..."
              className="min-h-[120px]"
            />
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
          <div onClick={() => setIsEditing(true)} className="cursor-pointer">
            {conduta || (
              <p className="text-muted-foreground italic">Clique para adicionar a conduta...</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
