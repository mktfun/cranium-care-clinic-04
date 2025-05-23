
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

// Este componente é apenas de interface e não tem vínculo com banco de dados ainda
export function AvaliacaoTab() {
  const [avaliacaoContent, setAvaliacaoContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  
  // Esta é uma função simulada que não faz nada ainda
  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">Avaliação</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Textarea 
              className="min-h-[200px] resize-y"
              placeholder="Descreva a avaliação do paciente..."
              value={avaliacaoContent}
              onChange={(e) => setAvaliacaoContent(e.target.value)}
            />
            <Button 
              onClick={handleSave} 
              disabled={isSaving}
              className="bg-turquesa hover:bg-turquesa/90">
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando
                </>
              ) : (
                "Salvar Avaliação"
              )}
            </Button>
            <p className="text-xs text-muted-foreground italic">
              Nota: A funcionalidade de salvamento desta seção será implementada em breve.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
