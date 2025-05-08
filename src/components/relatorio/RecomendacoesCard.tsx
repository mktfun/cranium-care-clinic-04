
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
        {recomendacoes && recomendacoes.length > 0 ? (
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
          <div>
            <p className="text-muted-foreground">Recomendações gerais baseadas no tipo de assimetria e severidade:</p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              {severityLevel === "normal" && (
                <li>Manter acompanhamento preventivo do desenvolvimento craniano</li>
              )}
              {severityLevel === "leve" && (
                <>
                  <li>Reposicionamento ativo durante períodos de vigília</li>
                  <li>Exercícios de fisioterapia para fortalecimento cervical</li>
                  <li>Tempo supervisionado de barriga para baixo (tummy time)</li>
                </>
              )}
              {severityLevel === "moderada" && (
                <>
                  <li>Programa intensivo de reposicionamento e fisioterapia</li>
                  <li>Considerar uso de travesseiro terapêutico específico</li>
                  <li>Avaliar necessidade de órtese craniana nas próximas 4-6 semanas</li>
                </>
              )}
              {severityLevel === "severa" && (
                <>
                  <li>Encaminhamento para avaliação especializada de órtese craniana</li>
                  <li>Iniciar tratamento com capacete ortopédico o mais breve possível</li>
                  <li>Consulta com neurocirurgião pediátrico recomendada</li>
                </>
              )}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
