
import { useRef } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";
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
  setMeasurements
}: MeasurementImageCardProps) {
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Imagem para Medição</span>
          {measurements ? (
            <Button
              onClick={() => setMeasurements(null)}
              variant="outline"
              size="sm"
            >
              Refazer Medições
            </Button>
          ) : null}
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
                  calibrationMode || measurementMode ? 'cursor-crosshair' : ''
                }`}
                onClick={handleImageClick}
              />
            )}
            <MeasurementOverlay
              uploadedImage={uploadedImage}
              imageRef={imageRef}
              calibrationStart={calibrationStart}
              calibrationEnd={calibrationEnd}
              measurementPoints={measurementPoints}
            />
          </AspectRatio>
        </div>

        {!measurements && (
          <div className="mt-4 space-y-2">
            <h3 className="font-medium">Instruções para Medição:</h3>
            <p className="text-sm text-muted-foreground">
              1. Primeiro calibre a imagem usando um objeto de tamanho conhecido.
              <br />
              2. Em seguida, meça o comprimento, largura e as diagonais.
            </p>
            
            <MeasurementButtons
              calibrationMode={calibrationMode}
              setCalibrationMode={setCalibrationMode}
              measurementMode={measurementMode}
              setMeasurementMode={setMeasurementMode}
              calibrationFactor={calibrationFactor}
              measurements={measurements}
              measurementPoints={measurementPoints}
              calculateMeasurements={calculateMeasurements}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
