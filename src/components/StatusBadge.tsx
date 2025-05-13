
import { Badge } from "@/components/ui/badge";
import { AsymmetryType, SeverityLevel } from "@/types";

export interface StatusBadgeProps {
  status?: SeverityLevel;
  asymmetryType?: AsymmetryType;
}

export function StatusBadge({ status = "normal", asymmetryType = "Normal" }: StatusBadgeProps) {
  const getBadgeVariant = () => {
    switch (status) {
      case "normal":
        return "outline";
      case "leve":
        return "default";
      case "moderada":
        return "secondary";
      case "severa":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getBadgeText = () => {
    if (asymmetryType === "Normal") return "Normal";
    return `${asymmetryType} ${status !== "normal" ? status : "leve"}`;
  };

  return (
    <Badge variant={getBadgeVariant() as any} className="capitalize">
      {getBadgeText()}
    </Badge>
  );
}
