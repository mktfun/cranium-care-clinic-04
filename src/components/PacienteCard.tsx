
import { Calendar } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { formatAge } from "@/lib/age-utils";
import { cn } from "@/lib/utils";

interface PacienteCardProps {
  paciente: {
    id: string;
    nome: string;
    dataNascimento: string;
    idadeEmMeses: number;
    ultimaMedicao?: {
      data: string;
      status: "normal" | "leve" | "moderada" | "severa";
      asymmetryType?: string;
    };
  };
}

export function PacienteCard({ paciente }: PacienteCardProps) {
  // Safely calculate days since last measurement, handling undefined ultimaMedicao
  const calcularDiferencaDias = () => {
    if (!paciente.ultimaMedicao?.data) {
      return null;
    }
    
    const dataUltimaMedicao = new Date(paciente.ultimaMedicao.data);
    const hoje = new Date();
    return Math.floor((hoje.getTime() - dataUltimaMedicao.getTime()) / (1000 * 60 * 60 * 24));
  };
  
  const diferencaDias = calcularDiferencaDias();
  
  // Format date for Brazilian format, with null handling
  const formatarData = (dataString?: string) => {
    if (!dataString) return "N/A";
    
    try {
      const data = new Date(dataString);
      return data.toLocaleDateString('pt-BR');
    } catch (e) {
      console.error("Error formatting date:", e);
      return "Data inválida";
    }
  };
  
  // Calculate and format current age
  const idadeAtual = formatAge(paciente.dataNascimento);

  // Truncate long patient names
  const truncateName = (name: string) => {
    return name.length > 20 ? name.substring(0, 20) + '...' : name;
  };
  
  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start gap-2">
          <CardTitle 
            className="text-lg truncate" 
            title={paciente.nome.length > 20 ? paciente.nome : undefined}
          >
            {truncateName(paciente.nome)}
          </CardTitle>
          {paciente.ultimaMedicao ? (
            <StatusBadge 
              status={paciente.ultimaMedicao.status} 
              asymmetryType={paciente.ultimaMedicao.asymmetryType as any}
              className="flex-shrink-0"
            />
          ) : (
            <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md flex-shrink-0">
              Sem medição
            </span>
          )}
        </div>
        <div className="text-sm text-muted-foreground flex flex-wrap gap-1">
          <span className="whitespace-nowrap">{idadeAtual}</span>
          <span className="mx-1 hidden xs:inline">•</span> 
          <span className="whitespace-nowrap">Nasc.: {formatarData(paciente.dataNascimento)}</span>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="flex items-center mt-1 gap-2">
          <Calendar className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
          <span className="text-sm text-muted-foreground truncate">
            {paciente.ultimaMedicao 
              ? <>Última: {formatarData(paciente.ultimaMedicao.data)}</>
              : <>Sem medições</>
            }
            {diferencaDias && diferencaDias > 30 && (
              <span className={cn(
                "ml-2 text-destructive font-medium",
                diferencaDias > 60 ? "text-destructive" : "text-amber-600"
              )}>
                ({diferencaDias} dias)
              </span>
            )}
          </span>
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full bg-turquesa hover:bg-turquesa/90 h-9">
          <Link to={`/pacientes/${paciente.id}`}>Ver detalhes</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
