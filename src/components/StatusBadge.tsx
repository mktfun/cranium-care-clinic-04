
import { Badge } from "@/components/ui/badge";
import { AsymmetryType, SeverityLevel } from "@/types";

export interface StatusBadgeProps {
  status: SeverityLevel;
  asymmetryType?: AsymmetryType;
  showAsymmetryType?: boolean;
  className?: string;
}

export function StatusBadge({ 
  status, 
  asymmetryType = "Normal", 
  showAsymmetryType = false, 
  className = "" 
}: StatusBadgeProps) {
  const getBadgeColor = () => {
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
  };

  const getStatusText = () => {
    if (showAsymmetryType && asymmetryType !== "Normal") {
      return `${asymmetryType} ${status === "normal" ? "" : status}`;
    }
    return status === "normal" ? "Normal" : status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <Badge 
      variant="outline" 
      className={`${getBadgeColor()} font-medium border shadow-sm ${className}`}
    >
      {getStatusText()}
    </Badge>
  );
}
