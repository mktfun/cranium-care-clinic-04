
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

type MeasurementButtonProps = {
  type: string;
  label: string;
  description: string;
  color: string;
  hoverColor: string;
  currentMode: string | null;
  setMeasurementMode: (mode: string | null) => void;
  setCalibrationMode: (mode: boolean) => void;
  disabled: boolean;
};

export default function MeasurementButton({
  type,
  label,
  description,
  color,
  hoverColor,
  currentMode,
  setMeasurementMode,
  setCalibrationMode,
  disabled
}: MeasurementButtonProps) {
  return (
    <Button
      onClick={() => {
        setMeasurementMode(type);
        setCalibrationMode(false);
        toast({
          title: `Medindo ${label.toLowerCase()}`,
          description,
        });
      }}
      variant={currentMode === type ? "default" : "outline"}
      size="sm"
      disabled={disabled}
      className={currentMode === type ? `${color} ${hoverColor}` : ""}
    >
      {label}
    </Button>
  );
}
