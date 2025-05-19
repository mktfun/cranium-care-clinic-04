
import React from "react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileText, ChevronDown } from "lucide-react";

interface TabOption {
  value: string;
  label: string;
}

interface AnimatedProntuarioSelectProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function AnimatedProntuarioSelect({
  value,
  onChange,
  className,
}: AnimatedProntuarioSelectProps) {
  const options: TabOption[] = [
    { value: "dados-pessoais", label: "Dados Pessoais" },
    { value: "historico-medico", label: "Histórico Médico" },
    { value: "consultas", label: "Consultas" },
    { value: "avaliacoes-craniais", label: "Avaliações Craniais" },
  ];

  return (
    <div className={cn("w-full", className)}>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger 
          className="w-full relative group transition-all duration-300 border-primary/20 hover:border-primary/60 focus:ring-primary/30 bg-gradient-to-b from-card to-card/95 shadow-sm hover:shadow py-3"
        >
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary/70 group-hover:text-primary transition-colors duration-300" />
            <SelectValue 
              placeholder="Selecione uma seção" 
              className="transition-all duration-300"
            />
          </div>
          <span className="absolute inset-y-0 right-3 flex items-center pointer-events-none group-hover:text-primary transition-colors">
            <ChevronDown className="h-4 w-4 transition-transform duration-300 group-data-[state=open]:rotate-180" />
          </span>
        </SelectTrigger>
        <SelectContent 
          className="animate-enter border-primary/20 bg-card/95 backdrop-blur-sm shadow-lg rounded-md overflow-hidden"
          position="popper"
          sideOffset={5}
        >
          <div className="max-h-[300px] overflow-y-auto p-1">
            {options.map((option) => (
              <SelectItem 
                key={option.value} 
                value={option.value}
                className="rounded-sm my-1 py-3 transition-all duration-200 hover:bg-primary/10 focus:bg-primary/15 data-[state=checked]:bg-primary/20 data-[state=checked]:font-medium cursor-pointer"
              >
                {option.label}
              </SelectItem>
            ))}
          </div>
        </SelectContent>
      </Select>
    </div>
  );
}
