
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";
import { getCranialStatus } from "@/lib/cranial-utils";

interface ParametrosCraniaisCardProps {
  dataFormatada: string;
  comprimento: number;
  largura: number;
  indiceCraniano: number;
  diagonalD: number;
  diagonalE: number;
  diferencaDiagonais: number;
  cvai: number;
  perimetroCefalico?: number;
  className?: string;
}

export function ParametrosCraniaisCard({
  dataFormatada,
  comprimento,
  largura,
  indiceCraniano,
  diagonalD,
  diagonalE,
  diferencaDiagonais,
  cvai,
  perimetroCefalico,
  className
}: ParametrosCraniaisCardProps) {
  // Obter tipo e severidade da assimetria
  const {
    asymmetryType,
    severityLevel
  } = getCranialStatus(indiceCraniano, cvai);

  // Função para determinar a classe de cor com base no valor do índice craniano
  const getIndiceClasse = (valor: number) => {
    if (valor >= 75 && valor <= 85) return "text-green-600"; // Normal (updated range)
    if (valor > 85) return "text-amber-500"; // Braquicefalia
    return "text-amber-500"; // Dolicocefalia
  };

  // Função para determinar a classe de cor com base no valor do CVAI
  const getCvaiClasse = (valor: number) => {
    if (valor < 3.5) return "text-green-600"; // Normal
    if (valor < 6.25) return "text-yellow-500"; // Leve
    if (valor < 8.75) return "text-amber-500"; // Moderada
    return "text-red-500"; // Severa
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Parâmetros Cranianos</CardTitle>
        <CardDescription>Medições e índices calculados - {dataFormatada}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
          {/* Medições Básicas */}
          <div>
            <p className="text-sm text-muted-foreground">Comprimento</p>
            <p className="text-lg font-medium">{comprimento} mm</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Largura</p>
            <p className="text-lg font-medium">{largura} mm</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Índice Craniano</p>
            <p className={`text-lg font-medium ${getIndiceClasse(indiceCraniano)}`}>
              {indiceCraniano.toFixed(1)}%
            </p>
            <p className="text-xs text-muted-foreground">Normal: 75-85%</p>
          </div>
          
          {/* Diagonais */}
          <div>
            <p className="text-sm text-muted-foreground">Diagonal D</p>
            <p className="text-lg font-medium">{diagonalD} mm</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Diagonal E</p>
            <p className="text-lg font-medium">{diagonalE} mm</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Diferença Diagonais</p>
            <p className="text-lg font-medium">{diferencaDiagonais.toFixed(1)} mm</p>
            <p className="text-xs text-muted-foreground">
              |Diagonal D - Diagonal E|
            </p>
          </div>
          
          {/* CVAI e Status */}
          <div>
            <p className="text-sm text-muted-foreground">CVAI</p>
            <p className={`text-lg font-medium ${getCvaiClasse(cvai)}`}>
              {cvai.toFixed(1)}%
            </p>
            <p className="text-xs text-muted-foreground">Normal: &lt; 3.5%</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Status Geral</p>
            <div className="mt-1">
              <StatusBadge 
                status={severityLevel} 
                asymmetryType={asymmetryType}
                showAsymmetryType={true}
              />
            </div>
          </div>
          
          {/* Perímetro Cefálico */}
          {perimetroCefalico && (
            <div>
              <p className="text-sm text-muted-foreground">Perímetro Cefálico</p>
              <p className="text-lg font-medium">{perimetroCefalico} mm</p>
              <p className="text-xs text-muted-foreground">
                Circunferência da cabeça
              </p>
            </div>
          )}
        </div>

        {/* Fórmulas de Referência */}
        <div className="mt-6 pt-4 border-t">
          <h4 className="text-sm font-medium text-muted-foreground mb-2">Fórmulas de Cálculo</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-muted-foreground">
            <div>
              <span className="font-medium">Índice Craniano:</span> (Largura ÷ Comprimento) × 100
            </div>
            <div>
              <span className="font-medium">CVAI:</span> (|Diagonal D - Diagonal E| ÷ Diagonal Maior) × 100
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
