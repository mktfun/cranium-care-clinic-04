
import React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useIsMobile } from "@/hooks/use-mobile";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export interface MenuOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface ResponsiveMenuProps {
  options: MenuOption[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
  className?: string;
  buttonClassName?: string;
  dropdownClassName?: string;
  mobileBreakpoint?: number;
}

export function ResponsiveMenu({
  options,
  value,
  onChange,
  label,
  className,
  buttonClassName,
  dropdownClassName,
  mobileBreakpoint = 768
}: ResponsiveMenuProps) {
  const isMobile = useIsMobile(mobileBreakpoint);
  const selectedOption = options.find(opt => opt.value === value);

  // Se temos 2 ou menos opções e não estamos em mobile, usar ToggleGroup
  if (options.length <= 2 && !isMobile) {
    return (
      <ToggleGroup
        type="single"
        value={value}
        onValueChange={(val) => val && onChange(val)}
        className={cn("flex justify-center", className)}
      >
        {options.map((option) => (
          <ToggleGroupItem
            key={option.value}
            value={option.value}
            aria-label={option.label}
            className={cn("flex items-center gap-1.5", buttonClassName)}
          >
            {option.icon}
            <span>{option.label}</span>
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    );
  }

  // Para mobile ou menus com mais de 2 opções, usar dropdown
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className={cn("flex items-center gap-1.5", buttonClassName)}
        >
          {selectedOption?.icon}
          <span>{selectedOption?.label || label || "Selecionar"}</span>
          <ChevronDown className="h-4 w-4 ml-1 opacity-70" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="start" 
        className={cn("w-[200px] max-h-[300px] overflow-y-auto", dropdownClassName)}
      >
        {options.map((option) => (
          <DropdownMenuItem
            key={option.value}
            className={cn(
              "flex items-center gap-1.5 cursor-pointer",
              value === option.value && "bg-accent text-accent-foreground"
            )}
            onClick={() => onChange(option.value)}
          >
            {option.icon}
            <span>{option.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
