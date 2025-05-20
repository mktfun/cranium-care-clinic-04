
import { calculateCranialIndex, calculateCVAI } from "@/lib/cranial-analysis";

type MeasurementResultsProps = {
  measurements: any;
  perimetroError: string | null;
};

export default function MeasurementResults({ 
  measurements, 
  perimetroError 
}: MeasurementResultsProps) {
  if (!measurements) return null;
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Comprimento</p>
          <p className="text-2xl font-bold">{measurements.comprimento} mm</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Largura</p>
          <p className="text-2xl font-bold">{measurements.largura} mm</p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Diagonal D</p>
          <p className="text-2xl font-bold">{measurements.diagonalD} mm</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Diagonal E</p>
          <p className="text-2xl font-bold">{measurements.diagonalE} mm</p>
        </div>
      </div>
      
      <div>
        <p className="text-sm text-muted-foreground">Perímetro Cefálico (estimado)</p>
        <div className="flex items-center">
          <p className={`text-2xl font-bold ${perimetroError ? "text-red-500" : ""}`}>
            {measurements.perimetroCefalico} mm
          </p>
          {perimetroError && (
            <p className="ml-2 text-sm text-red-500">⚠️ {perimetroError}</p>
          )}
        </div>
      </div>
      
      {/* Cálculos derivados */}
      <div className="pt-4 mt-4 border-t">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Índice Craniano</p>
            <p className="text-xl font-bold">
              {calculateCranialIndex(measurements.largura, measurements.comprimento).toFixed(1)}%
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">CVAI</p>
            <p className="text-xl font-bold">
              {calculateCVAI(measurements.diagonalD, measurements.diagonalE).toFixed(2)}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
