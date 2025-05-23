
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";

interface QueixaPrincipalSectionProps {
  prontuarioId: string;
  initialValue?: string;
}

export function QueixaPrincipalSection({ prontuarioId, initialValue = "" }: QueixaPrincipalSectionProps) {
  const [queixaPrincipal, setQueixaPrincipal] = useState(initialValue);
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = async () => {
    // Implementar salvamento no banco
    setIsEditing(false);
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
            {queixaPrincipal || (
              <p className="text-muted-foreground italic">Clique para adicionar a queixa principal...</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
