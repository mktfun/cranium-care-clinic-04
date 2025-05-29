
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Baby, User, Heart, Scale, Ruler, Droplet } from "lucide-react";
import { Prontuario } from "@/types";
import { useDebounce } from "@/hooks/use-debounce";

interface DadosPessoaisTabProps {
  paciente: any;
  prontuario: Prontuario;
  onUpdate?: (field: string, value: any) => void;
}

export function DadosPessoaisTab({ paciente, prontuario, onUpdate }: DadosPessoaisTabProps) {
  const [localPeso, setLocalPeso] = useState(prontuario?.peso || "");
  const [localAltura, setLocalAltura] = useState(prontuario?.altura || "");
  const [localTipoSanguineo, setLocalTipoSanguineo] = useState(prontuario?.tipo_sanguineo || "");
  const [localAlergias, setLocalAlergias] = useState(prontuario?.alergias || "");
  const [localObservacoesGerais, setLocalObservacoesGerais] = useState(prontuario?.observacoes_gerais || "");

  // Debounce values before saving
  const debouncedPeso = useDebounce(localPeso, 1000);
  const debouncedAltura = useDebounce(localAltura, 1000);
  const debouncedTipoSanguineo = useDebounce(localTipoSanguineo, 1000);
  const debouncedAlergias = useDebounce(localAlergias, 1000);
  const debouncedObservacoesGerais = useDebounce(localObservacoesGerais, 1000);

  // Auto-save when debounced values change
  useEffect(() => {
    if (debouncedPeso !== (prontuario?.peso || "")) {
      onUpdate?.("peso", debouncedPeso);
    }
  }, [debouncedPeso, prontuario?.peso, onUpdate]);

  useEffect(() => {
    if (debouncedAltura !== (prontuario?.altura || "")) {
      onUpdate?.("altura", debouncedAltura);
    }
  }, [debouncedAltura, prontuario?.altura, onUpdate]);

  useEffect(() => {
    if (debouncedTipoSanguineo !== (prontuario?.tipo_sanguineo || "")) {
      onUpdate?.("tipo_sanguineo", debouncedTipoSanguineo);
    }
  }, [debouncedTipoSanguineo, prontuario?.tipo_sanguineo, onUpdate]);

  useEffect(() => {
    if (debouncedAlergias !== (prontuario?.alergias || "")) {
      onUpdate?.("alergias", debouncedAlergias);
    }
  }, [debouncedAlergias, prontuario?.alergias, onUpdate]);

  useEffect(() => {
    if (debouncedObservacoesGerais !== (prontuario?.observacoes_gerais || "")) {
      onUpdate?.("observacoes_gerais", debouncedObservacoesGerais);
    }
  }, [debouncedObservacoesGerais, prontuario?.observacoes_gerais, onUpdate]);

  const formatarData = (dataString: string) => {
    if (!dataString) return "N/A";
    const data = new Date(dataString);
    if (isNaN(data.getTime())) return "Data inválida";
    return data.toLocaleDateString('pt-BR');
  };

  return (
    <div className="space-y-6">
      {/* Dados de Nascimento */}
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

      {/* Dados Atuais */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-turquesa" />
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
                value={localPeso}
                onChange={(e) => setLocalPeso(e.target.value)}
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
                value={localAltura}
                onChange={(e) => setLocalAltura(e.target.value)}
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
                value={localTipoSanguineo}
                onChange={(e) => setLocalTipoSanguineo(e.target.value)}
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
              value={localAlergias}
              onChange={(e) => setLocalAlergias(e.target.value)}
              className="min-h-[80px]"
            />
          </div>

          <div>
            <Label htmlFor="observacoes_gerais">Observações Gerais</Label>
            <Textarea
              id="observacoes_gerais"
              placeholder="Observações gerais sobre o paciente..."
              value={localObservacoesGerais}
              onChange={(e) => setLocalObservacoesGerais(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
