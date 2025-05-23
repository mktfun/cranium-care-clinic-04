
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, FileText, Calendar, Stethoscope } from "lucide-react";

interface AnimatedProntuarioSelectProps {
  value: string;
  onChange: (value: string) => void;
}

const prontuarioOptions = [
  { value: "dados-pessoais", label: "Dados Pessoais", icon: User },
  { value: "historico-medico", label: "Histórico Médico", icon: FileText },
  { value: "avaliacao", label: "Avaliação", icon: Stethoscope },
  { value: "consultas", label: "Consultas", icon: Calendar },
  { value: "avaliacoes-craniais", label: "Avaliações Craniais", icon: FileText }
];

export function AnimatedProntuarioSelect({ value, onChange }: AnimatedProntuarioSelectProps) {
  const currentOption = prontuarioOptions.find(option => option.value === value);
  const IconComponent = currentOption?.icon || User;

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full">
        <SelectValue>
          <div className="flex items-center gap-2">
            <IconComponent className="h-4 w-4" />
            {currentOption?.label}
          </div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {prontuarioOptions.map((option) => {
          const Icon = option.icon;
          return (
            <SelectItem key={option.value} value={option.value}>
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4" />
                {option.label}
              </div>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
