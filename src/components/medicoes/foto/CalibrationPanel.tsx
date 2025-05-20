
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

type CalibrationPanelProps = {
  calibrationMode: boolean;
  setCalibrationMode: (mode: boolean) => void;
  setMeasurementMode: (mode: string | null) => void;
  calibrationFactor: number | null;
  measurements: any;
};

export default function CalibrationPanel({
  calibrationMode,
  setCalibrationMode,
  setMeasurementMode,
  calibrationFactor,
  measurements
}: CalibrationPanelProps) {
  return (
    <Button
      onClick={() => {
        setCalibrationMode(true);
        setMeasurementMode(null);
        toast({
          title: "Modo de calibração",
          description: "Clique em um extremo da sua régua/referência de medida",
        });
      }}
      variant={calibrationMode ? "default" : "outline"}
      size="sm"
      disabled={!!measurements}
      className={calibrationMode ? "bg-yellow-500 hover:bg-yellow-600" : ""}
    >
      {calibrationFactor ? "Recalibrar" : "Calibrar"} Imagem
    </Button>
  );
}
