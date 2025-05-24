
import { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Prontuario } from "@/types";

interface DiagnosticoTabProps {
  prontuario: Prontuario | null;
  pacienteId: string;
}

export function DiagnosticoTab({ prontuario, pacienteId }: DiagnosticoTabProps) {
  const [cid, setCid] = useState("");
  const [diagnostico, setDiagnostico] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Carrega os dados existentes
  useEffect(() => {
    if (prontuario?.cid) {
      setCid(prontuario.cid);
    }
    if (prontuario?.diagnostico) {
      setDiagnostico(prontuario.diagnostico);
    }
  }, [prontuario]);

  // Salva o diagnóstico no banco de dados
  const handleSalvarDiagnostico = async () => {
    if (!prontuario) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('prontuarios')
        .update({ 
          cid,
          diagnostico 
        })
        .eq('id', prontuario.id);

      if (error) throw error;
      toast.success("Diagnóstico salvo com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar diagnóstico:", error);
      toast.error("Erro ao salvar diagnóstico. Tente novamente.");
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
          <CardTitle className="text-lg font-medium">Diagnóstico</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cid">CID</Label>
              <Input
                id="cid"
                placeholder="Digite o código CID..."
                value={cid}
                onChange={(e) => setCid(e.target.value)}
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="diagnostico">Notas Diagnósticas</Label>
              <Textarea 
                id="diagnostico"
                className="min-h-[200px] resize-y"
                placeholder="Descreva o diagnóstico do paciente..."
                value={diagnostico}
                onChange={(e) => setDiagnostico(e.target.value)}
              />
            </div>
            
            <Button 
              onClick={handleSalvarDiagnostico} 
              disabled={isSaving}
              className="bg-turquesa hover:bg-turquesa/90">
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando
                </>
              ) : (
                "Salvar Diagnóstico"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
