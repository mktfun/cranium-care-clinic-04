
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface QueixaPrincipalSectionProps {
  prontuarioId: string;
  initialValue?: string;
}

export function QueixaPrincipalSection({ prontuarioId, initialValue = "" }: QueixaPrincipalSectionProps) {
  const [queixaPrincipal, setQueixaPrincipal] = useState(initialValue);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('prontuarios')
        .update({ queixa_principal: queixaPrincipal })
        .eq('id', prontuarioId);

      if (error) {
        console.error('Erro ao salvar queixa principal:', error);
        toast.error('Erro ao salvar queixa principal.');
        return;
      }

      toast.success('Queixa principal salva com sucesso!');
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
        <CardTitle className="text-lg">Queixa Principal</CardTitle>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <div className="space-y-4">
            <Textarea
              value={queixaPrincipal}
              onChange={(e) => setQueixaPrincipal(e.target.value)}
              placeholder="Descreva a queixa principal do paciente..."
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
            {queixaPrincipal || (
              <p className="text-muted-foreground italic">Clique para adicionar a queixa principal...</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
