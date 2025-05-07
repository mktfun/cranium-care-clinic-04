
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatusTooltipProps {
  className?: string;
}

export function StatusTooltip({ className }: StatusTooltipProps) {
  const statusDefinitions = [
    { status: "Normal", description: "Desenvolvimento craniano dentro dos padrões esperados, sem indícios de plagiocefalia ou outras deformidades." },
    { status: "Leve", description: "Desvio leve da normalidade, requer monitoramento mas sem necessidade imediata de intervenção." },
    { status: "Moderada", description: "Desvio mais significativo, que pode se beneficiar de intervenção terapêutica." },
    { status: "Severa", description: "Desvio grave, requer intervenção imediata e acompanhamento contínuo." }
  ];

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button className={cn("inline-flex text-muted-foreground hover:text-foreground", className)}>
            <HelpCircle className="h-4 w-4" />
            <span className="sr-only">Ajuda sobre os status</span>
          </button>
        </TooltipTrigger>
        <TooltipContent className="max-w-sm p-4">
          <h4 className="font-medium mb-2">Definições de Status</h4>
          <ul className="space-y-2">
            {statusDefinitions.map((item) => (
              <li key={item.status} className="text-sm">
                <span className="font-medium">{item.status}:</span> {item.description}
              </li>
            ))}
          </ul>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
