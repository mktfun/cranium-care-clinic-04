
import { Calendar } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { formatAge } from "@/lib/age-utils";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

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

  // Get initials for avatar
  const getInitials = () => {
    return paciente.nome
      .split(' ')
      .map(part => part.charAt(0))
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  // Get background color based on status
  const getStatusColor = () => {
    if (!paciente.ultimaMedicao) return 'bg-gray-50';
    
    switch (paciente.ultimaMedicao.status) {
      case 'normal': return 'bg-green-50';
      case 'leve': return 'bg-yellow-50';
      case 'moderada': return 'bg-orange-50';
      case 'severa': return 'bg-red-50';
      default: return 'bg-gray-50';
    }
  };
  
  return (
    <Card className={cn(
      "h-full border rounded-lg overflow-hidden",
      getStatusColor()
    )}>
      <CardHeader className="pb-2 pt-4 px-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Avatar className="w-8 h-8 bg-gray-100">
              <AvatarFallback className="text-gray-600 text-xs">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle 
                className="text-base font-medium" 
                title={paciente.nome.length > 20 ? paciente.nome : undefined}
              >
                {truncateName(paciente.nome)}
              </CardTitle>
            </div>
          </div>
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
      </CardHeader>
      <CardContent className="px-4 py-2">
        <div className="text-sm text-muted-foreground">
          {idadeAtual} <span className="mx-1">•</span> Nasc.: {formatarData(paciente.dataNascimento)}
        </div>
        <div className="flex items-center mt-2 gap-1">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            Última: {paciente.ultimaMedicao ? formatarData(paciente.ultimaMedicao.data) : "Sem medições"}
            {diferencaDias && diferencaDias > 30 && (
              <span className={cn(
                "ml-1 font-medium",
                diferencaDias > 60 ? "text-red-500" : "text-amber-600"
              )}>
                ({diferencaDias} dias)
              </span>
            )}
          </span>
        </div>
      </CardContent>
      <CardFooter className="p-2">
        <Button 
          asChild 
          className="w-full bg-turquesa hover:bg-turquesa/90"
        >
          <Link to={`/pacientes/${paciente.id}`}>Ver detalhes</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
