
import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import DatePicker from "./DatePicker";

interface PatientInfoFormProps {
  pacienteId: string;
  onPacienteIdChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  selectedDate: Date | undefined;
  setSelectedDate: (date: Date | undefined) => void;
  isIdDisabled?: boolean;
}

const PatientInfoForm: React.FC<PatientInfoFormProps> = ({
  pacienteId,
  onPacienteIdChange,
  selectedDate,
  setSelectedDate,
  isIdDisabled = false
}) => {
  return (
    <div className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="pacienteId">ID do Paciente</Label>
        <Input
          type="text"
          id="pacienteId"
          value={pacienteId}
          onChange={onPacienteIdChange}
          disabled={isIdDisabled}
        />
      </div>

      <div className="grid gap-2">
        <Label>Data da Medição</Label>
        <DatePicker
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
        />
      </div>
    </div>
  );
};

export default PatientInfoForm;
