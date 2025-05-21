
import React from "react";
import { Button } from "@/components/ui/button";
import { Ruler, RadioIcon, CircleOff } from "lucide-react";
import MeasurementButton from "./MeasurementButton";

type MeasurementButtonsProps = {
  calibrationMode: boolean;
  setCalibrationMode: (mode: boolean) => void;
  measurementMode: string | null;
  setMeasurementMode: (mode: string | null) => void;
  calibrationFactor: number | null;
  measurements: any;
  measurementPoints: any[];
  calculateMeasurements: () => void;
  // Novos botões
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
}: MeasurementButtonsProps) => {
  // Safe check to ensure measurementPoints is an array
  const safePoints = Array.isArray(measurementPoints) ? measurementPoints : [];

  // Check if a specific measurement type is complete
  const isMeasurementComplete = (prefix: string) => {
    return safePoints.filter(p => p && p.label && p.label.startsWith(prefix)).length === 2;
  };

  // Check if a specific point is marked
  const isPointMarked = (label: string) => {
    return safePoints.some(p => p && p.label === label);
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
  
  // Check if AP-BP measurements are complete
  const apPointMarked = isPointMarked('ap-point');
  const bpPointMarked = isPointMarked('bp-point');
  
  // Check if PD-PE measurements are complete
  const pdPointMarked = isPointMarked('pd-point');
  const pePointMarked = isPointMarked('pe-point');
  
  // Check if Tragus measurements are complete
  const tragusEPointMarked = isPointMarked('tragusE-point');
  const tragusDPointMarked = isPointMarked('tragusD-point');

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
              // Reset additional modes if they exist
              setApMode?.(false);
              setBpMode?.(false);
              setPdMode?.(false);
              setPeMode?.(false);
              setTragusEMode?.(false);
              setTragusDMode?.(false);
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
            // Reset additional modes if they exist
            setApMode?.(false);
            setBpMode?.(false);
            setPdMode?.(false);
            setPeMode?.(false);
            setTragusEMode?.(false);
            setTragusDMode?.(false);
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
            // Reset additional modes if they exist
            setApMode?.(false);
            setBpMode?.(false);
            setPdMode?.(false);
            setPeMode?.(false);
            setTragusEMode?.(false);
            setTragusDMode?.(false);
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
            // Reset additional modes if they exist
            setApMode?.(false);
            setBpMode?.(false);
            setPdMode?.(false);
            setPeMode?.(false);
            setTragusEMode?.(false);
            setTragusDMode?.(false);
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
            // Reset additional modes if they exist
            setApMode?.(false);
            setBpMode?.(false);
            setPdMode?.(false);
            setPeMode?.(false);
            setTragusEMode?.(false);
            setTragusDMode?.(false);
          }}
          disabled={!calibrationFactor}
          isComplete={diagonalEComplete}
        />

        {/* Additional measurement points */}
        {setApMode && (
          <MeasurementButton
            label="AP"
            isPoint={true}
            isActive={apMode}
            onClick={() => {
              setApMode(true);
              setCalibrationMode(false);
              setMeasurementMode(null);
              setBpMode?.(false);
              setPdMode?.(false);
              setPeMode?.(false);
              setTragusEMode?.(false);
              setTragusDMode?.(false);
            }}
            disabled={!calibrationFactor}
            isComplete={apPointMarked}
            className="bg-orange-500/10 hover:bg-orange-500/20 text-orange-700"
            completeClassName="border-orange-500 text-orange-600"
          />
        )}
        
        {setBpMode && (
          <MeasurementButton
            label="BP"
            isPoint={true}
            isActive={bpMode}
            onClick={() => {
              setBpMode(true);
              setCalibrationMode(false);
              setMeasurementMode(null);
              setApMode?.(false);
              setPdMode?.(false);
              setPeMode?.(false);
              setTragusEMode?.(false);
              setTragusDMode?.(false);
            }}
            disabled={!calibrationFactor}
            isComplete={bpPointMarked}
            className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-700"
            completeClassName="border-blue-500 text-blue-600"
          />
        )}
        
        {setPdMode && (
          <MeasurementButton
            label="PD"
            isPoint={true}
            isActive={pdMode}
            onClick={() => {
              setPdMode(true);
              setCalibrationMode(false);
              setMeasurementMode(null);
              setApMode?.(false);
              setBpMode?.(false);
              setPeMode?.(false);
              setTragusEMode?.(false);
              setTragusDMode?.(false);
            }}
            disabled={!calibrationFactor}
            isComplete={pdPointMarked}
            className="bg-teal-500/10 hover:bg-teal-500/20 text-teal-700"
            completeClassName="border-teal-500 text-teal-600"
          />
        )}
        
        {setPeMode && (
          <MeasurementButton
            label="PE"
            isPoint={true}
            isActive={peMode}
            onClick={() => {
              setPeMode(true);
              setCalibrationMode(false);
              setMeasurementMode(null);
              setApMode?.(false);
              setBpMode?.(false);
              setPdMode?.(false);
              setTragusEMode?.(false);
              setTragusDMode?.(false);
            }}
            disabled={!calibrationFactor}
            isComplete={pePointMarked}
            className="bg-pink-500/10 hover:bg-pink-500/20 text-pink-700"
            completeClassName="border-pink-500 text-pink-600"
          />
        )}
        
        {setTragusEMode && (
          <MeasurementButton
            label="TRAG-E"
            isPoint={true}
            isActive={tragusEMode}
            onClick={() => {
              setTragusEMode(true);
              setCalibrationMode(false);
              setMeasurementMode(null);
              setApMode?.(false);
              setBpMode?.(false);
              setPdMode?.(false);
              setPeMode?.(false);
              setTragusDMode?.(false);
            }}
            disabled={!calibrationFactor}
            isComplete={tragusEPointMarked}
            className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-700"
            completeClassName="border-amber-500 text-amber-600"
          />
        )}
        
        {setTragusDMode && (
          <MeasurementButton
            label="TRAG-D"
            isPoint={true}
            isActive={tragusDMode}
            onClick={() => {
              setTragusDMode(true);
              setCalibrationMode(false);
              setMeasurementMode(null);
              setApMode?.(false);
              setBpMode?.(false);
              setPdMode?.(false);
              setPeMode?.(false);
              setTragusEMode?.(false);
            }}
            disabled={!calibrationFactor}
            isComplete={tragusDPointMarked}
            className="bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-700"
            completeClassName="border-cyan-500 text-cyan-600"
          />
        )}

        {/* Calculate Button */}
        <Button
          size="sm"
          className="col-span-3 md:col-span-1 bg-turquesa hover:bg-turquesa/90"
          disabled={
            !calibrationFactor || 
            !allPrimaryMeasurementsComplete ||
            calibrationMode || 
            !!measurementMode ||
            apMode || 
            bpMode || 
            pdMode || 
            peMode ||
            tragusEMode ||
            tragusDMode
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

// Import at the component level so it's available in this file
import MeasurementLegend from "./MeasurementLegend";

export default MeasurementButtons;
