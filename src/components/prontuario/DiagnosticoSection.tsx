
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";

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

  const handleSave = async () => {
    // Implementar salvamento no banco
    setIsEditing(false);
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
