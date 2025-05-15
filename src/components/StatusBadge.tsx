
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
        return "bg-green-100 text-green-800 hover:bg-green-100 border-green-200";
      case "leve":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-200";
      case "moderada":
        return "bg-orange-100 text-orange-800 hover:bg-orange-100 border-orange-200";
      case "severa":
        return "bg-red-100 text-red-800 hover:bg-red-100 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100 border-gray-200";
    }
  };

  const getStatusText = () => {
    // Se for normal, apenas mostrar "Normal"
    if (status === "normal") return "Normal";
    
    // Se showAsymmetryType for true ou o tipo não for "Normal"
    if (showAsymmetryType || asymmetryType !== "Normal") {
      return `${asymmetryType} ${status.charAt(0).toUpperCase() + status.slice(1)}`;
    }
    
    // Caso contrário, apenas mostrar o status com a primeira letra maiúscula
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <Badge 
      variant="outline" 
      className={`${getBadgeColor()} font-medium border shadow-soft ${className}`}
    >
      {getStatusText()}
    </Badge>
  );
}
