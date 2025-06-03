
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Stethoscope, FileText } from "lucide-react";

interface WizardStep3Props {
  formData: any;
  updateFormData: (field: string, value: any) => void;
  paciente: any;
}

export function WizardStep3({ formData, updateFormData }: WizardStep3Props) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Stethoscope className="h-5 w-5 text-turquesa" />
            Conduta Médica
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="conduta">Conduta e Orientações</Label>
            <Textarea
              id="conduta"
              placeholder="Descreva a conduta médica, orientações e tratamentos indicados..."
              value={formData.conduta}
              onChange={(e) => updateFormData("conduta", e.target.value)}
              className="min-h-[150px]"
            />
          </div>
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
              value={formData.atestado}
              onChange={(e) => updateFormData("atestado", e.target.value)}
              className="min-h-[100px]"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
