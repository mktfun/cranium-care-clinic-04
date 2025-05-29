
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Activity } from "lucide-react";
import { Prontuario } from "@/types";
import { CIDSearchInput } from "@/components/prontuario/CIDSearchInput";
import { useDebounce } from "@/hooks/use-debounce";

interface DiagnosticoTabProps {
  prontuario: Prontuario;
  pacienteId: string;
  onUpdate?: (field: string, value: any) => void;
}

export function DiagnosticoTab({ prontuario, pacienteId, onUpdate }: DiagnosticoTabProps) {
  const [localDiagnostico, setLocalDiagnostico] = useState("");
  const [localCid, setLocalCid] = useState("");

  // Sincronizar com dados do prontuário quando ele mudar
  useEffect(() => {
    setLocalDiagnostico(prontuario?.diagnostico || "");
    setLocalCid(prontuario?.cid || "");
  }, [prontuario]);

  // Debounce values before saving
  const debouncedDiagnostico = useDebounce(localDiagnostico, 1000);
  const debouncedCid = useDebounce(localCid, 1000);

  // Auto-save when debounced values change
  useEffect(() => {
    if (debouncedDiagnostico !== (prontuario?.diagnostico || "")) {
      onUpdate?.("diagnostico", debouncedDiagnostico);
    }
  }, [debouncedDiagnostico, prontuario?.diagnostico, onUpdate]);

  useEffect(() => {
    if (debouncedCid !== (prontuario?.cid || "")) {
      onUpdate?.("cid", debouncedCid);
    }
  }, [debouncedCid, prontuario?.cid, onUpdate]);

  const handleCIDSelect = (cid: any) => {
    setLocalCid(cid.codigo);
    // Auto-append CID description to diagnostic notes if not already present
    const cidDescription = `${cid.codigo} - ${cid.descricao}`;
    if (!localDiagnostico.includes(cidDescription)) {
      const newDiagnostico = localDiagnostico 
        ? `${localDiagnostico}\n\n${cidDescription}`
        : cidDescription;
      setLocalDiagnostico(newDiagnostico);
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
              value={localDiagnostico}
              onChange={(e) => setLocalDiagnostico(e.target.value)}
              className="min-h-[150px]"
            />
          </div>

          <CIDSearchInput
            value={localCid}
            onChange={setLocalCid}
            onCIDSelect={handleCIDSelect}
            placeholder="Digite o código CID ou busque por diagnóstico..."
            label="Código CID"
          />
        </CardContent>
      </Card>
    </div>
  );
}
