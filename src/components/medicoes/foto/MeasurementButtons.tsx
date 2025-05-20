
import { Button } from "@/components/ui/button";
import CalibrationPanel from "./CalibrationPanel";
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
};

export default function MeasurementButtons({
  calibrationMode,
  setCalibrationMode,
  measurementMode,
  setMeasurementMode,
  calibrationFactor,
  measurements,
  measurementPoints,
  calculateMeasurements
}: MeasurementButtonsProps) {
  
  const measurementButtons = [
    {
      type: "comprimento",
      label: "Comprimento",
      description: "Clique nos pontos mais anterior e posterior da cabeça",
      color: "bg-red-500",
      hoverColor: "hover:bg-red-600"
    },
    {
      type: "largura",
      label: "Largura",
      description: "Clique nos pontos mais laterais da cabeça",
      color: "bg-blue-500",
      hoverColor: "hover:bg-blue-600"
    },
    {
      type: "diagonalD",
      label: "Diagonal D",
      description: "Clique para marcar a diagonal direita da cabeça",
      color: "bg-green-500",
      hoverColor: "hover:bg-green-600"
    },
    {
      type: "diagonalE",
      label: "Diagonal E",
      description: "Clique para marcar a diagonal esquerda da cabeça",
      color: "bg-purple-500",
      hoverColor: "hover:bg-purple-600"
    }
  ];

  return (
    <div className="flex flex-wrap gap-2 mt-4">
      <CalibrationPanel
        calibrationMode={calibrationMode}
        setCalibrationMode={setCalibrationMode}
        setMeasurementMode={setMeasurementMode}
        calibrationFactor={calibrationFactor}
        measurements={measurements}
      />
      
      {measurementButtons.map((button) => (
        <MeasurementButton
          key={button.type}
          type={button.type}
          label={button.label}
          description={button.description}
          color={button.color}
          hoverColor={button.hoverColor}
          currentMode={measurementMode}
          setMeasurementMode={setMeasurementMode}
          setCalibrationMode={setCalibrationMode}
          disabled={!calibrationFactor || !!measurements}
        />
      ))}
      
      <Button
        onClick={calculateMeasurements}
        className="w-full mt-4 bg-turquesa hover:bg-turquesa/90"
        disabled={
          !calibrationFactor || 
          measurementPoints.filter(p => p.label.startsWith('comprimento')).length !== 2 ||
          measurementPoints.filter(p => p.label.startsWith('largura')).length !== 2 ||
          measurementPoints.filter(p => p.label.startsWith('diagonalD')).length !== 2 ||
          measurementPoints.filter(p => p.label.startsWith('diagonalE')).length !== 2
        }
      >
        Calcular Medidas
      </Button>
    </div>
  );
}
