import { Badge } from "@/components/ui/badge";
import { AsymmetryType, SeverityLevel } from "@/types";
import { type CranialDiagnosis } from "@/lib/cranial-classification-utils";

export interface StatusBadgeProps {
  status: SeverityLevel;
  asymmetryType?: AsymmetryType;
  showAsymmetryType?: boolean;
  className?: string;
  variant?: "default" | "enhanced" | "subtle";
  showIcon?: boolean;
  diagnosis?: CranialDiagnosis; // New prop for showing official diagnosis
}

export function StatusBadge({ 
  status, 
  asymmetryType = "Normal", 
  showAsymmetryType = false, 
  className = "",
  variant = "default",
  showIcon = false,
  diagnosis
}: StatusBadgeProps) {
  
  const getBadgeColor = () => {
    if (variant === "enhanced") {
      switch (status) {
        case "normal":
          return "relative bg-gradient-to-r from-green-100/80 to-green-100 text-green-800 dark:from-green-900/30 dark:to-green-900/40 dark:text-green-300 border-green-200 dark:border-green-800/50 shadow-sm";
        case "leve":
          return "relative bg-gradient-to-r from-yellow-100/80 to-yellow-100 text-yellow-800 dark:from-yellow-900/30 dark:to-yellow-900/40 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800/50 shadow-sm";
        case "moderada":
          return "relative bg-gradient-to-r from-orange-100/80 to-orange-100 text-orange-800 dark:from-orange-900/30 dark:to-orange-900/40 dark:text-orange-300 border-orange-200 dark:border-orange-800/50 shadow-sm";
        case "severa":
          return "relative bg-gradient-to-r from-red-100/80 to-red-100 text-red-800 dark:from-red-900/30 dark:to-red-900/40 dark:text-red-300 border-red-200 dark:border-red-800/50 shadow-sm";
        default:
          return "relative bg-gradient-to-r from-gray-100/80 to-gray-100 text-gray-800 dark:from-gray-900/30 dark:to-gray-900/40 dark:text-gray-300 border-gray-200 dark:border-gray-800/50 shadow-sm";
      }
    } else if (variant === "subtle") {
      switch (status) {
        case "normal":
          return "bg-success-muted text-success-muted-foreground border-success/20 dark:bg-success-muted dark:text-success-muted-foreground dark:border-success/10";
        case "leve":
          return "bg-warning-muted text-warning-muted-foreground border-warning/20 dark:bg-warning-muted dark:text-warning-muted-foreground dark:border-warning/10";
        case "moderada":
          return "bg-orange-100/50 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300 border-orange-200/50 dark:border-orange-800/30";
        case "severa":
          return "bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive-foreground border-destructive/20 dark:border-destructive/10";
        default:
          return "bg-muted text-muted-foreground border-border/50";
      }
    } else {
      // Default variant
      switch (status) {
        case "normal":
          return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/40 border-green-200 dark:border-green-800/50";
        case "leve":
          return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 hover:bg-yellow-100 dark:hover:bg-yellow-900/40 border-yellow-200 dark:border-yellow-800/50";
        case "moderada":
          return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 hover:bg-orange-100 dark:hover:bg-orange-900/40 border-orange-200 dark:border-orange-800/50";
        case "severa":
          return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/40 border-red-200 dark:border-red-800/50";
        default:
          return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-900/40 border-gray-200 dark:border-gray-800/50";
      }
    }
  };

  const getStatusText = () => {
    // If we have an official diagnosis, use that
    if (diagnosis) {
      return diagnosis.diagnosis;
    }
    
    // Fallback to existing logic
    if (showAsymmetryType && asymmetryType !== "Normal") {
      return `${asymmetryType} ${status === "normal" ? "" : status}`;
    }
    return status === "normal" ? "Normal" : status.charAt(0).toUpperCase() + status.slice(1);
  };
  
  const getStatusIcon = () => {
    if (!showIcon) return null;
    
    switch (status) {
      case "normal":
        return <span className="mr-1">✓</span>;
      case "leve":
        return <span className="mr-1">⚠️</span>;
      case "moderada":
        return <span className="mr-1">⚠️</span>;
      case "severa":
        return <span className="mr-1">⚠️</span>;
      default:
        return null;
    }
  };
  
  const getAsymmetryStyle = () => {
    if (!showAsymmetryType || asymmetryType === "Normal") return "";
    
    switch (asymmetryType) {
      case "Plagiocefalia":
        return "after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-full after:h-[2px] after:bg-gradient-to-r after:from-transparent after:via-current after:to-transparent after:opacity-30";
      case "Braquicefalia":
        return "after:content-[''] after:absolute after:left-0 after:top-0 after:w-full after:h-[2px] after:bg-gradient-to-r after:from-transparent after:via-current after:to-transparent after:opacity-30";
      case "Dolicocefalia":
        return "after:content-[''] after:absolute after:left-0 after:top-0 after:right-0 after:bottom-0 after:border-l-2 after:border-r-2 after:border-current after:opacity-20 after:rounded-full";
      case "Misto":
        return "after:content-[''] after:absolute after:left-1 after:top-1 after:right-1 after:bottom-1 after:border after:border-dashed after:border-current after:opacity-20 after:rounded-full";
      default:
        return "";
    }
  };

  return (
    <Badge 
      variant="outline" 
      className={`${getBadgeColor()} ${getAsymmetryStyle()} relative font-medium border shadow-sm ${className}`}
    >
      {getStatusIcon()}
      {getStatusText()}
    </Badge>
  );
}
