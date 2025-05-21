
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type MeasurementResultsProps = {
  measurements: {
    comprimento: number;
    largura: number;
    diagonalD: number;
    diagonalE: number;
    perimetroCefalico: number;
    // Additional optional measurements
    ap?: number | null;
    bp?: number | null;
    pd?: number | null;
    pe?: number | null;
    tragusE?: number | null;
    tragusD?: number | null;
  };
  perimetroError: string | null;
};

export default function MeasurementResults({ 
  measurements, 
  perimetroError 
}: MeasurementResultsProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // Calculate derived measurements
  const indiceCraniano = measurements.largura && measurements.comprimento
    ? Number(((measurements.largura / measurements.comprimento) * 100).toFixed(2))
    : null;
  
  const diferencaDiagonais = measurements.diagonalD && measurements.diagonalE
    ? Number(Math.abs(measurements.diagonalD - measurements.diagonalE).toFixed(2))
    : null;
  
  const cvai = measurements.diagonalD && measurements.diagonalE
    ? Number((Math.abs(measurements.diagonalD - measurements.diagonalE) / Math.max(measurements.diagonalD, measurements.diagonalE) * 100).toFixed(2))
    : null;

  // Function to classify indice craniano
  const getClassificacaoIC = (ic: number | null) => {
    if (ic === null) return "";
    if (ic < 76) return "Dolicocefalia";
    if (ic <= 80.9) return "Mesocefalia (Normal)";
    if (ic <= 90) return "Braquicefalia";
    return "Hiperbraquicefalia";
  };

  // Function to classify CVAI
  const getClassificacaoCV = (cvai: number | null) => {
    if (cvai === null) return "";
    if (cvai <= 3.5) return "Normal";
    if (cvai <= 6.25) return "Leve";
    if (cvai <= 8.75) return "Moderada";
    return "Severa";
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <div className="font-semibold text-sm">Comprimento</div>
          <div className="text-2xl font-bold">{measurements.comprimento} <span className="text-sm font-normal text-muted-foreground">mm</span></div>
        </div>
        <div className="space-y-1">
          <div className="font-semibold text-sm">Largura</div>
          <div className="text-2xl font-bold">{measurements.largura} <span className="text-sm font-normal text-muted-foreground">mm</span></div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <div className="font-semibold text-sm">Diagonal D</div>
          <div className="text-2xl font-bold">{measurements.diagonalD} <span className="text-sm font-normal text-muted-foreground">mm</span></div>
        </div>
        <div className="space-y-1">
          <div className="font-semibold text-sm">Diagonal E</div>
          <div className="text-2xl font-bold">{measurements.diagonalE} <span className="text-sm font-normal text-muted-foreground">mm</span></div>
        </div>
      </div>
      
      <Separator />
      
      <div className="space-y-3">
        <div className="space-y-1">
          <div className="font-semibold text-sm">Perímetro Cefálico</div>
          <div className="text-2xl font-bold">{measurements.perimetroCefalico} <span className="text-sm font-normal text-muted-foreground">mm</span></div>
        </div>
        
        {perimetroError && (
          <Alert variant="destructive" className="py-2">
            <AlertTitle className="text-sm">Atenção</AlertTitle>
            <AlertDescription className="text-xs">{perimetroError}</AlertDescription>
          </Alert>
        )}
      </div>
      
      <Separator />
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <div className="font-semibold text-sm">Índice Craniano (IC)</div>
          <div className="text-xl font-bold">
            {indiceCraniano}% 
            <span className="text-xs ml-1 font-medium block text-muted-foreground">
              {getClassificacaoIC(indiceCraniano)}
            </span>
          </div>
        </div>
        <div className="space-y-1">
          <div className="font-semibold text-sm">CVAI</div>
          <div className="text-xl font-bold">
            {cvai}%
            <span className="text-xs ml-1 font-medium block text-muted-foreground">
              {getClassificacaoCV(cvai)}
            </span>
          </div>
        </div>
      </div>
      
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="w-full text-xs"
      >
        {showAdvanced ? "Ocultar" : "Mostrar"} medidas adicionais
      </Button>
      
      {showAdvanced && (
        <div className="grid grid-cols-3 gap-3 text-sm">
          {measurements.ap && (
            <div className="space-y-1">
              <div className="font-medium text-xs">AP</div>
              <div>{measurements.ap} <span className="text-xs text-muted-foreground">mm</span></div>
            </div>
          )}
          
          {measurements.bp && (
            <div className="space-y-1">
              <div className="font-medium text-xs">BP</div>
              <div>{measurements.bp} <span className="text-xs text-muted-foreground">mm</span></div>
            </div>
          )}
          
          {measurements.pd && (
            <div className="space-y-1">
              <div className="font-medium text-xs">PD</div>
              <div>{measurements.pd} <span className="text-xs text-muted-foreground">mm</span></div>
            </div>
          )}
          
          {measurements.pe && (
            <div className="space-y-1">
              <div className="font-medium text-xs">PE</div>
              <div>{measurements.pe} <span className="text-xs text-muted-foreground">mm</span></div>
            </div>
          )}
          
          {measurements.tragusE && (
            <div className="space-y-1">
              <div className="font-medium text-xs">TRAGUS E</div>
              <div>{measurements.tragusE} <span className="text-xs text-muted-foreground">mm</span></div>
            </div>
          )}
          
          {measurements.tragusD && (
            <div className="space-y-1">
              <div className="font-medium text-xs">TRAGUS D</div>
              <div>{measurements.tragusD} <span className="text-xs text-muted-foreground">mm</span></div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
