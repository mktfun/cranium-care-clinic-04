
import React from "react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";

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
        <SelectTrigger 
          className="w-full relative group overflow-hidden transition-all duration-300 border-primary/20 hover:border-primary/80 focus:ring-primary/40 bg-card hover:bg-card/90 shadow-sm hover:shadow"
        >
          <SelectValue 
            placeholder={placeholder} 
            className="transition-all duration-300"
          />
          <span className="absolute inset-y-0 right-3 flex items-center pointer-events-none group-hover:text-turquesa transition-colors">
            <Plus className="h-4 w-4 text-turquesa transition-transform duration-300 group-data-[state=open]:rotate-45" />
          </span>
        </SelectTrigger>
        <SelectContent 
          className="animate-scale-in border-primary/20 bg-card/95 backdrop-blur-sm shadow-md rounded-md overflow-hidden"
          position="popper"
          sideOffset={5}
        >
          <div className="max-h-[300px] overflow-y-auto p-1">
            {options.map((option) => (
              <SelectItem 
                key={option.value} 
                value={option.value}
                className="rounded-sm my-0.5 transition-colors duration-200 hover:bg-primary/10 focus:bg-primary/15 data-[state=checked]:bg-primary/20 data-[state=checked]:font-medium cursor-pointer"
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
