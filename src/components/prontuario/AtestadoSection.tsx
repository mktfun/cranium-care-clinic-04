
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Save, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AtestadoSectionProps {
  prontuarioId: string;
  initialValue?: string;
}

export function AtestadoSection({ prontuarioId, initialValue = "" }: AtestadoSectionProps) {
  const [atestado, setAtestado] = useState(initialValue);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('prontuarios')
        .update({ atestado: atestado })
        .eq('id', prontuarioId);

      if (error) {
        console.error('Erro ao salvar atestado:', error);
        toast.error('Erro ao salvar atestado.');
        return;
      }

      toast.success('Atestado salvo com sucesso!');
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
        <CardTitle className="text-lg flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Atestado
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <div className="space-y-4">
            <Textarea
              value={atestado}
              onChange={(e) => setAtestado(e.target.value)}
              placeholder="Informações para o atestado médico..."
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
            {atestado || (
              <p className="text-muted-foreground italic">Clique para adicionar informações do atestado...</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
