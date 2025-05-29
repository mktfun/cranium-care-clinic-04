
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Activity, Clock, Heart, Brain } from "lucide-react";
import { Prontuario } from "@/types";
import { useDebounce } from "@/hooks/use-debounce";

interface AvaliacaoTabProps {
  prontuario: Prontuario;
  pacienteId: string;
  onUpdate?: (field: string, value: any) => void;
}

export function AvaliacaoTab({ prontuario, pacienteId, onUpdate }: AvaliacaoTabProps) {
  const [localQueixaPrincipal, setLocalQueixaPrincipal] = useState(prontuario?.queixa_principal || "");
  const [localIdadeGestacional, setLocalIdadeGestacional] = useState(prontuario?.idade_gestacional || "");
  const [localIdadeCorrigida, setLocalIdadeCorrigida] = useState(prontuario?.idade_corrigida || "");
  const [localObservacoesAnamnese, setLocalObservacoesAnamnese] = useState(prontuario?.observacoes_anamnese || "");
  const [localAvaliacao, setLocalAvaliacao] = useState(prontuario?.avaliacao || "");

  // Debounce values before saving
  const debouncedQueixaPrincipal = useDebounce(localQueixaPrincipal, 1000);
  const debouncedIdadeGestacional = useDebounce(localIdadeGestacional, 1000);
  const debouncedIdadeCorrigida = useDebounce(localIdadeCorrigida, 1000);
  const debouncedObservacoesAnamnese = useDebounce(localObservacoesAnamnese, 1000);
  const debouncedAvaliacao = useDebounce(localAvaliacao, 1000);

  // Auto-save when debounced values change
  useEffect(() => {
    if (debouncedQueixaPrincipal !== (prontuario?.queixa_principal || "")) {
      onUpdate?.("queixa_principal", debouncedQueixaPrincipal);
    }
  }, [debouncedQueixaPrincipal, prontuario?.queixa_principal, onUpdate]);

  useEffect(() => {
    if (debouncedIdadeGestacional !== (prontuario?.idade_gestacional || "")) {
      onUpdate?.("idade_gestacional", debouncedIdadeGestacional);
    }
  }, [debouncedIdadeGestacional, prontuario?.idade_gestacional, onUpdate]);

  useEffect(() => {
    if (debouncedIdadeCorrigida !== (prontuario?.idade_corrigida || "")) {
      onUpdate?.("idade_corrigida", debouncedIdadeCorrigida);
    }
  }, [debouncedIdadeCorrigida, prontuario?.idade_corrigida, onUpdate]);

  useEffect(() => {
    if (debouncedObservacoesAnamnese !== (prontuario?.observacoes_anamnese || "")) {
      onUpdate?.("observacoes_anamnese", debouncedObservacoesAnamnese);
    }
  }, [debouncedObservacoesAnamnese, prontuario?.observacoes_anamnese, onUpdate]);

  useEffect(() => {
    if (debouncedAvaliacao !== (prontuario?.avaliacao || "")) {
      onUpdate?.("avaliacao", debouncedAvaliacao);
    }
  }, [debouncedAvaliacao, prontuario?.avaliacao, onUpdate]);

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
              value={localQueixaPrincipal}
              onChange={(e) => setLocalQueixaPrincipal(e.target.value)}
              className="min-h-[100px]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="idade_gestacional">Idade Gestacional</Label>
              <Input
                id="idade_gestacional"
                placeholder="Ex: 38 semanas"
                value={localIdadeGestacional}
                onChange={(e) => setLocalIdadeGestacional(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="idade_corrigida">Idade Corrigida</Label>
              <Input
                id="idade_corrigida"
                placeholder="Ex: 2 meses corrigidos"
                value={localIdadeCorrigida}
                onChange={(e) => setLocalIdadeCorrigida(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="observacoes_anamnese">Observações da Anamnese</Label>
            <Textarea
              id="observacoes_anamnese"
              placeholder="Observações complementares sobre a história clínica..."
              value={localObservacoesAnamnese}
              onChange={(e) => setLocalObservacoesAnamnese(e.target.value)}
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
              value={localAvaliacao}
              onChange={(e) => setLocalAvaliacao(e.target.value)}
              className="min-h-[150px]"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
