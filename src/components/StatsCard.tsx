
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export function StatsCard({ title, value, description, icon, trend }: StatsCardProps) {
  return (
    <Card className="group overflow-hidden relative transition-all duration-300 hover:shadow-md border-primary/10 hover:border-primary/30">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
        <CardTitle className="text-sm font-medium transition-colors group-hover:text-primary/90">
          {title}
        </CardTitle>
        {icon && (
          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center transition-all duration-300 group-hover:bg-primary/10 group-hover:scale-110">
            {icon}
          </div>
        )}
      </CardHeader>
      <CardContent className="relative">
        <div className="text-2xl font-bold transition-all duration-300 group-hover:translate-x-1">
          {value}
        </div>
        <div className="flex items-center space-x-2">
          {trend && (
            <span 
              className={cn(
                "text-xs font-medium transition-all duration-300 transform group-hover:scale-110",
                trend.isPositive ? "text-green-500" : "text-destructive"
              )}
            >
              {trend.isPositive ? "+" : "-"}{trend.value}%
            </span>
          )}
          {description && (
            <p className="text-xs text-muted-foreground transition-colors group-hover:text-foreground/80">
              {description}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
