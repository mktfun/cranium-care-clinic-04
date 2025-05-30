
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SeverityLevel, AsymmetryType } from "@/lib/cranial-utils";
import { type CranialDiagnosis } from "@/lib/cranial-classification-utils";
import { type CHOAClassification, getCHOAStatusColor } from "@/lib/choa-plagiocephaly-scale";

interface ResumoAvaliacaoCardProps {
  dataFormatada: string;
  idadeNaAvaliacao: string;
  severityLevel: SeverityLevel;
  asymmetryType: AsymmetryType;
  diagnosis: CranialDiagnosis;
  choaClassification?: CHOAClassification;
}

export function ResumoAvaliacaoCard({ 
  dataFormatada, 
  idadeNaAvaliacao, 
  severityLevel, 
  asymmetryType,
  diagnosis,
  choaClassification
}: ResumoAvaliacaoCardProps) {
  const getSeverityBadge = (severity: SeverityLevel) => {
    const variants = {
      normal: "bg-green-100 text-green-800 border-green-200",
      leve: "bg-yellow-100 text-yellow-800 border-yellow-200", 
      moderada: "bg-orange-100 text-orange-800 border-orange-200",
      severa: "bg-red-100 text-red-800 border-red-200"
    };
    
    const labels = {
      normal: "Normal",
      leve: "Leve", 
      moderada: "Moderada",
      severa: "Severa"
    };

    return (
      <Badge className={`${variants[severity]} font-medium border`}>
        {labels[severity]}
      </Badge>
    );
  };

  const getCHOABadge = (choa: CHOAClassification) => {
    const colorClass = getCHOAStatusColor(0); // Will be determined by level in the function
    
    return (
      <Badge className={`${colorClass} font-medium border`}>
        Nível CHOA {choa.level}
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resumo da Avaliação</CardTitle>
        <CardDescription>Resultados da análise craniana realizada</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Data da Avaliação</p>
            <p className="font-medium">{dataFormatada}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Idade na Avaliação</p>
            <p className="font-medium">{idadeNaAvaliacao}</p>
          </div>
        </div>
        
        <div className="space-y-3">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Diagnóstico Principal</p>
            <p className="font-medium text-lg">{diagnosis.diagnosis}</p>
          </div>
          
          <div className="flex items-center gap-2">
            <p className="text-sm text-muted-foreground">Severidade:</p>
            {getSeverityBadge(severityLevel)}
          </div>
          
          {choaClassification && (
            <div className="flex items-center gap-2">
              <p className="text-sm text-muted-foreground">Classificação CHOA:</p>
              {getCHOABadge(choaClassification)}
            </div>
          )}
          
          {choaClassification && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm font-medium text-blue-800 mb-1">
                Apresentação Clínica (CHOA Nível {choaClassification.level}):
              </p>
              <p className="text-sm text-blue-700">
                {choaClassification.clinicalPresentation}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
