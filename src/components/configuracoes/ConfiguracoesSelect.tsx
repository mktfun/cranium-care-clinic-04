
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
}

interface ConfiguracoesSelectProps {
  label: string;
  value: string;
  options: Option[];
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
}

export function ConfiguracoesSelect({
  label,
  value,
  options,
  onChange,
  className,
  placeholder = "Selecione...",
  disabled = false,
}: ConfiguracoesSelectProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <p className="text-sm font-medium text-foreground">{label}</p>
      <Select
        value={value}
        onValueChange={onChange}
        disabled={disabled}
      >
        <SelectTrigger className="w-full transition-all duration-300 border-primary/20 hover:border-primary/60 focus:ring-primary/30">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="animate-scale-in border-primary/20 bg-card shadow-md">
          {options.map((option) => (
            <SelectItem 
              key={option.value} 
              value={option.value}
              className="transition-colors duration-200 hover:bg-primary/10 focus:bg-primary/10"
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
