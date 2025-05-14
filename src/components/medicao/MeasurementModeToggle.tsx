
import React from 'react';
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface MeasurementModeToggleProps {
  isManualInput: boolean;
  onToggle: () => void;
}

const MeasurementModeToggle: React.FC<MeasurementModeToggleProps> = ({
  isManualInput,
  onToggle
}) => {
  return (
    <div className="flex items-center space-x-2">
      <Label htmlFor="manualInput">Entrada Manual</Label>
      <Switch id="manualInput" checked={isManualInput} onCheckedChange={onToggle} />
    </div>
  );
};

export default MeasurementModeToggle;
