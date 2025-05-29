
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Stethoscope, FileText, Save } from "lucide-react";
import { Prontuario } from "@/types";
import { toast } from "sonner";

interface CondutaTabProps {
  prontuario: Prontuario;
  pacienteId: string;
  onUpdate?: (field: string, value: any) => void;
}

export function CondutaTab({ prontuario, pacienteId, onUpdate }: CondutaTabProps) {
  const [localConduta, setLocalConduta] = useState("");
  const [localAtestado, setLocalAtestado] = useState("");
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Sincronizar com dados do prontuário quando ele mudar
  useEffect(() => {
    setLocalConduta(prontuario?.conduta || "");
    setLocalAtestado(prontuario?.atestado || "");
    setHasChanges(false);
  }, [prontuario]);

  // Verificar mudanças
  useEffect(() => {
    const changed = 
      localConduta !== (prontuario?.conduta || "") ||
      localAtestado !== (prontuario?.atestado || "");

    setHasChanges(changed);
  }, [localConduta, localAtestado, prontuario]);

  const handleSave = async () => {
    if (!hasChanges) {
      toast.info("Nenhuma alteração para salvar.");
      return;
    }

    setIsSaving(true);
    try {
      const updates = [];

      if (localConduta !== (prontuario?.conduta || "")) {
        updates.push(onUpdate?.("conduta", localConduta || null));
      }
      if (localAtestado !== (prontuario?.atestado || "")) {
        updates.push(onUpdate?.("atestado", localAtestado || null));
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
              <Stethoscope className="h-5 w-5 text-turquesa" />
              Conduta Médica
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
            <Label htmlFor="conduta">Conduta e Orientações</Label>
            <Textarea
              id="conduta"
              placeholder="Descreva a conduta médica, orientações e tratamentos indicados..."
              value={localConduta}
              onChange={(e) => setLocalConduta(e.target.value)}
              className="min-h-[150px]"
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
            <FileText className="h-5 w-5 text-turquesa" />
            Atestado Médico
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <Label htmlFor="atestado">Atestado</Label>
            <Textarea
              id="atestado"
              placeholder="Informações para atestado médico, se necessário..."
              value={localAtestado}
              onChange={(e) => setLocalAtestado(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
