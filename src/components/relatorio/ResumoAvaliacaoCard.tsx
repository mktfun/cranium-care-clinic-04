
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";
import { AsymmetryType, SeverityLevel } from "@/types";
import { type CranialDiagnosis } from "@/lib/cranial-classification-utils";

interface ResumoAvaliacaoCardProps {
  dataFormatada: string;
  idadeNaAvaliacao: string;
  severityLevel: SeverityLevel;
  asymmetryType: AsymmetryType;
  diagnosis?: CranialDiagnosis;
}

export function ResumoAvaliacaoCard({
  dataFormatada,
  idadeNaAvaliacao,
  severityLevel,
  asymmetryType,
  diagnosis
}: ResumoAvaliacaoCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Resumo da Avaliação</CardTitle>
        <CardDescription>Resultados da última medição craniana</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Data da Avaliação</p>
          <p className="text-lg">{dataFormatada}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">Idade na Avaliação</p>
          <p className="text-lg">{idadeNaAvaliacao}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">Diagnóstico</p>
          <div className="mt-1">
            <StatusBadge 
              status={severityLevel}
              asymmetryType={asymmetryType}
              diagnosis={diagnosis}
              variant="enhanced"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
