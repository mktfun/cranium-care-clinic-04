
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Brain } from "lucide-react";

interface WizardStep2Props {
  formData: any;
  updateFormData: (field: string, value: any) => void;
  paciente: any;
}

export function WizardStep2({ formData, updateFormData }: WizardStep2Props) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-turquesa" />
            Anamnese
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="queixa_principal">Queixa Principal</Label>
            <Textarea
              id="queixa_principal"
              placeholder="Descreva a queixa principal que motivou a consulta..."
              value={formData.queixa_principal}
              onChange={(e) => updateFormData("queixa_principal", e.target.value)}
              className="min-h-[100px]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="idade_gestacional">Idade Gestacional</Label>
              <Input
                id="idade_gestacional"
                placeholder="Ex: 38 semanas"
                value={formData.idade_gestacional}
                onChange={(e) => updateFormData("idade_gestacional", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="idade_corrigida">Idade Corrigida</Label>
              <Input
                id="idade_corrigida"
                placeholder="Ex: 2 meses corrigidos"
                value={formData.idade_corrigida}
                onChange={(e) => updateFormData("idade_corrigida", e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="observacoes_anamnese">Observações da Anamnese</Label>
            <Textarea
              id="observacoes_anamnese"
              placeholder="Observações complementares sobre a história clínica..."
              value={formData.observacoes_anamnese}
              onChange={(e) => updateFormData("observacoes_anamnese", e.target.value)}
              className="min-h-[120px]"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-turquesa" />
            Avaliação Clínica
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <Label htmlFor="avaliacao">Avaliação</Label>
            <Textarea
              id="avaliacao"
              placeholder="Descreva os achados da avaliação clínica..."
              value={formData.avaliacao}
              onChange={(e) => updateFormData("avaliacao", e.target.value)}
              className="min-h-[150px]"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
