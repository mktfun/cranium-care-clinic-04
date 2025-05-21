
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type MeasurementButtonProps = {
  label: string;
  mode?: string;
  icon?: string;
  currentMode?: string | null;
  setMeasurementMode?: (mode: string | null) => void;
  setCalibrationMode?: (mode: boolean) => void;
  onClick: () => void;
  disabled: boolean;
  isComplete?: boolean;
  isPoint?: boolean;
  isActive?: boolean;
  className?: string;
  completeClassName?: string;
  description?: string;
  color?: string;
  hoverColor?: string;
  type?: string;
};

export default function MeasurementButton({
  label,
  mode,
  icon,
  currentMode,
  onClick,
  disabled,
  isComplete,
  isPoint,
  isActive,
  className,
  completeClassName
}: MeasurementButtonProps) {
  // Determine which variant to use based on different scenarios
  let variant: "default" | "outline" = "outline";
  
  if (isPoint) {
    // For point-type buttons (AP, BP, etc.)
    if (isActive) {
      variant = "default";
    } else if (isComplete) {
      variant = "outline";
    }
  } else {
    // For measurement-type buttons (comprimento, largura, etc.)
    if (currentMode === mode) {
      variant = "default";
    } else if (isComplete) {
      variant = "outline";
    }
  }

  return (
    <Button
      onClick={onClick}
      variant={variant}
      size="sm"
      disabled={disabled}
      className={cn(
        isComplete && !isActive && !isPoint && "border-green-500 text-green-600",
        isComplete && !isActive && isPoint && completeClassName,
        isPoint && className,
        "text-xs"
      )}
    >
      {label}
      {isComplete && !isActive && (
        <span className="ml-1 text-xs">✓</span>
      )}
    </Button>
  );
}
