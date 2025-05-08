
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";
import { AsymmetryType, SeverityLevel } from "@/lib/cranial-utils";

interface ResumoAvaliacaoCardProps {
  dataFormatada: string;
  idadeNaAvaliacao: string;
  severityLevel: SeverityLevel;
  asymmetryType: AsymmetryType;
}

export function ResumoAvaliacaoCard({
  dataFormatada,
  idadeNaAvaliacao,
  severityLevel,
  asymmetryType
}: ResumoAvaliacaoCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Resumo da Avaliação</CardTitle>
        <CardDescription>
          Data: {dataFormatada} • 
          Idade na avaliação: {idadeNaAvaliacao}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div>
            <p className="text-sm text-muted-foreground">Status</p>
            <div className="mt-1">
              <StatusBadge status={severityLevel} asymmetryType={asymmetryType} />
            </div>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Diagnóstico</p>
            <p className="font-medium">
              {asymmetryType === "Normal" 
                ? "Desenvolvimento craniano normal" 
                : `${asymmetryType} ${severityLevel}`}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
