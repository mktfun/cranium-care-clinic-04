
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Baby, Scale, Ruler, Droplet, Heart } from "lucide-react";

interface WizardStep1Props {
  formData: any;
  updateFormData: (field: string, value: any) => void;
  paciente: any;
}

export function WizardStep1({ formData, updateFormData, paciente }: WizardStep1Props) {
  const formatarData = (dataString: string) => {
    if (!dataString) return "N/A";
    const data = new Date(dataString);
    if (isNaN(data.getTime())) return "Data inválida";
    return data.toLocaleDateString('pt-BR');
  };

  return (
    <div className="space-y-6">
      {/* Dados de Nascimento - Readonly */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Baby className="h-5 w-5 text-turquesa" />
            Dados de Nascimento
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Nome Completo</Label>
              <Input value={paciente?.nome || ""} disabled className="bg-muted" />
            </div>
            <div>
              <Label>Data de Nascimento</Label>
              <Input value={formatarData(paciente?.data_nascimento)} disabled className="bg-muted" />
            </div>
            <div>
              <Label>Sexo</Label>
              <Input value={paciente?.sexo || ""} disabled className="bg-muted" />
            </div>
            <div>
              <Label>Local de Nascimento</Label>
              <Input value={paciente?.local_nascimento || "Não informado"} disabled className="bg-muted" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dados Atuais da Consulta - Editáveis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-turquesa" />
            Dados Atuais da Consulta
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="peso">
                <Scale className="h-4 w-4 inline mr-1" />
                Peso (kg)
              </Label>
              <Input
                id="peso"
                type="number"
                step="0.1"
                placeholder="Ex: 3.5"
                value={formData.peso}
                onChange={(e) => updateFormData("peso", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="altura">
                <Ruler className="h-4 w-4 inline mr-1" />
                Altura (cm)
              </Label>
              <Input
                id="altura"
                type="number"
                step="0.1"
                placeholder="Ex: 50.5"
                value={formData.altura}
                onChange={(e) => updateFormData("altura", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="tipo_sanguineo">
                <Droplet className="h-4 w-4 inline mr-1" />
                Tipo Sanguíneo
              </Label>
              <Input
                id="tipo_sanguineo"
                placeholder="Ex: O+"
                value={formData.tipo_sanguineo}
                onChange={(e) => updateFormData("tipo_sanguineo", e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="alergias">
              <Heart className="h-4 w-4 inline mr-1" />
              Alergias Conhecidas
            </Label>
            <Textarea
              id="alergias"
              placeholder="Descreva alergias conhecidas, medicamentosas ou alimentares..."
              value={formData.alergias}
              onChange={(e) => updateFormData("alergias", e.target.value)}
              className="min-h-[80px]"
            />
          </div>

          <div>
            <Label htmlFor="observacoes_gerais">Observações Gerais</Label>
            <Textarea
              id="observacoes_gerais"
              placeholder="Observações gerais sobre o paciente..."
              value={formData.observacoes_gerais}
              onChange={(e) => updateFormData("observacoes_gerais", e.target.value)}
              className="min-h-[100px]"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
