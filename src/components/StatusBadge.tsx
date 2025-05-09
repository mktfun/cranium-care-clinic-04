
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { AsymmetryType, SeverityLevel } from "@/lib/cranial-utils";

interface StatusBadgeProps {
  status: SeverityLevel;
  asymmetryType?: AsymmetryType | string; // Allow both AsymmetryType and string
  className?: string;
  showAsymmetryType?: boolean;
}

export function StatusBadge({ status, asymmetryType, className, showAsymmetryType = true }: StatusBadgeProps) {
  const getStatusColor = (status: SeverityLevel) => {
    switch (status) {
      case "normal":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30";
      case "leve":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 hover:bg-yellow-100 dark:hover:bg-yellow-900/30";
      case "moderada":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-900/30";
      case "severa":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30";
      default:
        return "";
    }
  };

  const getStatusText = () => {
    if (!asymmetryType || !showAsymmetryType) {
      return status;
    } else if (asymmetryType === "Normal") {
      return "Normal";
    } else {
      return `${asymmetryType} (${status === 'normal' ? 'leve' : status})`;
    }
  };

  return (
    <Badge 
      variant="outline" 
      className={cn("font-medium capitalize", getStatusColor(status), className)}
    >
      {getStatusText()}
    </Badge>
  );
}
