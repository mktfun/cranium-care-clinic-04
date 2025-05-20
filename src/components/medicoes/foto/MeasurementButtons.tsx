
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
};

export default function MeasurementButtons({
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
  setTragusDMode
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
      color: "bg-textoEscuro",
      hoverColor: "hover:bg-gray-800"
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

  // Funções para os novos botões
  const handleApClick = () => {
    if (!setApMode) return;
    setApMode(true);
    setMeasurementMode(null);
    setCalibrationMode(false);
    if (setBpMode) setBpMode(false);
    if (setPdMode) setPdMode(false);
    if (setPeMode) setPeMode(false);
    if (setTragusEMode) setTragusEMode(false);
    if (setTragusDMode) setTragusDMode(false);
    
    toast({
      title: "Medindo AP",
      description: "Clique na posição AP na foto",
    });
  };

  const handleBpClick = () => {
    if (!setBpMode) return;
    setBpMode(true);
    setMeasurementMode(null);
    setCalibrationMode(false);
    if (setApMode) setApMode(false);
    if (setPdMode) setPdMode(false);
    if (setPeMode) setPeMode(false);
    if (setTragusEMode) setTragusEMode(false);
    if (setTragusDMode) setTragusDMode(false);
    
    toast({
      title: "Medindo BP",
      description: "Clique na posição BP na foto",
    });
  };

  const handlePdClick = () => {
    if (!setPdMode) return;
    setPdMode(true);
    setMeasurementMode(null);
    setCalibrationMode(false);
    if (setApMode) setApMode(false);
    if (setBpMode) setBpMode(false);
    if (setPeMode) setPeMode(false);
    if (setTragusEMode) setTragusEMode(false);
    if (setTragusDMode) setTragusDMode(false);
    
    toast({
      title: "Medindo PD",
      description: "Clique na posição PD na foto",
    });
  };

  const handlePeClick = () => {
    if (!setPeMode) return;
    setPeMode(true);
    setMeasurementMode(null);
    setCalibrationMode(false);
    if (setApMode) setApMode(false);
    if (setBpMode) setBpMode(false);
    if (setPdMode) setPdMode(false);
    if (setTragusEMode) setTragusEMode(false);
    if (setTragusDMode) setTragusDMode(false);
    
    toast({
      title: "Medindo PE",
      description: "Clique na posição PE na foto",
    });
  };

  const handleTragusEClick = () => {
    if (!setTragusEMode) return;
    setTragusEMode(true);
    setMeasurementMode(null);
    setCalibrationMode(false);
    if (setApMode) setApMode(false);
    if (setBpMode) setBpMode(false);
    if (setPdMode) setPdMode(false);
    if (setPeMode) setPeMode(false);
    if (setTragusDMode) setTragusDMode(false);
    
    toast({
      title: "Medindo TRAGUS E",
      description: "Clique na posição TRAGUS E na foto",
    });
  };

  const handleTragusDClick = () => {
    if (!setTragusDMode) return;
    setTragusDMode(true);
    setMeasurementMode(null);
    setCalibrationMode(false);
    if (setApMode) setApMode(false);
    if (setBpMode) setBpMode(false);
    if (setPdMode) setPdMode(false);
    if (setPeMode) setPeMode(false);
    if (setTragusEMode) setTragusEMode(false);
    
    toast({
      title: "Medindo TRAGUS D",
      description: "Clique na posição TRAGUS D na foto",
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
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
      </div>
      
      {/* Novas medidas */}
      <div className="flex flex-wrap gap-2">
        <Button
          onClick={handleApClick}
          variant={apMode ? "default" : "outline"}
          size="sm"
          disabled={!calibrationFactor || !!measurements}
          className={apMode ? "bg-orange-500 hover:bg-orange-600" : ""}
        >
          AP
        </Button>
        
        <Button
          onClick={handleBpClick}
          variant={bpMode ? "default" : "outline"}
          size="sm"
          disabled={!calibrationFactor || !!measurements}
          className={bpMode ? "bg-orange-500 hover:bg-orange-600" : ""}
        >
          BP
        </Button>
        
        <Button
          onClick={handlePdClick}
          variant={pdMode ? "default" : "outline"}
          size="sm"
          disabled={!calibrationFactor || !!measurements}
          className={pdMode ? "bg-orange-500 hover:bg-orange-600" : ""}
        >
          PD
        </Button>
        
        <Button
          onClick={handlePeClick}
          variant={peMode ? "default" : "outline"}
          size="sm"
          disabled={!calibrationFactor || !!measurements}
          className={peMode ? "bg-orange-500 hover:bg-orange-600" : ""}
        >
          PE
        </Button>
        
        <Button
          onClick={handleTragusEClick}
          variant={tragusEMode ? "default" : "outline"}
          size="sm"
          disabled={!calibrationFactor || !!measurements}
          className={tragusEMode ? "bg-orange-500 hover:bg-orange-600" : ""}
        >
          TRAGUS E
        </Button>
        
        <Button
          onClick={handleTragusDClick}
          variant={tragusDMode ? "default" : "outline"}
          size="sm"
          disabled={!calibrationFactor || !!measurements}
          className={tragusDMode ? "bg-orange-500 hover:bg-orange-600" : ""}
        >
          TRAGUS D
        </Button>
      </div>
      
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

// Importação necessária para toast
import { toast } from "@/hooks/use-toast";
