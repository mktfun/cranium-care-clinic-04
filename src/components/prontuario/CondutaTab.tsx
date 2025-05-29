
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Stethoscope, FileText } from "lucide-react";
import { Prontuario } from "@/types";
import { useDebounce } from "@/hooks/use-debounce";

interface CondutaTabProps {
  prontuario: Prontuario;
  pacienteId: string;
  onUpdate?: (field: string, value: any) => void;
}

export function CondutaTab({ prontuario, pacienteId, onUpdate }: CondutaTabProps) {
  const [localConduta, setLocalConduta] = useState("");
  const [localAtestado, setLocalAtestado] = useState("");

  // Sincronizar com dados do prontuário quando ele mudar
  useEffect(() => {
    setLocalConduta(prontuario?.conduta || "");
    setLocalAtestado(prontuario?.atestado || "");
  }, [prontuario]);

  // Debounce values before saving
  const debouncedConduta = useDebounce(localConduta, 1000);
  const debouncedAtestado = useDebounce(localAtestado, 1000);

  // Auto-save when debounced values change
  useEffect(() => {
    if (debouncedConduta !== (prontuario?.conduta || "")) {
      onUpdate?.("conduta", debouncedConduta);
    }
  }, [debouncedConduta, prontuario?.conduta, onUpdate]);

  useEffect(() => {
    if (debouncedAtestado !== (prontuario?.atestado || "")) {
      onUpdate?.("atestado", debouncedAtestado);
    }
  }, [debouncedAtestado, prontuario?.atestado, onUpdate]);

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
              value={localConduta}
              onChange={(e) => setLocalConduta(e.target.value)}
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
              value={localAtestado}
              onChange={(e) => setLocalAtestado(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
