
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SeverityLevel } from "@/lib/cranial-utils";

interface RecomendacoesCardProps {
  recomendacoes?: string[];
  severityLevel: SeverityLevel;
}

export function RecomendacoesCard({ recomendacoes = [], severityLevel }: RecomendacoesCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recomendações Clínicas</CardTitle>
        <CardDescription>Baseadas no protocolo de avaliação craniana</CardDescription>
      </CardHeader>
      <CardContent>
        {recomendacoes.length > 0 ? (
          <ul className="list-disc pl-5 space-y-2">
            {recomendacoes.map((rec, idx) => (
              <li key={idx}>{rec}</li>
            ))}
            {severityLevel === "moderada" && (
              <li>Considerar avaliação para órtese craniana se não houver melhora em 4-6 semanas</li>
            )}
            {severityLevel === "severa" && (
              <li>Encaminhamento para especialista em órtese craniana recomendado</li>
            )}
          </ul>
        ) : (
          <p className="text-muted-foreground">Nenhuma recomendação disponível</p>
        )}
      </CardContent>
    </Card>
  );
}
