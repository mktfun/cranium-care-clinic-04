
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
            <p className="text-lg font-medium">{indiceCraniano}%</p>
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
            <p className="text-lg font-medium">{cvai}%</p>
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
