
import { Badge } from "@/components/ui/badge";
import { AsymmetryType, SeverityLevel } from "@/types";

export interface StatusBadgeProps {
  status: SeverityLevel;
  asymmetryType?: AsymmetryType;
  showAsymmetryType?: boolean;
  className?: string; // Add className prop
}

export function StatusBadge({ status, asymmetryType = "Normal", showAsymmetryType = false, className = "" }: StatusBadgeProps) {
  const getBadgeColor = () => {
    switch (status) {
      case "normal":
        return "bg-green-100 text-green-800 hover:bg-green-100";
      case "leve":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
      case "moderada":
        return "bg-orange-100 text-orange-800 hover:bg-orange-100";
      case "severa":
        return "bg-red-100 text-red-800 hover:bg-red-100";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
    }
  };

  const getStatusText = () => {
    if (showAsymmetryType && asymmetryType !== "Normal") {
      return `${asymmetryType} ${status === "normal" ? "" : status}`;
    }
    return status === "normal" ? "Normal" : status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <Badge variant="outline" className={`${getBadgeColor()} font-medium border-0 ${className}`}>
      {getStatusText()}
    </Badge>
  );
}
