
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
  const { asymmetryType, severityLevel } = getCranialStatus(indiceCraniano, cvai);

  // Função para determinar a classe de cor com base no valor do índice craniano
  const getIndiceClasse = (valor: number) => {
    if (valor >= 75 && valor <= 85) return "text-green-600"; // Normal
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
        <CardDescription>Medições realizadas em {dataFormatada}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
          {/* Linha 1: Comprimento, Largura, Índice Craniano */}
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
              {indiceCraniano}%
            </p>
          </div>
          
          {/* Linha 2: Diagonal D, Diagonal E, Diferença Diagonais, CVAI */}
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
            <p className="text-lg font-medium">{diferencaDiagonais} mm</p>
          </div>
          
          <div>
            <p className="text-sm text-muted-foreground">CVAI</p>
            <p className={`text-lg font-medium ${getCvaiClasse(cvai)}`}>
              {cvai}%
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Status</p>
            <StatusBadge 
              status={severityLevel} 
              asymmetryType={asymmetryType} 
              className="mt-1"
            />
          </div>
          
          {perimetroCefalico && (
            <div>
              <p className="text-sm text-muted-foreground">Perímetro Cefálico</p>
              <p className="text-lg font-medium">{perimetroCefalico} mm</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
