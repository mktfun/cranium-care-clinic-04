
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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
  perimetroCefalico
}: ParametrosCraniaisCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Parâmetros Craniais</CardTitle>
        <CardDescription>Medições realizadas em {dataFormatada}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
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
            <p className="text-xs text-muted-foreground mt-1">
              {indiceCraniano < 76 ? "Dolicocefalia" : 
               indiceCraniano <= 90 ? "Normocefalia" : 
               "Braquicefalia"}
            </p>
          </div>
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
            <p className="text-xs text-muted-foreground mt-1">
              {cvai < 3.5 ? "Normal" : 
               cvai <= 7 ? "Leve a moderada" : 
               "Severa"}
            </p>
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
