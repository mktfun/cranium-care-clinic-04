
import { Calendar } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { formatAge } from "@/lib/age-utils";
import { getCranialStatus } from "@/lib/cranial-utils";

interface PacienteCardProps {
  paciente: {
    id: string;
    nome: string;
    dataNascimento?: string;
    data_nascimento?: string;
    ultimaMedicao?: {
      id?: string;
      data: string;
      status?: string;
      indice_craniano?: number;
      indiceCraniano?: number;
      cvai?: number;
    };
  };
}

export function PacienteCard({ paciente }: PacienteCardProps) {
  // Normalize data to handle different property names
  const dataNascimento = paciente.dataNascimento || paciente.data_nascimento || '';
  
  // Get latest measurement data
  const ultimaMedicao = paciente.ultimaMedicao;
  
  // Safely calculate days since last measurement, handling undefined ultimaMedicao
  const calcularDiferencaDias = () => {
    if (!ultimaMedicao?.data) {
      return null;
    }
    
    const dataUltimaMedicao = new Date(ultimaMedicao.data);
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
  const idadeAtual = formatAge(dataNascimento);
  
  // Get asymmetry type and severity level
  let asymmetryType = "Normal";
  let severityLevel = "normal";
  
  if (ultimaMedicao) {
    const cranialIndex = ultimaMedicao.indice_craniano || ultimaMedicao.indiceCraniano || 0;
    const cvai = ultimaMedicao.cvai || 0;
    
    const cranialStatus = getCranialStatus(cranialIndex, cvai);
    asymmetryType = cranialStatus.asymmetryType;
    severityLevel = cranialStatus.severityLevel;
  }
  
  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{paciente.nome}</CardTitle>
          {ultimaMedicao ? (
            <StatusBadge 
              status={severityLevel} 
              asymmetryType={asymmetryType}
              showAsymmetryType={true}
            />
          ) : (
            <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md">
              Sem medição
            </span>
          )}
        </div>
        <div className="text-sm text-muted-foreground">
          {idadeAtual} • Nasc.: {formatarData(dataNascimento)}
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="flex items-center mt-1">
          <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            Última medição: {ultimaMedicao ? formatarData(ultimaMedicao.data) : "Nunca"}
            {diferencaDias && diferencaDias > 30 && (
              <span className="ml-2 text-destructive">({diferencaDias} dias atrás)</span>
            )}
          </span>
        </div>
      </CardContent>
      <CardFooter>
        <div className="w-full flex gap-2">
          <Button asChild className="flex-1 bg-turquesa hover:bg-turquesa/90">
            <Link to={`/pacientes/${paciente.id}`}>Ver detalhes</Link>
          </Button>
          {ultimaMedicao?.id && (
            <Button asChild variant="outline" className="whitespace-nowrap">
              <Link to={`/pacientes/${paciente.id}/medicao/${ultimaMedicao.id}`}>Última medição</Link>
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
