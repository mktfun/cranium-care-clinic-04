
import { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Prontuario } from "@/types";

interface AvaliacaoTabProps {
  prontuario: Prontuario | null;
  pacienteId: string;
}

export function AvaliacaoTab({ prontuario, pacienteId }: AvaliacaoTabProps) {
  const [avaliacao, setAvaliacao] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Carrega os dados existentes
  useEffect(() => {
    if (prontuario?.avaliacao) {
      setAvaliacao(prontuario.avaliacao);
    }
  }, [prontuario]);

  // Salva a avaliação no banco de dados
  const handleSalvarAvaliacao = async () => {
    if (!prontuario) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('prontuarios')
        .update({ avaliacao })
        .eq('id', prontuario.id);

      if (error) throw error;
      toast.success("Avaliação salva com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar avaliação:", error);
      toast.error("Erro ao salvar avaliação. Tente novamente.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-6">
      <Loader2 className="h-6 w-6 animate-spin text-turquesa" />
    </div>;
  }

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
              value={avaliacao}
              onChange={(e) => setAvaliacao(e.target.value)}
            />
            <Button 
              onClick={handleSalvarAvaliacao} 
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
