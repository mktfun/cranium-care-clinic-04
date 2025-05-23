
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface DiagnosticoSectionProps {
  prontuarioId: string;
  initialDiagnostico?: string;
  initialCid?: string;
}

export function DiagnosticoSection({ 
  prontuarioId, 
  initialDiagnostico = "", 
  initialCid = "" 
}: DiagnosticoSectionProps) {
  const [diagnostico, setDiagnostico] = useState(initialDiagnostico);
  const [cid, setCid] = useState(initialCid);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('prontuarios')
        .update({ 
          diagnostico: diagnostico,
          cid: cid
        })
        .eq('id', prontuarioId);

      if (error) {
        console.error('Erro ao salvar diagnóstico:', error);
        toast.error('Erro ao salvar diagnóstico.');
        return;
      }

      toast.success('Diagnóstico salvo com sucesso!');
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
        <CardTitle className="text-lg">Diagnóstico</CardTitle>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <div className="space-y-4">
            <div>
              <Label htmlFor="diagnostico">Diagnóstico</Label>
              <Textarea
                id="diagnostico"
                value={diagnostico}
                onChange={(e) => setDiagnostico(e.target.value)}
                placeholder="Descreva o diagnóstico..."
                className="min-h-[100px]"
              />
            </div>
            <div>
              <Label htmlFor="cid">CID</Label>
              <Input
                id="cid"
                value={cid}
                onChange={(e) => setCid(e.target.value)}
                placeholder="Ex: Q67.3"
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
          <div onClick={() => setIsEditing(true)} className="cursor-pointer space-y-2">
            <div>
              <strong>Diagnóstico:</strong>{" "}
              {diagnostico || (
                <span className="text-muted-foreground italic">Clique para adicionar diagnóstico...</span>
              )}
            </div>
            <div>
              <strong>CID:</strong>{" "}
              {cid || (
                <span className="text-muted-foreground italic">Clique para adicionar CID...</span>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
