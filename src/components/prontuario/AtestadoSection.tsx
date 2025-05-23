
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Save, FileText } from "lucide-react";

interface AtestadoSectionProps {
  prontuarioId: string;
  initialValue?: string;
}

export function AtestadoSection({ prontuarioId, initialValue = "" }: AtestadoSectionProps) {
  const [atestado, setAtestado] = useState(initialValue);
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = async () => {
    // Implementar salvamento no banco
    setIsEditing(false);
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
