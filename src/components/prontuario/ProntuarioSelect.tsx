
import React from "react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Option {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface ProntuarioSelectProps {
  label?: string;
  value: string;
  options: Option[];
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
}

export function ProntuarioSelect({
  label,
  value,
  options,
  onChange,
  className,
  placeholder = "Selecione uma opção...",
  disabled = false,
}: ProntuarioSelectProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {label && <p className="text-sm font-medium text-foreground">{label}</p>}
      <Select
        value={value}
        onValueChange={onChange}
        disabled={disabled}
      >
        <SelectTrigger 
          className="w-full transition-all duration-300 border-primary/20 
          hover:border-primary/60 focus:ring-primary/30 active:scale-[0.98]"
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="animate-enter border-primary/20 bg-card shadow-md">
          {options.map((option) => (
            <SelectItem 
              key={option.value} 
              value={option.value}
              className="transition-colors duration-200 hover:bg-primary/10 focus:bg-primary/10 cursor-pointer"
            >
              <div className="flex items-center gap-2">
                {option.icon && <span className="text-primary/80">{option.icon}</span>}
                <span>{option.label}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
