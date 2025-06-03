
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileCheck, Ruler } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

interface WizardStep5Props {
  formData: any;
  updateFormData: (field: string, value: any) => void;
  paciente: any;
}

export function WizardStep5({ formData, updateFormData }: WizardStep5Props) {
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
              value={formData.prescricao}
              onChange={(e) => updateFormData("prescricao", e.target.value)}
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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ruler className="h-5 w-5 text-turquesa" />
            Medição Cranial
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="realizar_medicao"
              checked={formData.realizar_medicao || false}
              onCheckedChange={(checked) => updateFormData("realizar_medicao", checked)}
            />
            <Label htmlFor="realizar_medicao" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Realizar nova medição cranial após finalizar este prontuário
            </Label>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Se marcado, você será direcionado para a página de medição cranial após salvar este prontuário.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
