
import { Button } from "@/components/ui/button";
import { Edit3, Plus, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface PatientHeaderProps {
  paciente: {
    id: string;
    nome: string;
  };
  idadeAtual: string;
  formatarData: (dataString: string) => string;
  dataNascimento: string;
  onEditClick: () => void;
}

export function PatientHeader({ 
  paciente, 
  idadeAtual, 
  formatarData, 
  dataNascimento, 
  onEditClick 
}: PatientHeaderProps) {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  // Truncate long patient names on mobile
  const displayName = isMobile && paciente.nome.length > 18 
    ? paciente.nome.substring(0, 18) + '...' 
    : paciente.nome;

  return (
    <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:items-center md:justify-between">
      <div>
        <h2 className={cn(
          "font-bold truncate max-w-[90vw] md:max-w-md",
          isMobile ? "text-2xl" : "text-3xl"
        )}
        title={paciente.nome.length > 18 && isMobile ? paciente.nome : undefined}>
          {displayName}
        </h2>
        <p className="text-muted-foreground text-sm md:text-base flex flex-wrap gap-1">
          <span className="whitespace-nowrap">{idadeAtual}</span>
          <span className="mx-1 hidden xs:inline">•</span>
          <span className="whitespace-nowrap">Nasc.: {formatarData(dataNascimento)}</span>
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button 
          variant="outline" 
          size={isMobile ? "sm" : "default"}
          className="flex items-center gap-1 md:gap-2 h-9" 
          onClick={onEditClick}
        >
          <Edit3 className="h-4 w-4" />
          <span className={isMobile ? "sr-only md:not-sr-only" : ""}>Editar</span>
        </Button>
        
        <Button 
          variant="outline"
          size={isMobile ? "sm" : "default"}
          className="flex items-center gap-1 md:gap-2 h-9"
          onClick={() => navigate(`/pacientes/${paciente.id}/prontuario`)}
        >
          <FileText className="h-4 w-4" />
          <span className={isMobile ? "sr-only md:not-sr-only" : ""}>Prontuário</span>
        </Button>
        
        <Button 
          className="flex items-center gap-1 md:gap-2 bg-turquesa hover:bg-turquesa/90 h-9"
          size={isMobile ? "sm" : "default"}
          onClick={() => navigate(`/pacientes/${paciente.id}/nova-medicao`)}
        >
          <Plus className="h-4 w-4" />
          <span>Nova Medição</span>
        </Button>
      </div>
    </div>
  );
}
