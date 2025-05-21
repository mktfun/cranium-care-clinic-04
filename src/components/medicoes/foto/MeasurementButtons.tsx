
import React from "react";
import { Button } from "@/components/ui/button";
import { Ruler, RadioIcon } from "lucide-react";
import MeasurementButton from "./MeasurementButton";
import MeasurementLegend from "./MeasurementLegend";

type MeasurementButtonsProps = {
  calibrationMode: boolean;
  setCalibrationMode: (mode: boolean) => void;
  measurementMode: string | null;
  setMeasurementMode: (mode: string | null) => void;
  calibrationFactor: number | null;
  measurements: any;
  measurementPoints: any[];
  calculateMeasurements: () => void;
};

const MeasurementButtons = ({
  calibrationMode,
  setCalibrationMode,
  measurementMode,
  setMeasurementMode,
  calibrationFactor,
  measurements,
  measurementPoints,
  calculateMeasurements,
}: MeasurementButtonsProps) => {
  // Safe check to ensure measurementPoints is an array
  const safePoints = Array.isArray(measurementPoints) ? measurementPoints : [];

  // Check if a specific measurement type is complete
  const isMeasurementComplete = (prefix: string) => {
    return safePoints.filter(p => p && p.label && p.label.startsWith(prefix)).length === 2;
  };

  // Helpers to check if primary measurements are ready
  const comprimentoComplete = isMeasurementComplete('comprimento');
  const larguraComplete = isMeasurementComplete('largura');
  const diagonalDComplete = isMeasurementComplete('diagonalD');
  const diagonalEComplete = isMeasurementComplete('diagonalE');

  // Check if all primary measurements are complete
  const allPrimaryMeasurementsComplete = 
    comprimentoComplete && 
    larguraComplete && 
    diagonalDComplete && 
    diagonalEComplete;

  return (
    <div>
      <div className="grid grid-cols-3 md:flex md:flex-wrap gap-2">
        {/* Calibration button */}
        <Button
          size="sm"
          variant={calibrationMode ? "default" : calibrationFactor ? "outline" : "destructive"}
          className={calibrationFactor ? "border-green-500 text-green-600" : ""}
          onClick={() => {
            if (!calibrationMode) {
              setCalibrationMode(true);
              setMeasurementMode(null);
            } else {
              setCalibrationMode(false);
            }
          }}
        >
          <Ruler className="h-4 w-4 mr-1" />
          <span>Calibração</span>
          {calibrationFactor && !calibrationMode && (
            <span className="ml-1 text-xs text-green-600">✓</span>
          )}
        </Button>

        {/* Primary measurement buttons */}
        <MeasurementButton
          label="Comprimento"
          mode="comprimento"
          icon="horizontal"
          currentMode={measurementMode}
          onClick={() => {
            setMeasurementMode('comprimento');
            setCalibrationMode(false);
          }}
          disabled={!calibrationFactor}
          isComplete={comprimentoComplete}
        />

        <MeasurementButton
          label="Largura"
          mode="largura"
          icon="vertical"
          currentMode={measurementMode}
          onClick={() => {
            setMeasurementMode('largura');
            setCalibrationMode(false);
          }}
          disabled={!calibrationFactor}
          isComplete={larguraComplete}
        />

        <MeasurementButton
          label="Diagonal D"
          mode="diagonalD"
          icon="diagonal-right"
          currentMode={measurementMode}
          onClick={() => {
            setMeasurementMode('diagonalD');
            setCalibrationMode(false);
          }}
          disabled={!calibrationFactor}
          isComplete={diagonalDComplete}
        />

        <MeasurementButton
          label="Diagonal E"
          mode="diagonalE"
          icon="diagonal-left"
          currentMode={measurementMode}
          onClick={() => {
            setMeasurementMode('diagonalE');
            setCalibrationMode(false);
          }}
          disabled={!calibrationFactor}
          isComplete={diagonalEComplete}
        />

        {/* Calculate Button */}
        <Button
          size="sm"
          className="col-span-3 md:col-span-1 bg-turquesa hover:bg-turquesa/90"
          disabled={
            !calibrationFactor || 
            !allPrimaryMeasurementsComplete ||
            calibrationMode || 
            !!measurementMode
          }
          onClick={calculateMeasurements}
        >
          <RadioIcon className="h-4 w-4 mr-1" />
          <span>Calcular Medidas</span>
        </Button>
      </div>

      <div className="mt-4">
        <MeasurementLegend />
      </div>
    </div>
  );
};

export default MeasurementButtons;
