
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity } from "lucide-react";
import { CIDSearchInput } from "@/components/prontuario/CIDSearchInput";

interface WizardStep4Props {
  formData: any;
  updateFormData: (field: string, value: any) => void;
  paciente: any;
}

export function WizardStep4({ formData, updateFormData }: WizardStep4Props) {
  const handleCIDSelect = (cid: any) => {
    updateFormData("cid", cid.codigo);
    // Auto-append CID description to diagnostic notes if not already present
    const cidDescription = `${cid.codigo} - ${cid.descricao}`;
    if (!formData.diagnostico.includes(cidDescription)) {
      const newDiagnostico = formData.diagnostico 
        ? `${formData.diagnostico}\n\n${cidDescription}`
        : cidDescription;
      updateFormData("diagnostico", newDiagnostico);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-turquesa" />
            Diagnóstico
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="diagnostico">Diagnóstico Clínico</Label>
            <Textarea
              id="diagnostico"
              placeholder="Descreva o diagnóstico baseado na avaliação clínica..."
              value={formData.diagnostico}
              onChange={(e) => updateFormData("diagnostico", e.target.value)}
              className="min-h-[150px]"
            />
          </div>

          <CIDSearchInput
            value={formData.cid}
            onChange={(value) => updateFormData("cid", value)}
            onCIDSelect={handleCIDSelect}
            placeholder="Digite o código CID ou busque por diagnóstico..."
            label="Código CID"
          />
        </CardContent>
      </Card>
    </div>
  );
}
