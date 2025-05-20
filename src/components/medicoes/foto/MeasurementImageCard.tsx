
import { useRef, useState } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Loader2, ZoomIn } from "lucide-react";
import MeasurementOverlay from "./MeasurementOverlay";
import MeasurementButtons from "./MeasurementButtons";
import MeasurementLegend from "./MeasurementLegend";

type MeasurementImageCardProps = {
  uploadedImage: string | null;
  calibrationMode: boolean;
  setCalibrationMode: (mode: boolean) => void;
  measurementMode: string | null;
  setMeasurementMode: (mode: string | null) => void;
  calibrationFactor: number | null;
  calibrationStart: {x: number, y: number} | null;
  calibrationEnd: {x: number, y: number} | null;
  measurementPoints: any[];
  measurements: any;
  handleImageClick: (event: React.MouseEvent<HTMLImageElement>) => void;
  calculateMeasurements: () => void;
  setMeasurements: (measurements: any) => void;
  setCalibrationStart?: (pos: {x: number, y: number} | null) => void;
  setCalibrationEnd?: (pos: {x: number, y: number} | null) => void;
  setMeasurementPoints?: (points: any[]) => void;
  // Novos modos
  apMode?: boolean;
  setApMode?: (mode: boolean) => void;
  bpMode?: boolean;
  setBpMode?: (mode: boolean) => void;
  pdMode?: boolean;
  setPdMode?: (mode: boolean) => void;
  peMode?: boolean;
  setPeMode?: (mode: boolean) => void;
  tragusEMode?: boolean;
  setTragusEMode?: (mode: boolean) => void;
  tragusDMode?: boolean;
  setTragusDMode?: (mode: boolean) => void;
  autoDetectMeasurements?: () => void;
  autoDetecting?: boolean;
};

export default function MeasurementImageCard({
  uploadedImage,
  calibrationMode,
  setCalibrationMode,
  measurementMode,
  setMeasurementMode,
  calibrationFactor,
  calibrationStart,
  calibrationEnd,
  measurementPoints,
  measurements,
  handleImageClick,
  calculateMeasurements,
  setMeasurements,
  setCalibrationStart,
  setCalibrationEnd,
  setMeasurementPoints,
  apMode,
  setApMode,
  bpMode,
  setBpMode,
  pdMode,
  setPdMode,
  peMode,
  setPeMode,
  tragusEMode,
  setTragusEMode,
  tragusDMode,
  setTragusDMode,
  autoDetectMeasurements,
  autoDetecting
}: MeasurementImageCardProps) {
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isAdjustMode, setIsAdjustMode] = useState(false);

  // Handler for point adjustments
  const handleMovePoint = (index: number, newPos: {x: number, y: number}) => {
    if (!setMeasurementPoints && !setCalibrationStart && !setCalibrationEnd) return;
    
    // Handle calibration point adjustment
    if (index === -2 && setCalibrationStart) {
      setCalibrationStart(newPos);
    } 
    else if (index === -1 && setCalibrationEnd) {
      setCalibrationEnd(newPos);
    }
    // Handle measurement point adjustment
    else if (index >= 0 && setMeasurementPoints) {
      const updatedPoints = [...measurementPoints];
      updatedPoints[index] = { ...updatedPoints[index], ...newPos };
      setMeasurementPoints(updatedPoints);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Imagem para Medição</span>
          <div className="flex gap-2">
            {autoDetectMeasurements && !measurements && (
              <Button
                onClick={autoDetectMeasurements}
                variant="outline"
                size="sm"
                disabled={autoDetecting}
              >
                {autoDetecting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Detectando...
                  </>
                ) : (
                  <>
                    <ZoomIn className="h-4 w-4 mr-2" />
                    Detectar Automático
                  </>
                )}
              </Button>
            )}
            
            {(measurementPoints.length > 0 || calibrationStart) && !measurements && (
              <Button
                onClick={() => setIsAdjustMode(!isAdjustMode)}
                variant={isAdjustMode ? "default" : "outline"}
                size="sm"
              >
                {isAdjustMode ? "Concluir Ajustes" : "Ajustar Pontos"}
              </Button>
            )}
            
            {measurements && (
              <Button
                onClick={() => setMeasurements(null)}
                variant="outline"
                size="sm"
              >
                Refazer Medições
              </Button>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="border rounded-lg overflow-hidden relative" ref={containerRef}>
          <AspectRatio ratio={4/3}>
            {uploadedImage && (
              <img 
                ref={imageRef}
                src={uploadedImage} 
                alt="Foto do paciente" 
                className={`w-full h-full object-contain ${
                  (calibrationMode || measurementMode || apMode || bpMode || pdMode || peMode || tragusEMode || tragusDMode) && !isAdjustMode ? 'cursor-crosshair' : ''
                }`}
                onClick={isAdjustMode ? undefined : handleImageClick}
              />
            )}
            <MeasurementOverlay
              uploadedImage={uploadedImage}
              imageRef={imageRef}
              calibrationStart={calibrationStart}
              calibrationEnd={calibrationEnd}
              measurementPoints={measurementPoints}
              onMovePoint={isAdjustMode ? handleMovePoint : undefined}
            />
          </AspectRatio>
        </div>

        {!measurements && (
          <div className="mt-4 space-y-2">
            <h3 className="font-medium">Instruções para Medição:</h3>
            {isAdjustMode ? (
              <p className="text-sm text-muted-foreground">
                Modo de ajuste ativo. Arraste os pontos para ajustar as medições.
                Clique em "Concluir Ajustes" quando terminar.
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                1. Primeiro calibre a imagem usando um objeto de tamanho conhecido.
                <br />
                2. Em seguida, meça o comprimento, largura e as diagonais.
                <br />
                3. Opcionalmente, adicione as medidas específicas (AP, BP, PD, PE, TRAGUS).
              </p>
            )}
            
            {!isAdjustMode && (
              <MeasurementButtons
                calibrationMode={calibrationMode}
                setCalibrationMode={setCalibrationMode}
                measurementMode={measurementMode}
                setMeasurementMode={setMeasurementMode}
                calibrationFactor={calibrationFactor}
                measurements={measurements}
                measurementPoints={measurementPoints}
                calculateMeasurements={calculateMeasurements}
                apMode={apMode}
                setApMode={setApMode}
                bpMode={bpMode}
                setBpMode={setBpMode}
                pdMode={pdMode}
                setPdMode={setPdMode}
                peMode={peMode}
                setPeMode={setPeMode}
                tragusEMode={tragusEMode}
                setTragusEMode={setTragusEMode}
                tragusDMode={tragusDMode}
                setTragusDMode={setTragusDMode}
              />
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
