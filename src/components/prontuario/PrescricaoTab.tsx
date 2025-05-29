
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { FileCheck } from "lucide-react";
import { Prontuario } from "@/types";
import { useDebounce } from "@/hooks/use-debounce";

interface PrescricaoTabProps {
  prontuario: Prontuario;
  pacienteId: string;
  onUpdate?: (field: string, value: any) => void;
}

export function PrescricaoTab({ prontuario, pacienteId, onUpdate }: PrescricaoTabProps) {
  const [localPrescricao, setLocalPrescricao] = useState(prontuario?.prescricao || "");

  // Debounce value before saving
  const debouncedPrescricao = useDebounce(localPrescricao, 1000);

  // Auto-save when debounced value changes
  useEffect(() => {
    if (debouncedPrescricao !== (prontuario?.prescricao || "")) {
      onUpdate?.("prescricao", debouncedPrescricao);
    }
  }, [debouncedPrescricao, prontuario?.prescricao, onUpdate]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCheck className="h-5 w-5 text-turquesa" />
            Prescrição Médica
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="prescricao">Prescrição</Label>
            <Textarea
              id="prescricao"
              placeholder="Digite a prescrição médica detalhada, incluindo medicamentos, dosagens, orientações e cuidados..."
              value={localPrescricao}
              onChange={(e) => setLocalPrescricao(e.target.value)}
              className="min-h-[200px]"
            />
          </div>
          
          <div className="text-sm text-muted-foreground mt-4 p-3 bg-muted rounded-lg">
            <p><strong>Dicas para prescrição:</strong></p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Inclua nome do medicamento, dosagem e frequência</li>
              <li>Especifique duração do tratamento</li>
              <li>Adicione orientações especiais para o cuidador</li>
              <li>Mencione sinais de alerta para retorno</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
