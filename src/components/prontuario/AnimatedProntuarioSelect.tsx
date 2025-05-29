
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Baby, Clipboard, Brain, Stethoscope, Activity, FileCheck } from "lucide-react";

const tabOptions = [
  { value: "dados-do-bebe", label: "Dados do Bebê", icon: Baby },
  { value: "anamnese-avaliacao", label: "Anamnese/Avaliação", icon: Clipboard },
  { value: "avaliacao-cranio", label: "Avaliação Crânio", icon: Brain },
  { value: "conduta", label: "Conduta", icon: Stethoscope },
  { value: "diagnostico", label: "Diagnóstico", icon: Activity },
  { value: "prescricao", label: "Prescrição", icon: FileCheck },
];

interface AnimatedProntuarioSelectProps {
  value: string;
  onChange: (value: string) => void;
}

export function AnimatedProntuarioSelect({ value, onChange }: AnimatedProntuarioSelectProps) {
  const currentTab = tabOptions.find(tab => tab.value === value);

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full">
        <SelectValue>
          {currentTab && (
            <div className="flex items-center gap-2">
              <currentTab.icon className="h-4 w-4" />
              {currentTab.label}
            </div>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {tabOptions.map((tab) => (
          <SelectItem key={tab.value} value={tab.value}>
            <div className="flex items-center gap-2">
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
