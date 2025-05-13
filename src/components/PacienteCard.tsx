
import { Calendar } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { formatAge } from "@/lib/age-utils";

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
  
  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{paciente.nome}</CardTitle>
          {paciente.ultimaMedicao ? (
            <StatusBadge 
              status={paciente.ultimaMedicao.status} 
              asymmetryType={paciente.ultimaMedicao.asymmetryType as any}
            />
          ) : (
            <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md">
              Sem medição
            </span>
          )}
        </div>
        <div className="text-sm text-muted-foreground">
          {idadeAtual} • Nasc.: {formatarData(paciente.dataNascimento)}
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="flex items-center mt-1">
          <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            Última medição: {paciente.ultimaMedicao ? formatarData(paciente.ultimaMedicao.data) : "Nunca"}
            {diferencaDias && diferencaDias > 30 && (
              <span className="ml-2 text-destructive">({diferencaDias} dias atrás)</span>
            )}
          </span>
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full bg-turquesa hover:bg-turquesa/90">
          <Link to={`/pacientes/${paciente.id}`}>Ver detalhes</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
