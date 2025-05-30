
import { Button } from "@/components/ui/button";
import { BarChart3, TrendingUp, BarChart4 } from "lucide-react";
import { ChartType } from "@/hooks/useChartType";
import { cn } from "@/lib/utils";

interface ChartTypeToggleProps {
  currentType: ChartType;
  onTypeChange: (type: ChartType) => void;
  size?: "sm" | "default";
}

export function ChartTypeToggle({ currentType, onTypeChange, size = "default" }: ChartTypeToggleProps) {
  const chartTypes: { type: ChartType; icon: React.ReactNode; label: string }[] = [
    { type: "bar", icon: <BarChart3 className="h-4 w-4" />, label: "Barras" },
    { type: "line", icon: <TrendingUp className="h-4 w-4" />, label: "Linha" },
    { type: "combined", icon: <BarChart4 className="h-4 w-4" />, label: "Combinado" }
  ];

  const buttonSize = size === "sm" ? "sm" : "default";
  const iconSize = size === "sm" ? "h-3 w-3" : "h-4 w-4";

  return (
    <div className="flex gap-1 border rounded-md p-1 bg-muted/30">
      {chartTypes.map(({ type, icon, label }) => (
        <Button
          key={type}
          variant={currentType === type ? "default" : "ghost"}
          size={buttonSize}
          onClick={() => onTypeChange(type)}
          className={cn(
            "transition-all duration-200",
            currentType === type && "bg-primary text-primary-foreground shadow-sm"
          )}
          title={label}
        >
          <span className={iconSize}>{icon}</span>
          {size !== "sm" && <span className="ml-1 text-xs">{label}</span>}
        </Button>
      ))}
    </div>
  );
}
